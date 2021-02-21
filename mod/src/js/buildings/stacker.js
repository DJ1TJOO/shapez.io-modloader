const Vector = shapezAPI.exports.Vector;
const formatItemsPerSecond = shapezAPI.exports.formatItemsPerSecond;
const enumItemProcessorTypes = shapezAPI.exports.enumItemProcessorTypes;
const enumHubGoalRewards = shapezAPI.exports.enumHubGoalRewards;
const enumItemProcessorRequirements = shapezAPI.exports.enumItemProcessorRequirements;
const enumDirection = shapezAPI.exports.enumDirection;

export const addStackerVariant = () => {
    const name = "smart";
    const stacker = shapezAPI.ingame.buildings.stacker;
    if (!stacker.variants) stacker.variants = {};
    stacker.variants[name] = name;
    stacker.avaibleVariants[name] = (root) => root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_stacker) && root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_smart_stacker);
    stacker.overlayMatrices[name] = () => null;
    stacker.dimensions[name] = () => new Vector(3, 1);
    stacker.silhouetteColors[name] = () => "#9fcd7d";
    stacker.isRemovable[name] = () => true;
    stacker.isRotateable[name] = () => true;
    stacker.renderPins[name] = () => true;
    stacker.layerPreview[name] = () => null;
    stacker.layerByVariant[name] = (root) => "regular";
    //stacker.setupEntityComponents.push((entity) => {});
    stacker.componentVariations[name] = (entity) => {
        entity.components.ItemProcessor.type = enumItemProcessorTypes.smartStacker;
        entity.components.ItemProcessor.processingRequirement = enumItemProcessorRequirements.smartStacker;

        entity.components.ItemAcceptor.setSlots([{
                pos: new Vector(0, 0),
                directions: [enumDirection.left],
                filter: "shape",
            },
            {
                pos: new Vector(0, 0),
                directions: [enumDirection.bottom],
                filter: "shape",
            },
            {
                pos: new Vector(1, 0),
                directions: [enumDirection.bottom],
                filter: "shape",
            },
            {
                pos: new Vector(2, 0),
                directions: [enumDirection.bottom],
                filter: "shape",
            },
        ]);
    };
    stacker.additionalStatistics[name] = (root) => {
        const speed = root.hubGoals.getProcessorBaseSpeed(enumItemProcessorTypes.stacker);
        return [
            [shapezAPI.translations.ingame.buildingPlacement.infoTexts.speed, formatItemsPerSecond(speed)]
        ];
    };
};