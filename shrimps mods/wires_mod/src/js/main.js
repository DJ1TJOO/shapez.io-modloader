const { WireTunnelComponent, ConnectionDirections } = require("./components/more_wire_tunnel");

const modId = "cba4229f-851b-4f01-807f-2a0c86c3aed7";
registerMod({
    title: "More wires",
    id: modId,
    description: "Adds a new wire variant and adds new tunnel variants",
    authors: ["CEbbinghaus", "DJ1TJOO"],
    version: "0.0.1",
    gameVersion: 1007,
    dependencies: [],
    incompatible: [],
    settings: {},
    translations: {
        en: {
            [modId]: {
                description: "Adds a new wire variant and adds new tunnel variants",
            },
            buildings: {
                wire: {
                    third: {
                        name: "Wire",
                        description: "Transfers signals, which can be items, colours or booleans (1 or 0). Differently-coloured wires do not connect to each other.",
                    },
                },
                wire_tunnel: {
                    default: {
                        name: "Wire Tunnel",
                        description: "Allows two wires to cross without connecting to each other.",
                    },
                    elbow: {
                        name: "Elbow Tunnel",
                        description: "Allows a wire to turn a corner without connecting to anything else.",
                    },
                    straight: {
                        name: "Straight tunnel",
                        description: "Allows a wire to go straight without connecting to anything else.",
                    },
                    double_elbow: {
                        name: "Double Elbow Tunnel",
                        description: "Allows two wires to turn corners without connecting to each other.",
                    },
                },
            },
        },
        nl: {
            [modId]: {
                description: "Voegt een nieuwe draad variant toe en voegt nieuwe tunnel varianten toe",
            },
            buildings: {
                wire: {
                    third: {
                        name: "Kabel",
                        description: "Vervoert signalen, zoals items, kleuren of booleans (1 of 0). Verschillende kleuren kabels kunnen niet verbonden worden.",
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

        //Add wire variant
        addWireVariant("third");

        //Wire tunnel components and systems
        let wireTunnel = shapezAPI.ingame.buildings.wire_tunnel;
        wireTunnel.setupEntityComponents.shift();
        wireTunnel.setupEntityComponents.push(entity =>
            entity.addComponent(
                new WireTunnelComponent({
                    connections: ConnectionDirections[shapezAPI.exports.defaultBuildingVariant],
                })
            )
        );
        wireTunnel.componentVariations[shapezAPI.exports.defaultBuildingVariant] = (
            entity,
            rotationVariant
        ) => {
            if (entity.components.WireTunnel) {
                entity.components.WireTunnel.updateConnections(
                    ConnectionDirections[shapezAPI.exports.defaultBuildingVariant]
                );
            }
        };
        shapezAPI.ingame.systems.find(sys => sys.getId() === "wire").getForwardedTile = (
            tunnelComp,
            staticComp,
            offset
        ) => {
            return staticComp.origin.add(tunnelComp.getOutputDirection(staticComp, offset));
        };

        //Add wire_tunnel variants
        addWireTunnelVariant("double_elbow", [0, 1, 0, 1, 1, 1, 0, 1, 0]);
        addWireTunnelVariant("elbow", [0, 1, 0, 0, 1, 1, 0, 0, 0]);
        addWireTunnelVariant("straight", [0, 1, 0, 0, 1, 0, 0, 1, 0]);
    },
});

let addWireTunnelVariant = (name, matrix) => {
    let wireTunnel = shapezAPI.ingame.buildings.wire_tunnel;
    if (!wireTunnel.variants) wireTunnel.variants = {};
    wireTunnel.variants[name] = name;
    wireTunnel.avaibleVariants[name] = root =>
        root.hubGoals.isRewardUnlocked(shapezAPI.exports.enumHubGoalRewards.reward_wires_painter_and_levers);
    wireTunnel.overlayMatrices[name] = () => shapezAPI.exports.generateMatrixRotations(matrix);
    wireTunnel.dimensions[name] = () => new shapezAPI.exports.Vector(1, 1);
    wireTunnel.silhouetteColors[name] = () => "#777a86";
    wireTunnel.isRemovable[name] = () => true;
    wireTunnel.isRotateable[name] = () => true;
    wireTunnel.renderPins[name] = () => false;
    wireTunnel.layerPreview[name] = () => "wires";
    wireTunnel.layerByVariant[name] = root => "wires";
    wireTunnel.componentVariations[name] = (entity, rotationVariant) => {
        if (entity.components.WireTunnel) {
            entity.components.WireTunnel.updateConnections(ConnectionDirections[name]);
        }
    };
};

//Add variant to wire
let addWireVariant = name => {
    let wire = shapezAPI.ingame.buildings.wire;
    wire.variants[name] = name;
    wire.placementSounds[name] = shapezAPI.exports.SOUNDS.placeBelt;
    wire.wireVariantToVariant[name] = name;
    wire.wireVariants[name] = name;
    wire.avaibleVariants[name] = root =>
        root.hubGoals.isRewardUnlocked(shapezAPI.exports.enumHubGoalRewards.reward_wires_painter_and_levers);
    wire.dimensions[name] = () => new shapezAPI.exports.Vector(1, 1);
    wire.isRemovable[name] = () => true;
    wire.isReplaceable[name] = () => true;
    wire.isRotateable[name] = () => true;
    wire.renderPins[name] = () => null;
    wire.layerPreview[name] = () => "wires";
    wire.layerByVariant[name] = root => "wires";
    wire.silhouetteColors[name] = () => "#61ef6f";
    wire.componentVariations[name] = (entity, rotationVariant) => {
        entity.components.Wire.type = wire.rotationVariantToType[rotationVariant];
        entity.components.Wire.variant = name;
    };
};