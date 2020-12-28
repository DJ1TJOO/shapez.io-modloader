/**
 * @typedef {{
 * title: String,
 * id: String,
 * description: String,
 * authors: Array<String>,
 * version: String,
 * gameVersion: number,
 * dependencies: Array<String>,
 * incompatible: Array<String>,
 * main: Function,
 * }} ModInfo
 */

const INFOType = {
    title: "",
    id: "",
    description: "",
    authors: [],
    version: "",
    gameVersion: 0,
    dependencies: [],
    incompatible: [],
    main: () => {},
};
import { Application } from "../application";
import { cachebust } from "../core/cachebust";
import { ClickDetector } from "../core/click_detector";
import { GameState } from "../core/game_state";
import { Loader } from "../core/loader";
import { RegularSprite } from "../core/sprites";
import { TextualGameState } from "../core/textual_game_state";
import { generateMatrixRotations } from "../core/utils";
import {
    enumAngleToDirection,
    enumDirection,
    enumDirectionToAngle,
    enumDirectionToVector,
    enumInvertedDirections,
    Vector,
} from "../core/vector";
import { enumSavePriority } from "../game/automatic_save";
import { BaseItem } from "../game/base_item";
import { enumMouseButton } from "../game/camera";
import {
    enumColorMixingResults,
    enumColors,
    enumColorsToHexCode,
    enumColorToShortcode,
} from "../game/colors";
import { Component } from "../game/component";
import { BeltComponent } from "../game/components/belt";
import { BeltReaderComponent } from "../game/components/belt_reader";
import { BeltUnderlaysComponent, enumClippedBeltUnderlayType } from "../game/components/belt_underlays";
import { ConstantSignalComponent } from "../game/components/constant_signal";
import { DisplayComponent } from "../game/components/display";
import { FilterComponent } from "../game/components/filter";
import { HubComponent } from "../game/components/hub";
import { ItemAcceptorComponent } from "../game/components/item_acceptor";
import { ItemEjectorComponent } from "../game/components/item_ejector";
import {
    enumItemProcessorRequirements,
    enumItemProcessorTypes,
    ItemProcessorComponent,
} from "../game/components/item_processor";
import { ItemProducerComponent } from "../game/components/item_producer";
import { LeverComponent } from "../game/components/lever";
import { LogicGateComponent } from "../game/components/logic_gate";
import { MinerComponent } from "../game/components/miner";
import { StaticMapEntityComponent } from "../game/components/static_map_entity";
import { StorageComponent } from "../game/components/storage";
import { UndergroundBeltComponent } from "../game/components/underground_belt";
import { WireComponent } from "../game/components/wire";
import { WiredPinsComponent } from "../game/components/wired_pins";
import { WireTunnelComponent } from "../game/components/wire_tunnel";
import { GameSystem } from "../game/game_system";
import { GameSystemWithFilter } from "../game/game_system_with_filter";
import { HubGoals } from "../game/hub_goals";
import { HUDBuildingsToolbar } from "../game/hud/parts/buildings_toolbar";
import { enumNotificationType } from "../game/hud/parts/notifications";
import { enumDisplayMode } from "../game/hud/parts/statistics_handle";
import { HUDWiresToolbar } from "../game/hud/parts/wires_toolbar";
import { KEYMAPPINGS } from "../game/key_action_mapper";
import { defaultBuildingVariant, MetaBuilding } from "../game/meta_building";
import { enumAnalyticsDataSource } from "../game/production_analytics";
import { BeltSystem } from "../game/systems/belt";
import { BeltReaderSystem } from "../game/systems/belt_reader";
import { BeltUnderlaysSystem } from "../game/systems/belt_underlays";
import { ConstantSignalSystem } from "../game/systems/constant_signal";
import { DisplaySystem } from "../game/systems/display";
import { FilterSystem } from "../game/systems/filter";
import { HubSystem } from "../game/systems/hub";
import { ItemAcceptorSystem } from "../game/systems/item_acceptor";
import { ItemEjectorSystem } from "../game/systems/item_ejector";
import { ItemProcessorSystem } from "../game/systems/item_processor";
import { ItemProcessorOverlaysSystem } from "../game/systems/item_processor_overlays";
import { ItemProducerSystem } from "../game/systems/item_producer";
import { LeverSystem } from "../game/systems/lever";
import { LogicGateSystem } from "../game/systems/logic_gate";
import { MapResourcesSystem } from "../game/systems/map_resources";
import { MinerSystem } from "../game/systems/miner";
import { StaticMapEntitySystem } from "../game/systems/static_map_entity";
import { StorageSystem } from "../game/systems/storage";
import { UndergroundBeltSystem } from "../game/systems/underground_belt";
import { WireSystem } from "../game/systems/wire";
import { WiredPinsSystem } from "../game/systems/wired_pins";
import { enumHubGoalRewards } from "../game/tutorial_goals";
import { enumHubGoalRewardsToContentUnlocked } from "../game/tutorial_goals_mappings";
import { enumCategories } from "../profile/application_settings";
import { enumLocalSavegameStatus } from "../savegame/savegame_manager";
import { types } from "../savegame/serialization";
import { AboutState } from "../states/about";
import { ChangelogState } from "../states/changelog";
import { InGameState } from "../states/ingame";
import { KeybindingsState } from "../states/keybindings";
import { MainMenuState } from "../states/main_menu";
import { MobileWarningState } from "../states/mobile_warning";
import { PreloadState } from "../states/preload";
import { SettingsState } from "../states/settings";
import { T } from "../translations";

const Toposort = require("toposort-class");

export class ModManager {
    constructor() {
        /** @type {Map<String, ModInfo>} */
        this.mods = new Map();

        window["shapezAPI"] = new ShapezAPI();

        /**
         * Registers a mod
         * @param {ModInfo} mod
         */
        window.registerMod = mod => {
            this.registerMod(mod);
        };
    }

    registerMod(mod) {
        for (const key in INFOType) {
            if (!INFOType.hasOwnProperty(key)) continue;
            if (mod.hasOwnProperty(key)) continue;

            if (mod.id) console.warn("Mod with mod id: " + mod.id + " has no " + key + " specified");
            else console.warn("Unknown mod has no " + key + " specified");

            return;
        }

        if (!mod.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
            console.warn("Mod with mod id: " + mod.id + " has no uuid");
            return;
        }

        if (this.mods.has(mod.id)) {
            console.warn("Mod with mod id: " + mod.id + " already registerd");
            return;
        }

        this.mods.set(mod.id, mod);
    }

    /**
     * Adds a mod to the page
     * @param {String} url
     * @returns {Promise}
     */
    addMod(url) {
        return Promise.race([
                new Promise((resolve, reject) => {
                    setTimeout(reject, 60 * 1000);
                }),
                fetch(url, {
                    method: "GET",
                    cache: "no-cache",
                }),
            ])
            .then(res => res.text())
            .catch(err => {
                err(this, "Failed to load mod:", err);
                return Promise.reject("Downloading from '" + url + "' timed out");
            })
            .then(modCode => {
                return Promise.race([
                    new Promise((resolve, reject) => {
                        setTimeout(reject, 60 * 1000);
                    }),
                    new Promise((resolve, reject) => {
                        this.nextModResolver = resolve;
                        this.nextModRejector = reject;

                        const modScript = document.createElement("script");
                        modScript.textContent = modCode;
                        modScript.type = "text/javascript";
                        try {
                            document.head.appendChild(modScript);
                            resolve();
                        } catch (ex) {
                            console.error("Failed to insert mod, bad js:", ex);
                            this.nextModResolver = null;
                            this.nextModRejector = null;
                            reject("Mod is invalid");
                        }
                    }),
                ]);
            })
            .catch(err => {
                err(this, "Failed to initializing mod:", err);
                return Promise.reject("Initializing mod failed: " + err);
            });
    }

    /**
     * Adds a mod to the page
     * @param {Array<String>} urls
     */
    addMods(urls) {
        let promise = Promise.resolve(null);

        for (let i = 0; i < urls.length; ++i) {
            const url = urls[i];

            promise = promise.then(() => {
                return this.addMod(url);
            });
        }

        return promise;
    }

    /**
     * Loads all mods in the mods list
     */
    loadMods() {
        window["shapezAPI"].mods = this.mods;

        var sorter = new Toposort();
        for (const [id, mod] of this.mods.entries()) {
            let isMissingDependecie = false;
            let missingDependecie = "";
            for (let i = 0; i < mod.dependencies.length; i++) {
                const dependencie = mod.dependencies[i];
                if (this.mods.has(dependencie)) continue;
                isMissingDependecie = true;
                missingDependecie = dependencie;
            }

            if (isMissingDependecie) {
                console.warn(
                    "Mod with mod id: " +
                    mod.id +
                    " is disabled because it's missings the dependecie " +
                    missingDependecie
                );
                continue;
            } else sorter.add(id, mod.dependencies);
        }

        var sortedKeys = sorter.sort().reverse();
        for (let i = 0; i < sortedKeys.length; i++) {
            this.loadMod(sortedKeys[i]);
        }
    }

    /**
     * Calls the main mod function
     * @param {String} id
     */
    loadMod(id) {
        var mod = this.mods.get(id);
        for (const [id, currentMod] of this.mods.entries()) {
            if (mod.incompatible.indexOf(id) >= 0) {
                console.warn(
                    "Mod with mod id: " + mod.id + " is disabled because it's incompatible with " + id
                );
                return;
            }
        }
        mod.main();
    }
}

export class ShapezAPI {
    constructor() {
        this.exports = {
            MetaBuilding,
            Vector,
            Component,
            BaseItem,
            GameSystemWithFilter,
            GameSystem,
            GameState,
            TextualGameState,

            //Functions,
            cachebust,

            //Variables
            defaultBuildingVariant,
            types,

            //States
            InGameState,
            SettingsState,
            AboutState,
            MainMenuState,
            ChangelogState,
            KeybindingsState,
            PreloadState,
            MobileWarningState,

            //Systems
            ItemAcceptorSystem,
            BeltSystem,
            UndergroundBeltSystem,
            MinerSystem,
            StorageSystem,
            ItemProcessorSystem,
            FilterSystem,
            ItemProducerSystem,
            ItemEjectorSystem,
            MapResourcesSystem,
            HubSystem,
            StaticMapEntitySystem,
            WiredPinsSystem,
            BeltUnderlaysSystem,
            ConstantSignalSystem,
            LeverSystem,
            WireSystem,
            LogicGateSystem,
            BeltReaderSystem,
            DisplaySystem,
            ItemProcessorOverlaysSystem,

            //Components
            BeltReaderComponent,
            BeltUnderlaysComponent,
            BeltComponent,
            ConstantSignalComponent,
            DisplayComponent,
            FilterComponent,
            HubComponent,
            ItemAcceptorComponent,
            ItemEjectorComponent,
            ItemProcessorComponent,
            ItemProducerComponent,
            LeverComponent,
            LogicGateComponent,
            MinerComponent,
            StaticMapEntityComponent,
            StorageComponent,
            UndergroundBeltComponent,
            WireTunnelComponent,
            WireComponent,
            WiredPinsComponent,

            //Enums
            enumHubGoalRewards,
            enumAnalyticsDataSource,
            enumAngleToDirection,
            enumCategories,
            enumClippedBeltUnderlayType,
            enumColorMixingResults,
            enumColors,
            enumColorsToHexCode,
            enumColorToShortcode,
            enumDirection,
            enumDirectionToAngle,
            enumDirectionToVector,
            enumDisplayMode,
            enumHubGoalRewardsToContentUnlocked,
            enumInvertedDirections,
            enumItemProcessorRequirements,
            enumItemProcessorTypes,
            enumLocalSavegameStatus,
            enumMouseButton,
            enumNotificationType,
            enumSavePriority,
        };

        this.KEYMAPPINGS = KEYMAPPINGS;
        this.KEYMAPPINGS.key = str => str.toUpperCase().charCodeAt(0);

        //TODO: mutliple languages
        this.translations = T;

        this.mods = new Map();

        this.ingame = {
            buildings: {},
            components: {},
            //Must be array because of update order
            systems: [],
            items: {},
            levels: {},
            themes: {},
            hub_goals: HubGoals,
        };

        this.toolbars = {
            buildings: HUDBuildingsToolbar.bar,
            wires: HUDWiresToolbar.bar,
        };

        this.states = Application.states;

        this.clickDetectors = [];
    }

    /**
     * Generates rotated variants of the matrix
     * @param {Array<number>} originalMatrix
     * @returns {Object<number, Array<number>>}
     */
    generateMatrixRotations(originalMatrix) {
        return generateMatrixRotations(originalMatrix);
    }

    /**
     * Registers a new sprite
     * @param {string} spriteId
     * @param {HTMLImageElement|HTMLCanvasElement} sourceImage
     * @returns {RegularSprite}
     */
    registerSprite(spriteId, sourceImage) {
        const sprite = new RegularSprite(sourceImage, sourceImage.width, sourceImage.height);
        assertAlways(!Loader.sprites[spriteId], "Can not override builtin sprite: " + spriteId);
        Loader.sprites[spriteId] = sprite;
        return sprite;
    }

    /**
     * Returns a regular sprite by its id
     * @param {string} id
     * @returns {RegularSprite}
     */
    getRegularSprite(id) {
        return Loader.getRegularSprite(id);
    }

    /**
     * Registers a new atlas
     * @param {string} atlasDataString
     */
    registerAtlas(atlasDataString) {
        var atlasData = JSON.parse(atlasDataString);
        var sourceImage = new Image();
        sourceImage.crossOrigin = "anonymous";
        sourceImage.onload = () => {
            // @ts-ignore
            Loader.internalParseAtlas({
                    meta: atlasData.atlasData.meta,
                    sourceData: atlasData.atlasData.frames,
                },
                sourceImage
            );
        };
        sourceImage.src = atlasData.src;
    }

    /**
     * Registers a new atlases
     * @param {string[]} atlasDataStrings
     */
    registerAtlases(...atlasDataStrings) {
        for (let i = 0; i < atlasDataStrings.length; i++) {
            this.registerAtlas(atlasDataStrings[i]);
        }
    }

    /**
     * Adds css to the page
     * @param {string} css
     */
    injectCss(css, id) {
        var head = document.head || document.getElementsByTagName("head")[0];
        var style = document.createElement("style");
        style.id = id;

        head.appendChild(style);

        style.appendChild(document.createTextNode(css));
    }

    /**
     * Registers a new icon
     * @param {string} buildingId
     * @param {string} iconDataURL
     */
    registerBuildingIcon(buildingId, iconDataURL) {
        var css = ``;
        var style = undefined;
        if (!(style = document.getElementById("mod-loader-icons"))) {
            var head = document.head || document.getElementsByTagName("head")[0];
            style = document.createElement("style");
            style.id = "mod-loader-icons";
            style.appendChild(document.createTextNode(css));
            head.appendChild(style);
        }
        css = `
            [data-icon="building_icons/${buildingId}.png"] {
                background-image: url(${iconDataURL}) !important;
            }
        `;
        style.appendChild(document.createTextNode(css));
    }

    registerBuilding(buildingClass, iconDataURL, key, keyBindingName, buildingInfoText) {
        var id = new buildingClass().getId();
        this.ingame.buildings[id] = buildingClass;
        this.registerBuildingIcon(id, iconDataURL);
        this.KEYMAPPINGS.buildings[id] = { keyCode: this.KEYMAPPINGS.key(key), id: id };
        //TODO: multiple translations
        this.translations.keybindings.mappings[id] = keyBindingName;
        this.translations.buildings[id] = buildingInfoText;
    }

    /**
     * Tracks clicks on a element (e.g. button). Useful because you should both support
     * touch and mouse events.
     * @param {HTMLElement} element
     * @param {function} clickHandler
     */
    trackClicks(element, clickHandler) {
        const clickDetector = new ClickDetector(element, {
            consumeEvents: true,
            preventDefault: true,
        });
        clickDetector.click.add(clickHandler);
        this.clickDetectors.push(clickDetector);
    }
}