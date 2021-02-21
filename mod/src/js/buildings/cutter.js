const Vector = shapezAPI.exports.Vector;
const formatItemsPerSecond = shapezAPI.exports.formatItemsPerSecond;
const enumItemProcessorTypes = shapezAPI.exports.enumItemProcessorTypes;
const enumHubGoalRewards = shapezAPI.exports.enumHubGoalRewards;
const enumItemProcessorRequirements = shapezAPI.exports.enumItemProcessorRequirements;
const enumDirection = shapezAPI.exports.enumDirection;
const enumPinSlotType = {
    logicalEjector: "logicalEjector",
    logicalAcceptor: "logicalAcceptor",
};
export const addCutterVariant = () => {
    const name = "laser";
    const cutter = shapezAPI.ingame.buildings.cutter;
    if (!cutter.variants) cutter.variants = {};
    cutter.variants[name] = name;
    cutter.avaibleVariants[name] = (root) => root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_cutter) && root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_smart_cutter);
    cutter.overlayMatrices[name] = () => null;
    cutter.dimensions[name] = () => new Vector(2, 1);
    cutter.silhouetteColors[name] = () => "#7dcda2";
    cutter.isRemovable[name] = () => true;
    cutter.isRotateable[name] = () => true;
    cutter.layerPreview[name] = () => null;
    cutter.layerByVariant[name] = (root) => "regular";
    //cutter.setupEntityComponents.push((entity) => {});
    cutter.componentVariations[name] = (entity) => {
        if (!entity.components.WiredPins) {
            entity.addComponent(new shapezAPI.exports.WiredPinsComponent({ slots: [] }));
        }
        entity.components.WiredPins.setSlots([{
                pos: new Vector(1, 0),
                direction: enumDirection.top,
                type: enumPinSlotType.logicalAcceptor,
            },
            {
                pos: new Vector(1, 0),
                direction: enumDirection.bottom,
                type: enumPinSlotType.logicalAcceptor,
            },
            {
                pos: new Vector(0, 0),
                direction: enumDirection.bottom,
                type: enumPinSlotType.logicalAcceptor,
            },
            {
                pos: new Vector(0, 0),
                direction: enumDirection.top,
                type: enumPinSlotType.logicalAcceptor,
            },
        ]);
        entity.components.ItemAcceptor.setSlots([{
            pos: new Vector(0, 0),
            directions: [enumDirection.left],
            filter: "shape",
        }, ]);
        entity.components.ItemEjector.setSlots([
            { pos: new Vector(1, 0), direction: enumDirection.right },
            { pos: new Vector(1, 0), direction: enumDirection.bottom },
        ]);
        entity.components.ItemProcessor.type = enumItemProcessorTypes.cutterLaser;
    };
    cutter.additionalStatistics[name] = (root) => {
        const speed = root.hubGoals.getProcessorBaseSpeed(enumItemProcessorTypes.cutter);
        return [
            [shapezAPI.translations.ingame.buildingPlacement.infoTexts.speed, formatItemsPerSecond(speed)]
        ];
    };
};