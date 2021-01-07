const modId = "cbae38a0-7ac5-4a0a-9985-da3110b1a6e8";
registerMod({
    title: "Survival Mod",
    id: modId,
    description: "Every build now has building cost and there is more hubs available",
    authors: ["Shrimp", "DJ1TJOO"],
    version: "0.0.1",
    gameVersion: 1007,
    dependencies: [],
    incompatible: [],
    settings: {
        hasHubPlacement: {
            type: "bool",
            value: false,
            title: "Can place hub",
            description: "This setting changes the ability to place new hubs",
            enabled: () => true,
        },
    },
    translations: {
        en: {
            [modId]: {
                description: "Every build now has building cost and there is more hubs available",
            },
            buildings: {
                hub: {
                    default: {
                        name: "Hub",
                        description: "Imports items from belts",
                    },
                },
            },
            settings: {
                labels: {
                    hasHubPlacement: {
                        title: "Can place hub",
                        description: "This setting changes the ability to place new hubs",
                    },
                },
            },
            keybindings: {
                mappings: {
                    hub: "Hub",
                },
            },
        },
        nl: {
            [modId]: {
                description: "Elk gebouw kost nu een vorm en er zijn meer hubs toegankelijk",
            },
            buildings: {
                hub: {
                    default: {
                        name: "Hub",
                        description: "Importeerd voorwerpen van lopende banden",
                    },
                },
            },
            settings: {
                labels: {
                    hasHubPlacement: {
                        title: "Kan je een hub plaatsen",
                        description: "Deze instelling bepaald of je nieuwe hubs kan plaatsen",
                    },
                },
            },
        },
    },
    updateStaticSettings: () => {
        //Add/Remove hub to/from toolbar
        updateToolBarHub();

        //Unlock hub
        updateHubPlacement();
    },
    updateStaticTranslations: id => {
        shapezAPI.mods.get(modId).description = shapezAPI.translations[modId].description;
        for (const settingsKey in shapezAPI.mods.get(modId).settings) {
            const settings = shapezAPI.mods.get(modId).settings[settingsKey];
            settings.title = shapezAPI.translations.settings.labels[settingsKey].title;
            settings.description = shapezAPI.translations.settings.labels[settingsKey].description;
        }
    },
    gameInitializedRootClasses: root => {},
    gameInitializedRootManagers: root => {},
    gameBeforeFirstUpdate: root => {
        root.signals.prePlacementCheck.add((entity, offset, blueprint) => {
            //To play survival set rect 64 at start
            if (!root.hubGoals.storedShapes["RuRuRuRu"] && root.gameIsFresh) {
                addShapeByKey(root.hubGoals, "RuRuRuRu", 64);
            }

            //Check if enough shapes
            let cost = costs[entity.getId()];
            if (
                (!blueprint && cost && root.hubGoals.getShapesStoredByKey(cost.shape) < cost.cost) ||
                (blueprint && entity.getId() === new shapezAPI.ingame.buildings.hub().getId())
            )
                return shapezAPI.exports.STOP_PROPAGATION;
        });
        root.signals.entityManuallyPlaced.add(entity => {
            //Remove shapes
            let cost = costs[entity.getId()];
            if (cost) root.hubGoals.takeShapeByKey(cost.shape, cost.cost);
        });
        root.signals.entityDestroyed.add(entity => {
            //Add shapes
            let cost = costs[entity.getId()];
            if (cost) addShapeByKey(root.hubGoals, cost.shape, cost.cost);
        });
        let costLabel;
        let costDisplayText;
        let costDisplayParent;

        root.app.ticker.frameEmitted.add(dt => {
            try {
                const metaBuilding = root.hud.parts.buildingPlacer.currentMetaBuilding.get();
                if (!metaBuilding) return;

                let cost = costs[metaBuilding.id];
                if (!cost) {
                    return;
                }

                let totalCost = cost.cost;
                if (root.hud.parts.buildingPlacer.isDirectionLockActive)
                    totalCost = cost.cost * root.hud.parts.buildingPlacer.computeDirectionLockPath().length;

                costDisplayText.innerText = "" + totalCost;

                costDisplayParent.classList.toggle(
                    "canAfford",
                    root.hubGoals.getShapesStoredByKey(cost.shape) >= totalCost
                );
            } catch (error) {
                /*Not in correct state do nothing*/
            }
        });
        root.hud.parts.buildingPlacer.signals.variantChanged.add(() => {
            costDisplayParent = document.getElementById("ingame_HUD_BuildingCost");

            if (!costDisplayParent)
                costDisplayParent = shapezAPI.exports.makeDiv(
                    document.body,
                    "ingame_HUD_BuildingCost", [],
                    ``
                );
            else shapezAPI.exports.removeAllChildren(costDisplayParent);

            const metaBuilding = root.hud.parts.buildingPlacer.currentMetaBuilding.get();

            if (!metaBuilding) return;

            let cost = costs[metaBuilding.id];
            if (!cost) return;

            const shapeCanvas = root.shapeDefinitionMgr.getShapeFromShortKey(cost.shape).generateAsCanvas(80);

            shapezAPI.exports.makeDiv(costDisplayParent, null, ["draw"], "");
            if (!costLabel || !costLabel.parentElement) {
                costLabel = shapezAPI.exports.makeDiv(costDisplayParent, null, ["label"], "Building Cost");
            }
            let costContainer = shapezAPI.exports.makeDiv(costDisplayParent, null, ["costContainer"], "");
            costDisplayText = shapezAPI.exports.makeDiv(costContainer, null, ["costText"], "");
            costContainer.appendChild(shapeCanvas);
            costDisplayText.innerText = "" + cost.cost;

            if (costDisplayText) {
                costDisplayParent.classList.toggle(
                    "canAfford",
                    root.hubGoals.getShapesStoredByKey(cost.shape) >= cost.cost
                );
            }
        });
    },
    main: config => {
        shapezAPI.injectCss("**{css}**", modId);
        shapezAPI.registerAtlases("**{atlas_atlas0_hq}**", "**{atlas_atlas0_mq}**", "**{atlas_atlas0_lq}**");

        //Change costs to config, also for other mod support
        if (config.costs) shapezAPI.exports.matchOverwriteRecursiveSettings(costs, config.costs);

        /*HUB*/
        let hub = shapezAPI.ingame.buildings.hub;

        //Add hub key mapping
        let hubId = new hub().getId();
        shapezAPI.KEYMAPPINGS.buildings[hubId] = { keyCode: shapezAPI.KEYMAPPINGS.key("P"), id: hubId };

        //Unlock hub
        updateHubPlacement();

        //Add/Remove hub to/from toolbar
        updateToolBarHub();

        //Add hub icon
        shapezAPI.registerIcon("building_icons/" + hubId, "**{icons_hub}**");

        //Add sprites
        delete hub.prototype.getBlueprintSprite;
        delete hub.prototype.getSprite;
    },
});

//Add/Remove hub to/from toolbar
let updateToolBarHub = () => {
    let hub = shapezAPI.ingame.buildings.hub;
    let toolbar = shapezAPI.toolbars.buildings.primaryBuildings;

    if (shapezAPI.mods.get(modId).settings.hasHubPlacement.value && !toolbar.includes(hub)) toolbar.push(hub);
    else if (toolbar.includes(hub)) toolbar.splice(toolbar.indexOf(hub), 1);
};

//Unlock hub
let updateHubPlacement = () => {
    let hub = shapezAPI.ingame.buildings.hub;

    if (shapezAPI.mods.get(modId).settings.hasHubPlacement.value) {
        hub.avaibleVariants[shapezAPI.exports.defaultBuildingVariant] = () => true;
        hub.isRemovable[shapezAPI.exports.defaultBuildingVariant] = () => true;
        hub.canPipet = () => true;
    } else {
        if (hub.avaibleVariants[shapezAPI.exports.defaultBuildingVariant])
            hub.avaibleVariants[shapezAPI.exports.defaultBuildingVariant] = () => false;

        if (hub.isRemovable[shapezAPI.exports.defaultBuildingVariant])
            hub.isRemovable[shapezAPI.exports.defaultBuildingVariant] = () => false;

        if (hub.canPipet()) hub.canPipet = () => false;
    }
};

/**
 * @param {string} key
 * @param {number} amount
 */
let addShapeByKey = (hubGoals, key, amount) => {
    assert(Number.isInteger(amount), "Invalid amount: " + amount);
    hubGoals.storedShapes[key] = (hubGoals.storedShapes[key] || 0) + amount;
    return;
};

let costs = {
    // Belt
    belt: {
        shape: "RuRuRuRu",
        cost: 4,
    },

    // Extractor
    miner: {
        shape: "RuRuRuRu",
        cost: 8,
    },

    // Cutter
    cutter: {
        shape: "CuCuCuCu",
        cost: 12,
    },

    // Trash
    trash: {
        shape: "CuCuCuCu",
        cost: 2,
    },

    // Balancer
    balancer: {
        shape: "CuCuCuCu",
        cost: 6,
    },

    // Rotater
    rotater: {
        shape: "----RuRu",
        cost: 5,
    },

    // Tunnel
    underground_belt: {
        shape: "Ru----Ru",
        cost: 10,
    },

    // Painter
    painter: {
        shape: "------Ru",
        cost: 15,
    },

    // Mixer
    mixer: {
        shape: "--SbSb--",
        cost: 15,
    },

    // Stacker
    stacker: {
        shape: "Cg----Cg",
        cost: 20,
    },

    // Reader
    reader: {
        shape: "--Cg----:--Cr----",
        cost: 5,
    },

    // Storage
    storage: {
        shape: "RwRwRwRw",
        cost: 10,
    },

    // Wire
    wire: {
        shape: "RuRuRuRu:Rb--Rb--",
        cost: 5,
    },

    // Wire Tunnel
    wire_tunnel: {
        shape: "RuRuRuRu:Rb--Rb--",
        cost: 5,
    },

    // Lever
    lever: {
        shape: "RwRwRwRw:CuCuCuCu",
        cost: 1,
    },

    // Filter
    filter: {
        shape: "Cg----Cr:Cw----Cw:Sy------:Cy----Cy",
        cost: 3,
    },

    // Constant Signal
    constant_signal: {
        shape: "CcSyCcSy:SyCcSyCc:CcSyCcSy",
        cost: 3,
    },

    // Display
    display: {
        shape: "RuRuRuRu:RwRwRwRw:RuCw--Cw:----Ru--",
        cost: 1,
    },

    // Logic Gates
    logic_gate: {
        shape: "CrCyCpCb",
        cost: 10,
    },

    // Transistor
    transistor: {
        shape: "CbCbCbRb:CpCpCpRp:CwCwCwRw",
        cost: 5,
    },

    // Comparator
    comparator: {
        shape: "Sg----Sg:CgCgCgCg:--CyCy--",
        cost: 5,
    },

    // Virtual Processor
    virtual_processor: {
        shape: "CpRpCp--:SwSwSwSw",
        cost: 5,
    },

    // Analyzer
    analyzer: {
        shape: "CrCwCrCw:CwCrCwCr:CrCwCrCw:CwCrCwCr",
        cost: 5,
    },

    // Hub
    hub: {
        shape: "Wr------:--CbWwWp:--Sw----:Wc--WyRg",
        cost: 1000,
    },

    // Producer
    item_producer: {
        shape: "CuCuCuCu",
        cost: 0,
    },
};