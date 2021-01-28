const modId = "ca2fb74a-3827-4805-b5fe-8a23bf913c65";
registerMod({
    title: "Compact filter",
    id: modId,
    description: "Adds a 1x1 filter",
    authors: ["Shrimp", "DJ1TJOO"],
    version: "0.0.1",
    gameVersion: "ML01",
    dependencies: [],
    incompatible: [],
    settings: {},
    translations: {
        en: {
            [modId]: {
                description: "Adds a 1x1 filter",
            },
            buildings: {
                filter: {
                    compactFilter: {
                        name: "Filter",
                        description: "Connect a signal to route all matching items to the top and the remaining to the right. Can be controlled with boolean signals too.",
                    },
                    compactFilterInverse: {
                        name: "Filter",
                        description: "Connect a signal to route all matching items to the top and the remaining to the right. Can be controlled with boolean signals too.",
                    },
                },
            },
        },
        nl: {
            [modId]: {
                description: "Voegt een 1x1 filter toe",
            },
            buildings: {
                filter: {
                    compactFilter: {
                        name: "Filter",
                        description: "Stuurt alle items van de ingestelde soort naar boven en de restnaar rechts.",
                    },
                    compactFilterInverse: {
                        name: "Filter",
                        description: "Stuurt alle items van de ingestelde soort naar boven en de restnaar rechts.",
                    },
                },
            },
        },
    },
    updateStaticSettings: () => {},
    updateStaticTranslations: id => {
        shapezAPI.mods.get(modId).description = shapezAPI.translations[modId].description;
    },
    gameInitializedRootClasses: root => {},
    gameInitializedRootManagers: root => {},
    gameBeforeFirstUpdate: root => {},
    main: config => {
        shapezAPI.injectCss("**{css}**", modId);
        shapezAPI.registerAtlases("**{atlas_atlas0_hq}**", "**{atlas_atlas0_mq}**", "**{atlas_atlas0_lq}**");

        addFilterVariant("compactFilter", (entity, rotationVariant) => {
            entity.components.ItemAcceptor.setSlots([{
                pos: new shapezAPI.exports.Vector(0, 0),
                directions: [shapezAPI.exports.enumDirection.bottom],
            }, ]);

            entity.components.ItemEjector.setSlots([{
                    pos: new shapezAPI.exports.Vector(0, 0),
                    direction: shapezAPI.exports.enumDirection.top,
                },
                {
                    pos: new shapezAPI.exports.Vector(0, 0),
                    direction: shapezAPI.exports.enumDirection.right,
                },
            ]);
        });

        addFilterVariant("compactFilterInverse", (entity, rotationVariant) => {
            entity.components.ItemAcceptor.setSlots([{
                pos: new shapezAPI.exports.Vector(0, 0),
                directions: [shapezAPI.exports.enumDirection.bottom],
            }, ]);

            entity.components.ItemEjector.setSlots([{
                    pos: new shapezAPI.exports.Vector(0, 0),
                    direction: shapezAPI.exports.enumDirection.top,
                },
                {
                    pos: new shapezAPI.exports.Vector(0, 0),
                    direction: shapezAPI.exports.enumDirection.right,
                },
            ]);
        });

        shapezAPI.ingame.systems.find(sys => sys.getId() === "filter").listToCheck = (
            entity,
            slot,
            item,
            filterComp,
            networkValue
        ) => {
            if (entity.components.StaticMapEntity.getVariant() === "compactFilterInverse")
                return networkValue.equals(shapezAPI.exports.BOOL_TRUE_SINGLETON) || networkValue.equals(item) ?
                    filterComp.pendingItemsToReject :
                    filterComp.pendingItemsToLeaveThrough;
            else
                return networkValue.equals(shapezAPI.exports.BOOL_TRUE_SINGLETON) || networkValue.equals(item) ?
                    filterComp.pendingItemsToLeaveThrough :
                    filterComp.pendingItemsToReject;
        };
    },
});

let addFilterVariant = (name, componentVariation) => {
    let filter = shapezAPI.ingame.buildings.filter;
    if (!filter.variants) filter.variants = {};
    filter.variants[name] = name;
    filter.avaibleVariants[name] = root =>
        root.hubGoals.isRewardUnlocked(shapezAPI.exports.enumHubGoalRewards.reward_filter);
    filter.overlayMatrices[name] = () => null;
    filter.dimensions[name] = () => new shapezAPI.exports.Vector(1, 1);
    filter.silhouetteColors[name] = () => "#c45c2e";
    filter.isRemovable[name] = () => true;
    filter.isRotateable[name] = () => true;
    filter.renderPins[name] = () => true;
    filter.layerPreview[name] = () => "wires";
    filter.layerByVariant[name] = root => "regular";
    filter.componentVariations[name] = componentVariation;
    filter.additionalStatistics[name] = root => [
        [
            shapezAPI.translations.ingame.buildingPlacement.infoTexts.speed,
            shapezAPI.exports.formatItemsPerSecond(root.hubGoals.getBeltBaseSpeed()),
        ],
    ];
};