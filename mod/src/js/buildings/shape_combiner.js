const formatItemsPerSecond = shapezAPI.exports.formatItemsPerSecond;
const enumDirection = shapezAPI.exports.enumDirection;
const Vector = shapezAPI.exports.Vector;
const T = shapezAPI.translations;
const ItemAcceptorComponent = shapezAPI.exports.ItemAcceptorComponent;
const ItemEjectorComponent = shapezAPI.exports.ItemEjectorComponent;
const enumItemProcessorTypes = shapezAPI.exports.enumItemProcessorTypes;
const enumItemProcessorRequirements = shapezAPI.exports.enumItemProcessorRequirements;
const ItemProcessorComponent = shapezAPI.exports.ItemProcessorComponent;
const Entity = shapezAPI.exports.Entity;
const MetaBuilding = shapezAPI.exports.MetaBuilding;
const GameRoot = shapezAPI.exports.GameRoot;
const enumHubGoalRewards = shapezAPI.exports.enumHubGoalRewards;

export class MetaShapeCombinerBuilding extends MetaBuilding {
    constructor() {
        super("shape_combiner");
    }

    getSilhouetteColor() {
        return "#0b8005";
    }

    getDimensions() {
        return new Vector(3, 1);
    }

    /**
     * @param {GameRoot} root
     * @returns {Array<[string, string]>}
     */
    getAdditionalStatistics(root) {
        const speed = root.hubGoals.getProcessorBaseSpeed(enumItemProcessorTypes.stacker);
        return [
            [T.ingame.buildingPlacement.infoTexts.speed, formatItemsPerSecond(speed)]
        ];
    }

    /**
     * @param {GameRoot} root
     */
    getIsUnlocked(root) {
        return root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_shape_combiner);
    }

    /**
     * Creates the entity at the given location
     * @param {Entity} entity
     */
    setupEntityComponents(entity) {
        entity.addComponent(
            new ItemProcessorComponent({
                inputsPerCharge: 2,
                processorType: enumItemProcessorTypes.shapeMerger,
                processingRequirement: enumItemProcessorRequirements.shapeMerger,
            })
        );

        entity.addComponent(
            new ItemEjectorComponent({
                slots: [{ pos: new Vector(1, 0), direction: enumDirection.top }],
            })
        );
        entity.addComponent(
            new ItemAcceptorComponent({
                slots: [{
                        pos: new Vector(0, 0),
                        directions: [enumDirection.bottom],
                        filter: "shape",
                    },
                    {
                        pos: new Vector(2, 0),
                        directions: [enumDirection.bottom],
                        filter: "shape",
                    },
                ],
            })
        );
    }
}