import { FluidItem } from "./items/fluid";

const modId = "b6eaf06b-a0f7-48ac-b219-4e97fd275beb"; //https://www.uuidgenerator.net/
registerMod({
    title: "Colored Tiles!",
    id: modId,
    description: "This mod adds colore tiles to the game",
    authors: ["SHADOW"],
    version: "1.0.0",
    gameVersion: 1007,
    dependencies: [],
    incompatible: [],
    settings: {},
    translations: {
        en: {
            [modId]: {
                description: "No desc to you",
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
        shapezAPI.ingame.items[FluidItem.getId()] = FluidItem;
    },
});