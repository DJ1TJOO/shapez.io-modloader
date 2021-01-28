declare function registerMod(info: {
    id: string;
    title: string;
    description: string;
    authors: string[];
    version: string;
    gameVersion: string;
    dependencies: string[];
    incompatible: string[];
    translations: {};
    settings: {};
    updateStaticSettings: Function;
    updateStaticTranslations: Function;
    gameInitializedRootClasses: Function;
    gameInitializedRootManagers: Function;
    gameBeforeFirstUpdate: Function;
    main: Function;
});

declare function assert(condition: boolean | object | string, ...errorMessage: string[]): void;
declare function assertAlways(condition: boolean | object | string, ...errorMessage: string[]): void;

declare interface ShapezAPI {
    exports;
    KEYMAPPINGS: {
        key: Function;
    };
    translations;
    map;
    ingame: {
        buildings;
        components;
        //Must be array because of update order
        systems; //is defaultBuildingVariant defined somewhere ? it says it is undefined on a
        items;
        levels;
        themes;
        //List of layer names
        layers;
        hub_goals;
        gamespeed;
        gamemodes;
    };
    firstState;
    toolbars: {
        buildings: {
            primaryBuildings;
            secondaryBuildings;
            htmlElementId: string;
        };
        wires: {
            primaryBuildings;
            secondaryBuildings;
            htmlElementId: string;
        };
    };
    states;
    clickDetectors;
    themes;
    mods;
    modOrder;

    /**
     * Generates rotated variants of the matrix
     * @param {Array<number>} originalMatrix
     * @returns {Object<number, Array<number>>}
     */
    generateMatrixRotations(originalMatrix);

    /**
     * Registers a new sprite
     * @param {string} spriteId
     * @param {HTMLImageElement|HTMLCanvasElement} sourceImage
     * @returns {RegularSprite}
     */
    registerSprite(spriteId, sourceImage);

    /**
     * Returns a regular sprite by its id
     * @param {string} id
     * @returns {RegularSprite}
     */
    getRegularSprite(id);

    /**
     * Returns a regular sprite by its id
     * @param {string} id
     * @returns {AtlasSprite}
     */
    getSprite(id);

    /**
     * Registers a new atlas
     * @param {string} atlasDataString
     */
    registerAtlas(atlasDataString);

    /**
     * Registers a new atlases
     * @param {string[]} atlasDataStrings
     */
    registerAtlases(...atlasDataStrings);

    /**
     * Adds css to the page
     * @param {string} css
     */
    injectCss(css, id);

    /**
     * Registers a new icon
     * @param {string} id
     * @param {string} iconDataURL
     */
    registerIcon(id, iconDataURL);

    registerBuilding(buildingClass, iconDataURL, key, keyBindingName, buildingInfoText);

    /**
     * Tracks clicks on a element (e.g. button). Useful because you should both support
     * touch and mouse events.
     * @param {HTMLElement} element
     * @param {function} clickHandler
     */
    trackClicks(element, clickHandler);
}

declare let shapezAPI: ShapezAPI;
