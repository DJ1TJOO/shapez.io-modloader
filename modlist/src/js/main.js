const { AboutModsState } = require("./states/aboutmods");
const { ModsState } = require("./states/mods");
const { ModSettingsState } = require("./states/modsettings");

const modId = "a18121cf-fc7c-4f23-906d-b7ab0512bbc8";
registerMod({
    title: "Modlist",
    id: modId,
    description: "The mod that adds the mods list",
    authors: ["DJ1TJOO"],
    version: "1.0.0",
    gameVersion: 1007,
    dependencies: [],
    incompatible: [],
    settings: {
        hasMakeModButton: {
            type: "bool",
            value: false,
            title: "Make mod button",
            description: "Enable/Disable the make mod button",
            enabled: () => true,
        },
        // enum: {
        //     type: "enum",
        //     options: ["test", "new test"],
        //     value: "new test",
        //     title: "Enum test",
        //     description: "Choose a test value",
        //     textGetter: option => {
        //         return option;
        //     },
        //     enabled: () => true,
        // },
        // range: {
        //     type: "range",
        //     min: 0,
        //     max: 200,
        //     stepSize: 0.001,
        //     value: 10,
        //     title: "Range test",
        //     description: "Choose a test value",
        //     enabled: () => true,
        // },
    },
    translations: {
        en: {
            [modId]: {
                description: "The mod that adds the mods list",
            },
            modSettings: {
                title: "Mod settings",
            },
            aboutMods: {
                title: "About mods",
                text: "This is a page about mods",
            },
            mods: {
                title: "Mods",
                categories: {
                    installedmods: "Installed mods",
                    exploreMods: "Explore mods",
                    exploreModpacks: "Explore modpacks",
                },
            },
            mainMenu: {
                createMod: "Create a mod",
            },
        },
        nl: {
            [modId]: {
                description: "De mod die de mod lijst toevoegd",
            },
            modSettings: {
                title: "Mod instellingen",
            },
            aboutMods: {
                title: "Over mods",
                text: "Dit is een pagina mods",
            },
            mods: {
                title: "Mods",
                categories: {
                    installedmods: "Geïnstalleerde mods",
                    exploreMods: "Verken mods",
                    exploreModpacks: "Verken modpacks",
                },
            },
            mainMenu: {
                createMod: "Maak een mod",
            },
        },
    },
    updateStaticSettings: () => {
        ModsState.updateStaticSettings(modId);
    },
    updateStaticTranslations: id => {
        shapezAPI.mods.get(modId).description = shapezAPI.translations[modId].description;
        ModsState.updateStaticTranslations(modId, id);
    },
    gameInitializedRootClasses: root => {},
    gameInitializedRootManagers: root => {},
    gameBeforeFirstUpdate: root => {},
    main: config => {
        shapezAPI.injectCss("**{css}**", modId);
        shapezAPI.states["ModsState"] = ModsState;
        shapezAPI.states["ModSettingsState"] = ModSettingsState;
        shapezAPI.states["AboutModsState"] = AboutModsState;
        ModsState.setAPI(modId);
    },
});