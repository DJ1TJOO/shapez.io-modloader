import { SmartBalancerComponent } from "../components/smart_balancer";

const Vector = shapezAPI.exports.Vector;
const enumDirection = shapezAPI.exports.enumDirection;
const enumAngleToDirection = shapezAPI.exports.enumAngleToDirection;
const enumHubGoalRewards = shapezAPI.exports.enumHubGoalRewards;
const generateMatrixRotations = shapezAPI.exports.generateMatrixRotations;
const enumItemProcessorTypes = shapezAPI.exports.enumItemProcessorTypes;
const formatItemsPerSecond = shapezAPI.exports.formatItemsPerSecond;

const smartRotationVariants = {
    center: "center",
    left: "left",
    right: "right",
    all: "all",
    both: "both",
};

const numberToRotationVariant = {
    0: smartRotationVariants.center,
    1: smartRotationVariants.left,
    2: smartRotationVariants.right,
    3: smartRotationVariants.all,
    4: smartRotationVariants.both,
};

export const addBalancerVariants = () => {
    const balancer = shapezAPI.ingame.buildings.balancer;

    //Custom direction
    balancer.prototype.computeOptimalDirectionAndRotationVariantAtTile = function({ root, tile, rotation, variant, layer }) {
        if (variant !== balancer.variants["merger-triple"] && variant !== balancer.variants["splitter-triple"]) {
            return {
                rotation,
                rotationVariant: 0,
            };
        }
        const topDirection = enumAngleToDirection[rotation];
        const rightDirection = enumAngleToDirection[(rotation + 90) % 360];
        const bottomDirection = enumAngleToDirection[(rotation + 180) % 360];
        const leftDirection = enumAngleToDirection[(rotation + 270) % 360];

        const { ejectors, acceptors } = root.logic.getEjectorsAndAcceptorsAtTile(tile, false);

        let rotationVariant = 0;

        let hasRightConnector = false;
        let hasLeftConnector = false;
        let hasCenterConnector = false;
        if (variant == balancer.variants["merger-triple"]) {
            for (let i = 0; i < ejectors.length; ++i) {
                const ejector = ejectors[i];

                if (ejector.toDirection === leftDirection) {
                    hasRightConnector = true;
                } else if (ejector.toDirection === rightDirection) {
                    hasLeftConnector = true;
                } else if (ejector.toDirection === topDirection) {
                    hasCenterConnector = true;
                }
            }
        } else {
            for (let i = 0; i < acceptors.length; ++i) {
                const acceptor = acceptors[i];
                if (acceptor.fromDirection === rightDirection) {
                    hasLeftConnector = true;
                } else if (acceptor.fromDirection === leftDirection) {
                    hasRightConnector = true;
                } else if (acceptor.fromDirection === bottomDirection) {
                    hasCenterConnector = true;
                }
            }
        }

        if (hasRightConnector) {
            rotationVariant = hasLeftConnector ? (hasCenterConnector ? 3 : 4) : 2;
        } else if (hasLeftConnector) {
            rotationVariant = 1;
        }

        return {
            rotation,
            rotationVariant: rotationVariant,
        };
    };

    //Add custom sprites
    balancer.prototype.getPreviewSprite = function(rotationVariant, variant) {
        switch (variant) {
            case balancer.variants["merger-triple"]:
            case balancer.variants["splitter-triple"]:
                return shapezAPI.exports.Loader.getSprite("sprites/buildings/balancer" + "-" + variant + "_" + numberToRotationVariant[rotationVariant] + ".png");
            default:
                return shapezAPI.exports.Loader.getSprite("sprites/buildings/" + this.id + (variant === shapezAPI.exports.defaultBuildingVariant ? "" : "-" + variant) + ".png");
        }
    };
    balancer.prototype.getBlueprintSprite = function(rotationVariant, variant) {
        switch (variant) {
            case balancer.variants["merger-triple"]:
            case balancer.variants["splitter-triple"]:
                return shapezAPI.exports.Loader.getSprite("sprites/blueprints/balancer" + "-" + variant + "_" + numberToRotationVariant[rotationVariant] + ".png");
            default:
                return shapezAPI.exports.Loader.getSprite("sprites/blueprints/" + this.id + (variant === shapezAPI.exports.defaultBuildingVariant ? "" : "-" + variant) + ".png");
        }
    };

    balancer.prototype.getSprite = function(rotationVariant, variant) {
        return this.getPreviewSprite(rotationVariant, variant);
    };

    //Remove existing variants
    balancer.avaibleVariants[balancer.variants.merger] = () => false;
    balancer.avaibleVariants[balancer.variants.splitter] = () => false;
    balancer.avaibleVariants[balancer.variants.mergerInverse] = () => false;
    balancer.avaibleVariants[balancer.variants.splitterInverse] = () => false;

    //Add rotation variants
    balancer.rotationVariants = [0, 1, 2, 3, 4];

    //Add triple merger
    const name = "merger-triple";
    const mergerMatrices = {
        0: generateMatrixRotations([0, 1, 0, 0, 1, 0, 0, 1, 0]),
        1: generateMatrixRotations([0, 1, 0, 1, 1, 0, 0, 1, 0]),
        2: generateMatrixRotations([0, 1, 0, 0, 1, 1, 0, 1, 0]),
        3: generateMatrixRotations([0, 1, 0, 1, 1, 1, 0, 1, 0]),
        4: generateMatrixRotations([0, 1, 0, 1, 1, 1, 0, 0, 0]),
    };

    balancer.variants[name] = name;
    balancer.avaibleVariants[name] = (root) => root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_merger);
    balancer.overlayMatrices[name] = (entity, rotationVariant) => {
        return mergerMatrices[rotationVariant];
    };
    balancer.dimensions[name] = () => new Vector(1, 1);
    balancer.silhouetteColors[name] = () => "#555759";
    balancer.isRemovable[name] = () => true;
    balancer.isRotateable[name] = () => true;
    balancer.renderPins[name] = () => null;
    balancer.layerPreview[name] = () => null;
    balancer.layerByVariant[name] = (root) => "regular";
    balancer.componentVariations[name] = (entity, rotationVariant) => {
        if (!entity.components.SmartBalancer) {
            entity.addComponent(new SmartBalancerComponent({ variant: name }));
        }
        entity.components.BeltUnderlays.underlays = [{ pos: new Vector(0, 0), direction: enumDirection.top }];
        switch (numberToRotationVariant[rotationVariant]) {
            case smartRotationVariants.center:
                entity.components.ItemEjector.setSlots([{ pos: new Vector(0, 0), direction: enumDirection.top }]);
                entity.components.ItemAcceptor.setSlots([{ pos: new Vector(0, 0), directions: [enumDirection.bottom] }]);
                break;
            case smartRotationVariants.left:
            case smartRotationVariants.right:
                {
                    entity.components.ItemEjector.setSlots([{ pos: new Vector(0, 0), direction: enumDirection.top }]);
                    entity.components.ItemAcceptor.setSlots([
                        { pos: new Vector(0, 0), directions: [enumDirection.bottom] },
                        {
                            pos: new Vector(0, 0),
                            directions: numberToRotationVariant[rotationVariant] == smartRotationVariants.left ? [enumDirection.left] : [enumDirection.right],
                        },
                    ]);
                    break;
                }
            case smartRotationVariants.all:
                {
                    entity.components.ItemEjector.setSlots([{ pos: new Vector(0, 0), direction: enumDirection.top }]);
                    entity.components.ItemAcceptor.setSlots([
                        { pos: new Vector(0, 0), directions: [enumDirection.left] },
                        { pos: new Vector(0, 0), directions: [enumDirection.bottom] },
                        { pos: new Vector(0, 0), directions: [enumDirection.right] },
                    ]);
                    break;
                }
            case smartRotationVariants.both:
                {
                    entity.components.ItemEjector.setSlots([{ pos: new Vector(0, 0), direction: enumDirection.top }]);
                    entity.components.ItemAcceptor.setSlots([
                        { pos: new Vector(0, 0), directions: [enumDirection.left] },
                        { pos: new Vector(0, 0), directions: [enumDirection.right] },
                    ]);
                    break;
                }
        }
    };
    balancer.additionalStatistics[name] = (root) => {
        let speedMultiplier = 1;
        const speed = (root.hubGoals.getProcessorBaseSpeed(enumItemProcessorTypes.balancer) / 2) * speedMultiplier;
        return [
            [shapezAPI.translations.ingame.buildingPlacement.infoTexts.speed, formatItemsPerSecond(speed)]
        ];
    };

    //Add triple splitter
    const nameSplitter = "splitter-triple";
    const splitterMatrices = {
        0: generateMatrixRotations([0, 1, 0, 0, 1, 0, 0, 1, 0]),
        1: generateMatrixRotations([0, 1, 0, 1, 1, 0, 0, 1, 0]),
        2: generateMatrixRotations([0, 1, 0, 0, 1, 1, 0, 1, 0]),
        3: generateMatrixRotations([0, 1, 0, 1, 1, 1, 0, 1, 0]),
        4: generateMatrixRotations([0, 1, 0, 1, 1, 1, 0, 0, 0]),
    };

    balancer.variants[nameSplitter] = nameSplitter;
    balancer.avaibleVariants[nameSplitter] = (root) => root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_merger);
    balancer.overlayMatrices[nameSplitter] = (entity, rotationVariant) => {
        return splitterMatrices[rotationVariant];
    };
    balancer.dimensions[nameSplitter] = () => new Vector(1, 1);
    balancer.silhouetteColors[nameSplitter] = () => "#555759";
    balancer.isRemovable[nameSplitter] = () => true;
    balancer.isRotateable[nameSplitter] = () => true;
    balancer.renderPins[nameSplitter] = () => null;
    balancer.layerPreview[nameSplitter] = () => null;
    balancer.layerByVariant[nameSplitter] = (root) => "regular";
    balancer.componentVariations[nameSplitter] = (entity, rotationVariant) => {
        if (!entity.components.SmartBalancer) {
            entity.addComponent(new SmartBalancerComponent({ variant: nameSplitter }));
        }
        entity.components.BeltUnderlays.underlays = [{ pos: new Vector(0, 0), direction: enumDirection.top }];
        switch (numberToRotationVariant[rotationVariant]) {
            case smartRotationVariants.center:
                entity.components.ItemEjector.setSlots([{ pos: new Vector(0, 0), direction: enumDirection.top }]);
                entity.components.ItemAcceptor.setSlots([{ pos: new Vector(0, 0), directions: [enumDirection.bottom] }]);
                break;
            case smartRotationVariants.left:
            case smartRotationVariants.right:
                {
                    entity.components.ItemAcceptor.setSlots([{ pos: new Vector(0, 0), directions: [enumDirection.bottom] }]);
                    entity.components.ItemEjector.setSlots([
                        { pos: new Vector(0, 0), direction: enumDirection.top },
                        {
                            pos: new Vector(0, 0),
                            direction: numberToRotationVariant[rotationVariant] == smartRotationVariants.left ? enumDirection.left : enumDirection.right,
                        },
                    ]);
                    break;
                }
            case smartRotationVariants.all:
                {
                    entity.components.ItemAcceptor.setSlots([{ pos: new Vector(0, 0), directions: [enumDirection.bottom] }]);
                    entity.components.ItemEjector.setSlots([
                        { pos: new Vector(0, 0), direction: enumDirection.left },
                        { pos: new Vector(0, 0), direction: enumDirection.top },
                        { pos: new Vector(0, 0), direction: enumDirection.right },
                    ]);
                    break;
                }
            case smartRotationVariants.both:
                {
                    entity.components.ItemAcceptor.setSlots([{ pos: new Vector(0, 0), directions: [enumDirection.bottom] }]);
                    entity.components.ItemEjector.setSlots([
                        { pos: new Vector(0, 0), direction: enumDirection.left },
                        { pos: new Vector(0, 0), direction: enumDirection.right },
                    ]);
                    break;
                }
        }
    };
    balancer.additionalStatistics[nameSplitter] = (root) => {
        let speedMultiplier = 1;
        const speed = (root.hubGoals.getProcessorBaseSpeed(enumItemProcessorTypes.balancer) / 2) * speedMultiplier;
        return [
            [shapezAPI.translations.ingame.buildingPlacement.infoTexts.speed, formatItemsPerSecond(speed)]
        ];
    };
};