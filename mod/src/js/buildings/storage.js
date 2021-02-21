const Vector = shapezAPI.exports.Vector;
const enumDirection = shapezAPI.exports.enumDirection;
const enumPinSlotType = {
    logicalEjector: "logicalEjector",
    logicalAcceptor: "logicalAcceptor",
};
const enumHubGoalRewards = shapezAPI.exports.enumHubGoalRewards;

export const addStorageVariant = () => {
    const storageSize = 500;
    const name = "mini";
    const storage = shapezAPI.ingame.buildings.storage;
    if (!storage.variants) storage.variants = {};
    storage.variants[name] = name;
    storage.avaibleVariants[name] = (root) => root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_storage);
    storage.overlayMatrices[name] = () => null;
    storage.dimensions[name] = () => new Vector(1, 1);
    storage.silhouetteColors[name] = () => "#bbdf6d";
    storage.isRemovable[name] = () => true;
    storage.isRotateable[name] = () => true;
    storage.renderPins[name] = () => true;
    storage.layerPreview[name] = () => "wires";
    storage.layerByVariant[name] = (root) => "regular";
    storage.componentVariations[name] = (entity, rotationVariant) => {
        entity.components.ItemEjector.setSlots([{
                pos: new Vector(0, 0),
                direction: enumDirection.top,
            },
            {
                pos: new Vector(0, 0),
                direction: enumDirection.right,
            },
        ]);
        entity.components.ItemAcceptor.setSlots([{
            pos: new Vector(0, 0),
            directions: [enumDirection.bottom],
        }, ]);
        entity.components.Storage.maximumStorage = storageSize;
        entity.components.WiredPins.setSlots([{
                pos: new Vector(0, 0),
                direction: enumDirection.right,
                type: enumPinSlotType.logicalEjector,
            },
            {
                pos: new Vector(0, 0),
                direction: enumDirection.left,
                type: enumPinSlotType.logicalEjector,
            },
        ]);
    };
    storage.additionalStatistics[name] = (root) => [
        [shapezAPI.translations.ingame.buildingPlacement.infoTexts.speed, shapezAPI.exports.formatItemsPerSecond(storageSize)]
    ];
};