const { AboutModsState } = require("./states/aboutmods");
const { ModsState } = require("./states/mods");

const modId = "a18121cf-fc7c-4f23-906d-b7ab0512bbc8";
registerMod({
    title: "Modlist",
    id: modId,
    description: "Modlist",
    authors: ["DJ1TJOO"],
    version: "1.0.0",
    gameVersion: 1007,
    dependencies: [],
    incompatible: [],
    translations: {
        en: {
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
    updateStaticTranslations: id => {
        shapezAPI.exports.MainMenuState.extraSmallButtons.find(o => o.htmlClass === "CreateModButton").text =
            shapezAPI.translations.mainMenu.createMod;
    },
    gameInitializedRootClasses: root => {},
    gameInitializedRootManagers: root => {},
    gameBeforeFirstUpdate: root => {},
    main: config => {
        shapezAPI.registerIcon("main_menu/mods", "**{icons_mods}**");
        shapezAPI.injectCss("**{css}**", modId);
        shapezAPI.states["ModsState"] = ModsState;
        shapezAPI.states["AboutModsState"] = AboutModsState;
        ModsState.setAPI();
    },
});