const modId = "***ADD UUID***"; // You can get your UUID from here => https://www.uuidgenerator.net/
registerMod({
    title: "What a title?",
    id: modId,
    description: "A miniscule description",
    authors: ["No authors here"],
    version: "1.0.0",
    gameVersion: 1007,
    dependencies: [],
    incompatible: [],
    settings: {},
    translations: {
        en: {
            [modId]: {
                description: "A miniscule description",
            },
        },
    },
    updateStaticSettings: () => {},
    updateStaticTranslations: id => {},
    gameInitializedRootClasses: root => {},
    gameInitializedRootManagers: root => {},
    gameBeforeFirstUpdate: root => {},
    main: config => {
        shapezAPI.injectCss("**{css}**", modId);
    },
});