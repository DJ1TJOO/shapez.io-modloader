const modId = "3ae3751d-6dfb-4504-92dc-99a38a3d8c06";
registerMod({
    title: "Better Display",
    id: modId,
    description: "Makes display more clear",
    authors: ["Shrimp", "DJ1TJOO"],
    version: "0.0.1",
    gameVersion: "ML01",
    dependencies: [],
    incompatible: [],
    settings: {
        biggerShape: {
            type: "bool",
            value: true,
            title: "Bigger shape",
            description: "Make the shape bigger",
            enabled: () => true,
        },
        shapeBackground: {
            type: "bool",
            value: false,
            title: "Shape background",
            description: "Enable/Disable the shape background",
            enabled: () => true,
        },
    },
    translations: {
        en: {
            [modId]: {
                description: "Makes display more clear",
            },
            settings: {
                labels: {
                    biggerShape: {
                        title: "Bigger shape",
                        description: "Make the shape bigger",
                    },
                    shapeBackground: {
                        title: "Shape background",
                        description: "Enable/Disable the shape background",
                    },
                },
            },
        },
        nl: {
            [modId]: {
                description: "Maakt het scherm duidelijker",
            },
            settings: {
                labels: {
                    biggerShape: {
                        title: "Grotere vorm",
                        description: "Maak de vorm groter",
                    },
                    shapeBackground: {
                        title: "Vorm achtergrond",
                        description: "Schakel de vorm achtergrond in/uit",
                    },
                },
            },
        },
    },
    updateStaticSettings: () => {
        updateDisplay();
    },
    updateStaticTranslations: id => {
        shapezAPI.mods.get(modId).description = shapezAPI.translations[modId].description;
    },
    gameInitializedRootClasses: root => {},
    gameInitializedRootManagers: root => {},
    gameBeforeFirstUpdate: root => {},
    main: config => {
        updateDisplay();
    },
});

let updateDisplay = () => {
    const settings = shapezAPI.mods.get(modId).settings;
    let displaySystem = shapezAPI.ingame.systems.find(sys => sys.getId() === "display");
    if (settings.biggerShape.value) displaySystem.shapeRadius = () => 41;
    else displaySystem.shapeRadius = () => 30;

    if (settings.shapeBackground.value) displaySystem.shapeBackground = () => true;
    else displaySystem.shapeBackground = () => false;
};