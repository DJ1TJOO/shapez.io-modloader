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
 * translations: {},
 * settings: {},
 * updateStaticSettings: Function,
 * updateStaticTranslations: Function,
 * gameInitializedRootClasses: Function,
 * gameInitializedRootManagers: Function,
 * gameBeforeFirstUpdate: Function,
 * main: Function,
 * }} ModInfo
 */
import { STOP_PROPAGATION } from "../core/signal";
import { Application } from "../application";
import { cachebust } from "../core/cachebust";
import { ClickDetector } from "../core/click_detector";
import { GameState } from "../core/game_state";
import { Loader } from "../core/loader";
import { AtlasSprite, RegularSprite } from "../core/sprites";
import { TextualGameState } from "../core/textual_game_state";
import {
    clamp,
    findNiceIntegerValue,
    formatItemsPerSecond,
    generateFileDownload,
    generateMatrixRotations,
    makeDiv,
    removeAllChildren,
} from "../core/utils";
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
import { GameMode } from "../game/game_mode";
import { GameSystem } from "../game/game_system";
import { GameSystemWithFilter } from "../game/game_system_with_filter";
import { HubGoals } from "../game/hub_goals";
import { HUDBaseToolbar } from "../game/hud/parts/base_toolbar";
import { HUDBuildingsToolbar } from "../game/hud/parts/buildings_toolbar";
import { enumNotificationType } from "../game/hud/parts/notifications";
import { enumDisplayMode } from "../game/hud/parts/statistics_handle";
import { HUDWiresToolbar } from "../game/hud/parts/wires_toolbar";
import { BooleanItem, BOOL_FALSE_SINGLETON, BOOL_TRUE_SINGLETON } from "../game/items/boolean_item";
import { ColorItem } from "../game/items/color_item";
import { ShapeItem } from "../game/items/shape_item";
import { KEYMAPPINGS } from "../game/key_action_mapper";
import { MapChunk } from "../game/map_chunk";
import { defaultBuildingVariant, MetaBuilding } from "../game/meta_building";
import { RegularGameMode } from "../game/modes/regular";
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
import { VANILLA_THEMES } from "../game/theme";
import { BaseGameSpeed } from "../game/time/base_game_speed";
import { FastForwardGameSpeed } from "../game/time/fast_forward_game_speed";
import { PausedGameSpeed } from "../game/time/paused_game_speed";
import { RegularGameSpeed } from "../game/time/regular_game_speed";
import { enumHubGoalRewards } from "../game/tutorial_goals";
import { enumHubGoalRewardsToContentUnlocked } from "../game/tutorial_goals_mappings";
import { enumCategories } from "../profile/application_settings";
import { EnumSetting, BoolSetting, RangeSetting, BaseSetting } from "../profile/setting_types";
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
import { matchOverwriteRecursiveSettings } from "./modmanager";
import { SOUNDS } from "../platform/sound";

export class ShapezAPI {
    constructor(discordId, username, tag) {
        this.discordId = discordId;
        this.username = username;
        this.tag = tag;
        this.exports = {
            MetaBuilding,
            Vector,
            Component,
            BaseItem,
            BaseGameSpeed,
            GameSystemWithFilter,
            GameSystem,
            GameState,
            GameMode,
            TextualGameState,
            HUDBaseToolbar,

            //Settings
            EnumSetting,
            BoolSetting,
            RangeSetting,
            BaseSetting,

            //Functions,
            cachebust,
            clamp,
            findNiceIntegerValue,
            generateFileDownload,
            matchOverwriteRecursiveSettings,
            removeAllChildren,
            makeDiv,
            generateMatrixRotations,
            formatItemsPerSecond,

            //Variables
            defaultBuildingVariant,
            types,
            STOP_PROPAGATION,
            SOUNDS,
            BOOL_TRUE_SINGLETON,
            BOOL_FALSE_SINGLETON,

            //Gamemodes
            RegularGameMode,

            //Gamespeed
            PausedGameSpeed,
            FastForwardGameSpeed,
            RegularGameSpeed,

            //Items
            ShapeItem,
            BooleanItem,
            ColorItem,

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

        this.firstState = "MainMenuState";
        this.KEYMAPPINGS = KEYMAPPINGS;
        this.KEYMAPPINGS.key = str => str.toUpperCase().charCodeAt(0);

        this.mods = new Map();
        this.modOrder = [];

        this.translations = T;

        this.map = {
            MapChunk,
            MapResourcesSystem,
        };

        this.ingame = {
            buildings: {},
            components: {},
            //Must be array because of update order
            systems: [],
            items: {},
            gamemodes: {},
            gamespeed: {},
            //List of layer names
            layers: [],
            hub_goals: HubGoals,
        };

        this.toolbars = {
            buildings: HUDBuildingsToolbar.bar,
            wires: HUDWiresToolbar.bar,
        };

        this.themes = VANILLA_THEMES;

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
     * Returns a regular sprite by its id
     * @param {string} id
     * @returns {AtlasSprite}
     */
    getSprite(id) {
        return Loader.getSprite(id);
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
     * @param {string} id
     * @param {string} iconDataURL
     */
    registerIcon(id, iconDataURL) {
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
            [data-icon="${id}.png"] {
                background-image: url(${iconDataURL}) !important;
            }
        `;
        style.appendChild(document.createTextNode(css));
    }

    registerBuilding(buildingClass, iconDataURL, key) {
        //TODO: update test mod
        var id = new buildingClass().getId();
        this.ingame.buildings[id] = buildingClass;
        this.registerIcon("building_icons/" + id, iconDataURL);
        this.KEYMAPPINGS.buildings[id] = { keyCode: this.KEYMAPPINGS.key(key), id: id };
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