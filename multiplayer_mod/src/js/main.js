const modId = "2b57757b-d053-4a2b-b2bb-c7b701374531";
registerMod({
    title: "Multiplayer",
    id: modId,
    description: "A mod that adds multiplayer to shapez.io",
    authors: ["DJ1TJOO"],
    version: "0.0.1",
    gameVersion: "ML01",
    dependencies: [],
    incompatible: [],
    settings: {},
    translations: {
        en: {
            [modId]: {
                description: "A mod that adds multiplayer to shapez.io",
            },
        },
    },
    updateStaticSettings: () => {},
    updateStaticTranslations: (id) => {},
    gameInitializedRootClasses: (root) => {},
    gameInitializedRootManagers: (root) => {},
    gameBeforeFirstUpdate: (root) => {},
    main: (config) => {
        shapezAPI.injectCss("**{css}**", modId);
    },
});