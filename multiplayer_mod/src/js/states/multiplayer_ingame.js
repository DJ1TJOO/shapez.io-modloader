import { DataPacket, FlagPacket, FlagPacketFlags, MultiplayerPacket, MultiplayerPacketTypes, SignalPacket, SignalPacketSignals, StringSerializable, TextPacket, TextPacketTypes } from "../multiplayer_packets";
import { MultiplayerSavegame } from "../multiplayer_savegame";

const APPLICATION_ERROR_OCCURED = shapezAPI.exports.APPLICATION_ERROR_OCCURED;
const Signal = shapezAPI.exports.Signal;
const getBuildingDataFromCode = shapezAPI.exports.getBuildingDataFromCode;
const logSection = shapezAPI.exports.logSection;
const createLogger = shapezAPI.exports.createLogger;
const waitNextFrame = shapezAPI.exports.waitNextFrame;
const globalConfig = shapezAPI.exports.globalConfig;
const GameLoadingOverlay = shapezAPI.exports.GameLoadingOverlay;
const KeyActionMapper = shapezAPI.exports.KeyActionMapper;
const Savegame = shapezAPI.exports.Savegame;
const GameCore = shapezAPI.exports.GameCore;
const Dialog = shapezAPI.exports.Dialog;
const Vector = shapezAPI.exports.Vector;
const MUSIC = shapezAPI.exports.MUSIC;
const KEYMAPPINGS = shapezAPI.KEYMAPPINGS;

const logger = createLogger("state/ingame");
const { v4: uuidv4 } = require("uuid");
const wrtc = require("wrtc");
const Peer = require("simple-peer");
const io = require("socket.io-client");

// Different sub-states
const stages = {
    s3_createCore: "🌈 3: Create core",
    s4_A_initEmptyGame: "🌈 4/A: Init empty game",
    s4_B_resumeGame: "🌈 4/B: Resume game",

    s5_firstUpdate: "🌈 5: First game update",
    s6_postLoadHook: "🌈 6: Post load hook",
    s7_warmup: "🌈 7: Warmup",

    s10_gameRunning: "🌈 10: Game finally running",

    leaving: "🌈 Saving, then leaving the game",
    destroyed: "🌈 DESTROYED: Core is empty and waits for state leave",
    initFailed: "🌈 ERROR: Initialization failed!",
};

export const gameCreationAction = {
    new: "new-game",
    resume: "resume-game",
};

// Typehints
export class MultiplayerConnection {
    constructor(peer, gameData) {
        /** @type {Peer} */
        this.peer = peer;

        /** @type {object} */
        this.gameData = gameData;
    }
}

export class GameCreationPayload {
    constructor() {
        /** @type {boolean|undefined} */
        this.fastEnter;

        /** @type {Savegame} */
        this.savegame;

        /** @type {string|undefined} */
        this.connectionId;

        /** @type {MultiplayerConnection|undefined} */
        this.connection;

        /** @type {String|undefined} */
        this.host;
    }
}

export class InMultiplayerGameState extends shapezAPI.exports.GameState {
    constructor() {
        super("InMultiplayerGameState");

        /** @type {GameCreationPayload} */
        this.creationPayload = null;

        // Stores current stage
        this.stage = "";

        /** @type {GameCore} */
        this.core = null;

        /** @type {KeyActionMapper} */
        this.keyActionMapper = null;

        /** @type {GameLoadingOverlay} */
        this.loadingOverlay = null;

        /** @type {Savegame} */
        this.savegame = null;

        this.boundInputFilter = this.filterInput.bind(this);

        /**
         * Whether we are currently saving the game
         * @TODO: This doesn't realy fit here
         */
        this.currentSavePromise = null;
    }

    /**
     * Switches the game into another sub-state
     * @param {string} stage
     */
    switchStage(stage) {
        assert(stage, "Got empty stage");
        if (stage !== this.stage) {
            this.stage = stage;
            logger.log(this.stage);
            return true;
        } else {
            // log(this, "Re entering", stage);
            return false;
        }
    }

    // GameState implementation
    getInnerHTML() {
        return "";
    }

    getThemeMusic() {
        return MUSIC.theme;
    }

    onBeforeExit() {
        // logger.log("Saving before quitting");
        // return this.doSave().then(() => {
        //     logger.log(this, "Successfully saved");
        //     // this.stageDestroyed();
        // });
    }

    onAppPause() {
        // if (this.stage === stages.s10_gameRunning) {
        //     logger.log("Saving because app got paused");
        //     this.doSave();
        // }
    }

    getHasFadeIn() {
        return false;
    }

    getPauseOnFocusLost() {
        return false;
    }

    getHasUnloadConfirmation() {
        return true;
    }

    onLeave() {
        if (this.core) {
            this.stageDestroyed();
        }
        this.app.inputMgr.dismountFilter(this.boundInputFilter);
    }

    onResized(w, h) {
        super.onResized(w, h);
        if (this.stage === stages.s10_gameRunning) {
            this.core.resize(w, h);
        }
    }

    // ---- End of GameState implementation

    /**
     * Goes back to the menu state
     */
    goBackToMenu() {
        this.saveThenGoToState("MainMenuState");
    }

    /**
     * Goes back to the settings state
     */
    goToSettings() {
        this.saveThenGoToState("SettingsState", {
            backToStateId: this.key,
            backToStatePayload: this.creationPayload,
        });
    }

    /**
     * Goes back to the settings state
     */
    goToKeybindings() {
        this.saveThenGoToState("KeybindingsState", {
            backToStateId: this.key,
            backToStatePayload: this.creationPayload,
        });
    }

    /**
     * Moves to a state outside of the game
     * @param {string} stateId
     * @param {any=} payload
     */
    saveThenGoToState(stateId, payload) {
        if (this.stage === stages.leaving || this.stage === stages.destroyed) {
            logger.warn("Tried to leave game twice or during destroy:", this.stage, "(attempted to move to", stateId, ")");
            return;
        }
        this.stageLeavingGame();
        this.doSave().then(() => {
            this.stageDestroyed();
            this.moveToState(stateId, payload);
        });
    }

    onBackButton() {
        // do nothing
    }

    /**
     * Called when the game somehow failed to initialize. Resets everything to basic state and
     * then goes to the main menu, showing the error
     * @param {string} err
     */
    onInitializationFailure(err) {
        if (this.switchStage(stages.initFailed)) {
            logger.error("Init failure:", err);
            this.stageDestroyed();
            this.moveToState("MainMenuState", { loadError: err });
        }
    }

    // STAGES

    /**
     * Creates the game core instance, and thus the root
     */
    stage3CreateCore() {
        if (this.switchStage(stages.s3_createCore)) {
            logger.log("Creating new game core");
            this.core = new GameCore(this.app);

            this.core.initializeRoot(this, this.savegame);

            if (this.connection) {
                this.multiplayerSavegame = new MultiplayerSavegame(this.app, this.connection.gameData);
                this.core.initializeRoot(this, this.multiplayerSavegame);

                console.log(this.multiplayerSavegame);
                if (this.multiplayerSavegame.hasGameDump()) {
                    this.stage4bResumeGame();
                } else {
                    this.onInitializationFailure("The multiplayer game could not be loaded.");
                }
            } else {
                this.core.initializeRoot(this, this.savegame);

                if (this.savegame.hasGameDump()) {
                    this.stage4bResumeGame();
                } else {
                    this.app.gameAnalytics.handleGameStarted();
                    this.stage4aInitEmptyGame();
                }
            }
        }
    }

    /**
     * Initializes a new empty game
     */
    stage4aInitEmptyGame() {
        if (this.switchStage(stages.s4_A_initEmptyGame)) {
            this.core.initNewGame();
            this.stage5FirstUpdate();
        }
    }

    /**
     * Resumes an existing game
     */
    stage4bResumeGame() {
        if (this.switchStage(stages.s4_B_resumeGame)) {
            if (this.core.initExistingGame().isBad()) {
                var errorJSON = this.core.initExistingGame().reason;
                // if (errorJSON.status) {
                //     this.onInitializationFailure("Savegame is corrupt and can not be restored.");
                //     //TODO: load game without mod
                //     // if (errorJSON.status === "missing")
                //     //     this.core.root.hud.parts.dialogs.showOptionChooser(
                //     //     "Missing " + errorJSON.type + " with id " + errorJSON.id, {
                //     //         options: [{ value: "Test", text: "TEst" }],
                //     //     }
                //     // );
                // } else {
                this.onInitializationFailure("Savegame is corrupt and can not be restored.");
                // }
                return;
            }
            this.app.gameAnalytics.handleGameResumed();
            this.core.root.signals.constantSignalChange = new Signal();
            this.stage5FirstUpdate();
        }
    }

    /**
     * Performs the first game update on the game which initializes most caches
     */
    stage5FirstUpdate() {
        if (this.switchStage(stages.s5_firstUpdate)) {
            //Call mod for gameload
            for (let i = 0; i < shapezAPI.modOrder.length; i++) {
                const modId = shapezAPI.modOrder[i];
                shapezAPI.mods.get(modId).gameBeforeFirstUpdate(this.core.root);
            }
            this.core.root.logicInitialized = true;
            this.core.updateLogic();
            this.stage6PostLoadHook();
        }
    }

    /**
     * Call the post load hook, this means that we have loaded the game, and all systems
     * can operate and start to work now.
     */
    stage6PostLoadHook() {
        if (this.switchStage(stages.s6_postLoadHook)) {
            logger.log("Post load hook");
            this.core.postLoadHook();
            this.stage7Warmup();
        }
    }

    /**
     * This makes the game idle and draw for a while, because we run most code this way
     * the V8 engine can already start to optimize it. Also this makes sure the resources
     * are in the VRAM and we have a smooth experience once we start.
     */
    stage7Warmup() {
        if (this.switchStage(stages.s7_warmup)) {
            if (this.creationPayload.fastEnter) {
                this.warmupTimeSeconds = globalConfig.warmupTimeSecondsFast;
            } else {
                this.warmupTimeSeconds = globalConfig.warmupTimeSecondsRegular;
            }
        }
    }

    /**
     * Tries to delete the given building
     */
    tryDeleteBuilding(building) {
        if (!this.core.root.logic.canDeleteBuilding(building)) {
            return false;
        }
        this.multiplayerDestroy.push(building.uid);
        this.core.root.map.removeStaticEntity(building);
        this.core.root.entityMgr.destroyEntity(building);
        this.core.root.entityMgr.processDestroyList();
        return true;
    }

    /**
     * Removes all entities with a RemovableMapEntityComponent which need to get
     * removed before placing this entity
     */
    freeEntityAreaBeforeBuild(entity) {
        const staticComp = entity.components.StaticMapEntity;
        const rect = staticComp.getTileSpaceBounds();
        // Remove any removeable colliding entities on the same layer
        for (let x = rect.x; x < rect.x + rect.w; ++x) {
            for (let y = rect.y; y < rect.y + rect.h; ++y) {
                const contents = this.core.root.map.getLayerContentXY(x, y, entity.layer);
                if (contents) {
                    assertAlways(contents.components.StaticMapEntity.getMetaBuilding().getIsReplaceable(getBuildingDataFromCode(contents.components.StaticMapEntity.code).variant), "Tried to replace non-repleaceable entity");
                    if (!this.tryDeleteBuilding(contents)) {
                        assertAlways(false, "Tried to replace non-repleaceable entity #2");
                    }
                }
            }
        }

        // Perform other callbacks
        this.core.root.signals.freeEntityAreaBeforeBuild.dispatch(entity);
    }

    /**
     * Attempts to place the given building
     */
    tryPlaceBuilding({ origin, rotation, rotationVariant, originalRotation, variant, building }, uid) {
        const entity = building.createEntity({
            root: this.core.root,
            origin,
            rotation,
            originalRotation,
            rotationVariant,
            variant,
        });
        if (entity.components.ConstantSignal) {
            const constantSignalComponent = entity.components.ConstantSignal;
            const constantSignalChange = this.core.root.signals.constantSignalChange;

            let component = new Proxy(constantSignalComponent, {
                set: (target, key, value) => {
                    target[key] = value;
                    constantSignalChange.dispatch(entity, target);
                    return true;
                },
            });
            entity.components.ConstantSignal = component;
        }
        if (this.core.root.logic.checkCanPlaceEntity(entity)) {
            this.freeEntityAreaBeforeBuild(entity);
            this.core.root.map.placeStaticEntity(entity);
            this.core.root.entityMgr.registerEntity(entity, uid);
            this.core.root.entityMgr.nextUid = uid + 1;
            return entity;
        }
        return null;
    }

    /**
     * Tries to place the current building at the given tile
     * @param {Vector} tile
     */
    tryPlaceCurrentBuildingAt(tile, entityPayload, uid) {
        if (this.core.root.camera.zoomLevel < globalConfig.mapChunkOverviewMinZoom) {
            // Dont allow placing in overview mode
            return;
        }

        if (this.core.root.entityMgr.findByUid(uid)) return false;

        const metaBuilding = entityPayload.building;
        const entity = this.tryPlaceBuilding({
                origin: tile,
                rotation: entityPayload.rotation,
                rotationVariant: entityPayload.rotationVariant,
                originalRotation: entityPayload.originalRotation,
                building: metaBuilding,
                variant: entityPayload.variant,
            },
            uid
        );

        if (entity) {
            return true;
        } else {
            return false;
        }
    }

    //TODO:
    drawRegularPlacement(parameters, metaBuilding, currentVariant, currentBaseRotation, fakeEntity) {
        const mousePosition = this.core.root.app.mousePosition;
        if (!mousePosition) {
            // Not on screen
            return;
        }

        const worldPos = this.core.root.camera.screenToWorld(mousePosition);
        const mouseTile = worldPos.toTileSpace();

        // Compute best rotation variant
        const { rotation, rotationVariant, connectedEntities } = metaBuilding.computeOptimalDirectionAndRotationVariantAtTile({
            root: this.core.root,
            tile: mouseTile,
            rotation: currentBaseRotation,
            variant: currentVariant,
            layer: metaBuilding.getLayer(this.core.root, currentVariant),
        });

        // Check if there are connected entities
        if (connectedEntities) {
            for (let i = 0; i < connectedEntities.length; ++i) {
                const connectedEntity = connectedEntities[i];
                const connectedWsPoint = connectedEntity.components.StaticMapEntity.getTileSpaceBounds().getCenter().toWorldSpace();

                const startWsPoint = mouseTile.toWorldSpaceCenterOfTile();

                const startOffset = connectedWsPoint
                    .sub(startWsPoint)
                    .normalize()
                    .multiplyScalar(globalConfig.tileSize * 0.3);
                const effectiveStartPoint = startWsPoint.add(startOffset);
                const effectiveEndPoint = connectedWsPoint.sub(startOffset);

                parameters.context.globalAlpha = 0.6;

                // parameters.context.lineCap = "round";
                parameters.context.strokeStyle = "#7f7";
                parameters.context.lineWidth = 10;
                parameters.context.beginPath();
                parameters.context.moveTo(effectiveStartPoint.x, effectiveStartPoint.y);
                parameters.context.lineTo(effectiveEndPoint.x, effectiveEndPoint.y);
                parameters.context.stroke();
                parameters.context.globalAlpha = 1;
                // parameters.context.lineCap = "square";
            }
        }

        // Synchronize rotation and origin
        fakeEntity.layer = metaBuilding.getLayer(this.core.root, currentVariant);
        const staticComp = fakeEntity.components.StaticMapEntity;
        staticComp.origin = mouseTile;
        staticComp.rotation = rotation;
        metaBuilding.updateVariants(fakeEntity, rotationVariant, currentVariant);
        staticComp.code = shapezAPI.exports.getCodeFromBuildingData(metaBuilding, currentVariant, rotationVariant);

        const canBuild = this.core.root.logic.checkCanPlaceEntity(fakeEntity);

        // Fade in / out
        parameters.context.lineWidth = 1;

        // Determine the bounds and visualize them
        const entityBounds = staticComp.getTileSpaceBounds();
        const drawBorder = -3;
        if (canBuild) {
            parameters.context.strokeStyle = "rgba(56, 235, 111, 0.5)";
            parameters.context.fillStyle = "rgba(56, 235, 111, 0.2)";
        } else {
            parameters.context.strokeStyle = "rgba(255, 0, 0, 0.2)";
            parameters.context.fillStyle = "rgba(255, 0, 0, 0.2)";
        }

        parameters.context.beginRoundedRect(entityBounds.x * globalConfig.tileSize - drawBorder, entityBounds.y * globalConfig.tileSize - drawBorder, entityBounds.w * globalConfig.tileSize + 2 * drawBorder, entityBounds.h * globalConfig.tileSize + 2 * drawBorder, 4);
        parameters.context.stroke();
        // parameters.context.fill();
        parameters.context.globalAlpha = 1;

        // HACK to draw the entity sprite
        const previewSprite = metaBuilding.getBlueprintSprite(rotationVariant, currentVariant);
        staticComp.origin = worldPos.divideScalar(globalConfig.tileSize).subScalars(0.5, 0.5);
        staticComp.drawSpriteOnBoundsClipped(parameters, previewSprite);
        staticComp.origin = mouseTile;

        // Draw ejectors
        if (canBuild) {
            this.drawMatchingAcceptorsAndEjectors(parameters, fakeEntity);
        }
    }

    drawMatchingAcceptorsAndEjectors(parameters, fakeEntity) {
        const acceptorComp = fakeEntity.components.ItemAcceptor;
        const ejectorComp = fakeEntity.components.ItemEjector;
        const staticComp = fakeEntity.components.StaticMapEntity;
        const beltComp = fakeEntity.components.Belt;
        const minerComp = fakeEntity.components.Miner;

        const goodArrowSprite = shapezAPI.exports.Loader.getSprite("sprites/misc/slot_good_arrow.png");
        const badArrowSprite = shapezAPI.exports.Loader.getSprite("sprites/misc/slot_bad_arrow.png");

        // Just ignore the following code please ... thanks!

        const offsetShift = 10;

        let acceptorSlots = [];
        let ejectorSlots = [];

        if (ejectorComp) {
            ejectorSlots = ejectorComp.slots.slice();
        }

        if (acceptorComp) {
            acceptorSlots = acceptorComp.slots.slice();
        }

        if (beltComp) {
            const fakeEjectorSlot = beltComp.getFakeEjectorSlot();
            const fakeAcceptorSlot = beltComp.getFakeAcceptorSlot();
            ejectorSlots.push(fakeEjectorSlot);
            acceptorSlots.push(fakeAcceptorSlot);
        }

        for (let acceptorSlotIndex = 0; acceptorSlotIndex < acceptorSlots.length; ++acceptorSlotIndex) {
            const slot = acceptorSlots[acceptorSlotIndex];

            const acceptorSlotWsTile = staticComp.localTileToWorld(slot.pos);
            const acceptorSlotWsPos = acceptorSlotWsTile.toWorldSpaceCenterOfTile();

            // Go over all slots
            for (let acceptorDirectionIndex = 0; acceptorDirectionIndex < slot.directions.length; ++acceptorDirectionIndex) {
                const direction = slot.directions[acceptorDirectionIndex];
                const worldDirection = staticComp.localDirectionToWorld(direction);

                // Figure out which tile ejects to this slot
                const sourceTile = acceptorSlotWsTile.add(shapezAPI.exports.enumDirectionToVector[worldDirection]);

                let isBlocked = false;
                let isConnected = false;

                // Find all entities which are on that tile
                const sourceEntities = this.root.map.getLayersContentsMultipleXY(sourceTile.x, sourceTile.y);

                // Check for every entity:
                for (let i = 0; i < sourceEntities.length; ++i) {
                    const sourceEntity = sourceEntities[i];
                    const sourceEjector = sourceEntity.components.ItemEjector;
                    const sourceBeltComp = sourceEntity.components.Belt;
                    const sourceStaticComp = sourceEntity.components.StaticMapEntity;
                    const ejectorAcceptLocalTile = sourceStaticComp.worldToLocalTile(acceptorSlotWsTile);

                    // If this entity is on the same layer as the slot - if so, it can either be
                    // connected, or it can not be connected and thus block the input
                    if (sourceEjector && sourceEjector.anySlotEjectsToLocalTile(ejectorAcceptLocalTile)) {
                        // This one is connected, all good
                        isConnected = true;
                    } else if (sourceBeltComp && sourceStaticComp.localDirectionToWorld(sourceBeltComp.direction) === shapezAPI.exports.enumInvertedDirections[worldDirection]) {
                        // Belt connected
                        isConnected = true;
                    } else {
                        // This one is blocked
                        isBlocked = true;
                    }
                }

                const alpha = isConnected || isBlocked ? 1.0 : 0.3;
                const sprite = isBlocked ? badArrowSprite : goodArrowSprite;

                parameters.context.globalAlpha = alpha;
                shapezAPI.exports.drawRotatedSprite({
                    parameters,
                    sprite,
                    x: acceptorSlotWsPos.x,
                    y: acceptorSlotWsPos.y,
                    angle: Math.radians(shapezAPI.exports.enumDirectionToAngle[shapezAPI.exports.enumInvertedDirections[worldDirection]]),
                    size: 13,
                    offsetY: offsetShift + 13,
                });
                parameters.context.globalAlpha = 1;
            }
        }

        // Go over all slots
        for (let ejectorSlotIndex = 0; ejectorSlotIndex < ejectorSlots.length; ++ejectorSlotIndex) {
            const slot = ejectorSlots[ejectorSlotIndex];

            const ejectorSlotLocalTile = slot.pos.add(shapezAPI.exports.enumDirectionToVector[slot.direction]);
            const ejectorSlotWsTile = staticComp.localTileToWorld(ejectorSlotLocalTile);

            const ejectorSLotWsPos = ejectorSlotWsTile.toWorldSpaceCenterOfTile();
            const ejectorSlotWsDirection = staticComp.localDirectionToWorld(slot.direction);

            let isBlocked = false;
            let isConnected = false;

            // Find all entities which are on that tile
            const destEntities = this.root.map.getLayersContentsMultipleXY(ejectorSlotWsTile.x, ejectorSlotWsTile.y);

            // Check for every entity:
            for (let i = 0; i < destEntities.length; ++i) {
                const destEntity = destEntities[i];
                const destAcceptor = destEntity.components.ItemAcceptor;
                const destStaticComp = destEntity.components.StaticMapEntity;
                const destMiner = destEntity.components.Miner;

                const destLocalTile = destStaticComp.worldToLocalTile(ejectorSlotWsTile);
                const destLocalDir = destStaticComp.worldDirectionToLocal(ejectorSlotWsDirection);
                if (destAcceptor && destAcceptor.findMatchingSlot(destLocalTile, destLocalDir)) {
                    // This one is connected, all good
                    isConnected = true;
                } else if (destEntity.components.Belt && destLocalDir === shapezAPI.exports.enumDirection.top) {
                    // Connected to a belt
                    isConnected = true;
                } else if (minerComp && minerComp.chainable && destMiner && destMiner.chainable) {
                    // Chainable miners connected to eachother
                    isConnected = true;
                } else {
                    // This one is blocked
                    isBlocked = true;
                }
            }

            const alpha = isConnected || isBlocked ? 1.0 : 0.3;
            const sprite = isBlocked ? badArrowSprite : goodArrowSprite;

            parameters.context.globalAlpha = alpha;
            shapezAPI.exports.drawRotatedSprite({
                parameters,
                sprite,
                x: ejectorSLotWsPos.x,
                y: ejectorSLotWsPos.y,
                angle: Math.radians(shapezAPI.exports.enumDirectionToAngle[ejectorSlotWsDirection]),
                size: 13,
                offsetY: offsetShift,
            });
            parameters.context.globalAlpha = 1;
        }
    }

    /**
     * The final stage where this game is running and updating regulary.
     */
    stage10GameRunning() {
        if (this.switchStage(stages.s10_gameRunning)) {
            this.core.root.signals.readyToRender.dispatch();

            logSection("GAME STARTED", "#26a69a");

            // Initial resize, might have changed during loading (this is possible)
            this.core.resize(this.app.screenWidth, this.app.screenHeight);

            //Connect to signalling server
            if (this.connectionId) {
                var onOpen = (event) => {
                    this.core.root.signals.entityAdded.add((entity) => {
                        if (this.multiplayerPlace.includes(entity.uid)) return this.multiplayerPlace.splice(this.multiplayerPlace.indexOf(entity.uid), 1);
                        MultiplayerPacket.sendPacket(this.connection.peer, new SignalPacket(SignalPacketSignals.entityAdded, [entity]));

                        if (entity.components.ConstantSignal) {
                            const constantSignalComponent = entity.components.ConstantSignal;
                            const constantSignalChange = this.core.root.signals.constantSignalChange;

                            let component = new Proxy(constantSignalComponent, {
                                set: (target, key, value) => {
                                    target[key] = value;
                                    constantSignalChange.dispatch(entity, target);
                                    return true;
                                },
                            });
                            entity.components.ConstantSignal = component;
                        }
                    });
                    this.core.root.signals.entityDestroyed.add((entity) => {
                        if (this.multiplayerDestroy.includes(entity.uid)) return this.multiplayerDestroy.splice(this.multiplayerDestroy.indexOf(entity.uid), 1);

                        MultiplayerPacket.sendPacket(this.connection.peer, new SignalPacket(SignalPacketSignals.entityDestroyed, [entity]));
                    });
                    //TODO: only constantSignal for now
                    this.core.root.signals.constantSignalChange.add((entity, constantSignalComponent) => {
                        if (this.multiplayerConstantSignalChange.includes(entity.uid)) return this.multiplayerConstantSignalChange.splice(this.multiplayerConstantSignalChange.indexOf(entity.uid), 1);
                        MultiplayerPacket.sendPacket(this.connection.peer, new SignalPacket(SignalPacketSignals.entityComponentChanged, [entity, constantSignalComponent]));
                    });
                    this.core.root.signals.entityGotNewComponent.add((entity) => {
                        if (this.multipalyerComponentAdd.includes(entity.uid)) return this.multipalyerComponentAdd.splice(this.multipalyerComponentAdd.indexOf(entity.uid), 1);

                        MultiplayerPacket.sendPacket(this.connection.peer, new SignalPacket(SignalPacketSignals.entityComponentRemoved, [entity]));
                    });
                    this.core.root.signals.entityComponentRemoved.add((entity) => {
                        if (this.multipalyerComponentRemove.includes(entity.uid)) return this.multipalyerComponentRemove.splice(this.multipalyerComponentRemove.indexOf(entity.uid), 1);

                        MultiplayerPacket.sendPacket(this.connection.peer, new SignalPacket(SignalPacketSignals.entityComponentRemoved, [entity]));
                    });
                    this.core.root.signals.upgradePurchased.add((upgradeId) => {
                        if (this.multipalyerUnlockUpgrade.includes(upgradeId)) return this.multipalyerUnlockUpgrade.splice(this.multipalyerUnlockUpgrade.indexOf(upgradeId), 1);

                        MultiplayerPacket.sendPacket(this.connection.peer, new SignalPacket(SignalPacketSignals.upgradePurchased, [new StringSerializable(upgradeId)]));
                    });

                    MultiplayerPacket.sendPacket(this.connection.peer, new TextPacket(TextPacketTypes.JOINED_USER, shapezAPI.user.username));
                };

                var onMessage = (data) => {
                    var packet = JSON.parse(data);
                    if (packet.type === MultiplayerPacketTypes.SIGNAL) {
                        packet.args = MultiplayerPacket.deserialize(packet.args, this.core.root);
                        if (packet.signal === SignalPacketSignals.entityAdded) {
                            var entity = packet.args[0];

                            this.multiplayerPlace.push(entity.uid);

                            this.tryPlaceCurrentBuildingAt(
                                entity.components.StaticMapEntity.origin, {
                                    origin: entity.components.StaticMapEntity.origin,
                                    originalRotation: entity.components.StaticMapEntity.originalRotation,
                                    rotation: entity.components.StaticMapEntity.rotation,
                                    rotationVariant: getBuildingDataFromCode(entity.components.StaticMapEntity.code).rotationVariant,
                                    variant: getBuildingDataFromCode(entity.components.StaticMapEntity.code).variant,
                                    building: getBuildingDataFromCode(entity.components.StaticMapEntity.code).metaInstance,
                                },
                                entity.uid
                            );
                        }
                        if (packet.signal === SignalPacketSignals.entityDestroyed) {
                            let entity = this.core.root.entityMgr.findByUid(packet.args[0].uid);
                            if (entity !== null) {
                                this.multiplayerDestroy.push(entity.uid);
                                this.core.root.logic.tryDeleteBuilding(entity);
                            }
                        }
                        if (packet.signal === SignalPacketSignals.entityComponentChanged) {
                            let entity = this.core.root.entityMgr.findByUid(packet.args[0].uid);
                            let component = packet.args[1];
                            if (entity === null) return;
                            this.multiplayerConstantSignalChange.push(entity.uid);
                            for (const key in component) {
                                if (!component.hasOwnProperty(key)) continue;
                                entity.components[component.constructor.getId()][key] = component[key];
                            }
                        }
                        if (packet.signal === SignalPacketSignals.upgradePurchased) {
                            this.multipalyerUnlockUpgrade.push(packet.args[0].value);
                            this.core.root.hubGoals.tryUnlockUpgrade(packet.args[0].value);
                        }
                    } else if (packet.type === MultiplayerPacketTypes.TEXT) {
                        if (packet.textType === TextPacketTypes.MESSAGE) {
                            this.core.root.hud.parts.notifications.onNotification(packet.text, shapezAPI.exports.enumNotificationType.success);
                        }
                    }
                };

                this.connection.peer.on("connect", onOpen);
                onOpen();

                this.connection.peer.on("data", onMessage);
                this.connection.peer.on("close", () => {
                    console.log(this.connectionId + " closed");
                    this.goBackToMenu();
                });
                this.connection.peer.on("error", (err) => {
                    console.error(err);
                });
            } else {
                this.connectionId = uuidv4();
                // @ts-ignore
                var socket = io(this.host, { transport: ["websocket"] });
                var socketId = undefined;

                this.connections = [];
                socket.on("connect", () => {
                    socket.on("id", (id) => {
                        socketId = id;
                    });
                    socket.emit("createRoom", this.connectionId);

                    //Create peer
                    socket.on("createPeer", async(data) => {
                        const config = {
                            iceServers: [{
                                    urls: "stun:stun.1.google.com:19302",
                                },
                                {
                                    url: "turn:numb.viagenie.ca",
                                    credential: "muazkh",
                                    username: "webrtc@live.com",
                                },
                            ],
                        };
                        const peer = new Peer({ initiator: true, wrtc: wrtc, config: config });
                        const peerId = uuidv4();
                        peer.on("signal", (signalData) => {
                            console.log("Send signal");
                            console.log({
                                peerId: peerId,
                                signal: signalData,
                                senderId: socketId,
                                receiverId: data.receiverId,
                            });
                            socket.emit("signal", {
                                peerId: peerId,
                                signal: signalData,
                                senderId: socketId,
                                receiverId: data.receiverId,
                            });
                        });
                        socket.on("signal", (signalData) => {
                            if (socketId !== signalData.receiverId) return;
                            if (peerId !== signalData.peerId) return;
                            console.log("Received signal");
                            console.log(signalData);

                            peer.signal(signalData.signal);
                        });

                        var onOpen = async(event) => {
                            this.core.root.signals.entityAdded.add((entity) => {
                                if (this.multiplayerPlace.includes(entity.uid)) return this.multiplayerPlace.splice(this.multiplayerPlace.indexOf(entity.uid), 1);
                                MultiplayerPacket.sendPacket(peer, new SignalPacket(SignalPacketSignals.entityAdded, [entity]), this.connections);

                                if (entity.components.ConstantSignal) {
                                    const constantSignalComponent = entity.components.ConstantSignal;
                                    const constantSignalChange = this.core.root.signals.constantSignalChange;

                                    let component = new Proxy(constantSignalComponent, {
                                        set: (target, key, value) => {
                                            target[key] = value;
                                            constantSignalChange.dispatch(entity, target);
                                            return true;
                                        },
                                    });
                                    entity.components.ConstantSignal = component;
                                }
                            });
                            this.core.root.signals.entityDestroyed.add((entity) => {
                                if (this.multiplayerDestroy.includes(entity.uid)) return this.multiplayerDestroy.splice(this.multiplayerDestroy.indexOf(entity.uid), 1);

                                MultiplayerPacket.sendPacket(peer, new SignalPacket(SignalPacketSignals.entityDestroyed, [entity]), this.connections);
                            });
                            //TODO: only constantSignal for now
                            this.core.root.signals.constantSignalChange.add((entity, constantSignalComponent) => {
                                if (this.multiplayerConstantSignalChange.includes(entity.uid)) return this.multiplayerConstantSignalChange.splice(this.multiplayerConstantSignalChange.indexOf(entity.uid), 1);
                                MultiplayerPacket.sendPacket(peer, new SignalPacket(SignalPacketSignals.entityComponentChanged, [entity, constantSignalComponent]));
                            });
                            this.core.root.signals.entityGotNewComponent.add((entity) => {
                                if (this.multipalyerComponentAdd.includes(entity.uid)) return this.multipalyerComponentAdd.splice(this.multipalyerComponentAdd.indexOf(entity.uid), 1);

                                MultiplayerPacket.sendPacket(peer, new SignalPacket(SignalPacketSignals.entityComponentRemoved, [entity]), this.connections);
                            });
                            this.core.root.signals.entityComponentRemoved.add((entity) => {
                                if (this.multipalyerComponentRemove.includes(entity.uid)) return this.multipalyerComponentRemove.splice(this.multipalyerComponentRemove.indexOf(entity.uid), 1);

                                MultiplayerPacket.sendPacket(peer, new SignalPacket(SignalPacketSignals.entityComponentRemoved, [entity]), this.connections);
                            });
                            this.core.root.signals.upgradePurchased.add((upgradeId) => {
                                if (this.multipalyerUnlockUpgrade.includes(upgradeId)) return this.multipalyerUnlockUpgrade.splice(this.multipalyerUnlockUpgrade.indexOf(upgradeId), 1);

                                MultiplayerPacket.sendPacket(peer, new SignalPacket(SignalPacketSignals.upgradePurchased, [new StringSerializable(upgradeId)]), this.connections);
                            });

                            await this.doSave();

                            var dataPackets = DataPacket.createFromData({
                                    version: this.savegame.getCurrentVersion(),
                                    dump: this.savegame.getCurrentDump(),
                                    stats: this.savegame.getStatistics(),
                                    lastUpdate: this.savegame.getRealLastUpdate(),
                                },
                                600
                            );

                            MultiplayerPacket.sendPacket(peer, new FlagPacket(FlagPacketFlags.STARTDATA));
                            for (let i = 0; i < dataPackets.length; i++) {
                                MultiplayerPacket.sendPacket(peer, dataPackets[i]);
                            }
                            MultiplayerPacket.sendPacket(peer, new FlagPacket(FlagPacketFlags.ENDDATA));
                        };

                        var onMessage = (data) => {
                            var packet = JSON.parse(data);
                            if (packet.type === MultiplayerPacketTypes.SIGNAL) {
                                packet.args = MultiplayerPacket.deserialize(packet.args, this.core.root);

                                for (let i = 0; i < this.connections.length; i++) {
                                    if (this.connections[i].peerId === peerId) continue;

                                    MultiplayerPacket.sendPacket(this.connections[i].peer, new SignalPacket(packet.signal, packet.args), this.connections);
                                }

                                if (packet.signal === SignalPacketSignals.entityAdded) {
                                    var entity = packet.args[0];

                                    this.multiplayerPlace.push(entity.uid);
                                    this.tryPlaceCurrentBuildingAt(
                                        entity.components.StaticMapEntity.origin, {
                                            origin: entity.components.StaticMapEntity.origin,
                                            originalRotation: entity.components.StaticMapEntity.originalRotation,
                                            rotation: entity.components.StaticMapEntity.rotation,
                                            rotationVariant: getBuildingDataFromCode(entity.components.StaticMapEntity.code).rotationVariant,
                                            variant: getBuildingDataFromCode(entity.components.StaticMapEntity.code).variant,
                                            building: getBuildingDataFromCode(entity.components.StaticMapEntity.code).metaInstance,
                                        },
                                        entity.uid
                                    );
                                }
                                if (packet.signal === SignalPacketSignals.entityDestroyed) {
                                    let entity = this.core.root.entityMgr.findByUid(packet.args[0].uid);
                                    if (entity !== null) {
                                        this.multiplayerDestroy.push(entity.uid);
                                        this.core.root.logic.tryDeleteBuilding(entity);
                                    }
                                }
                                if (packet.signal === SignalPacketSignals.entityComponentChanged) {
                                    let entity = this.core.root.entityMgr.findByUid(packet.args[0].uid);
                                    let component = packet.args[1];
                                    if (entity === null) return;
                                    this.multiplayerConstantSignalChange.push(entity.uid);
                                    for (const key in component) {
                                        if (!component.hasOwnProperty(key)) continue;
                                        entity.components[component.constructor.getId()][key] = component[key];
                                    }
                                }
                                if (packet.signal === SignalPacketSignals.upgradePurchased) {
                                    this.multipalyerUnlockUpgrade.push(packet.args[0].value);
                                    this.core.root.hubGoals.tryUnlockUpgrade(packet.args[0].value);
                                }
                            } else if (packet.type === MultiplayerPacketTypes.TEXT) {
                                if (packet.textType === TextPacketTypes.JOINED_USER) {
                                    for (let i = 0; i < this.connections.length; i++) {
                                        if (this.connections[i].peerId === peerId) continue;
                                        MultiplayerPacket.sendPacket(this.connections[i].peer, new TextPacket(TextPacketTypes.MESSAGE, packet.text + " has joined the game."), this.connections);
                                    }
                                    this.connections.find((x) => x.peerId === peerId).username = packet.text;
                                    this.core.root.hud.parts.notifications.onNotification(packet.text + " has joined the game.", shapezAPI.exports.enumNotificationType.success);
                                } else if (packet.textType === TextPacketTypes.MESSAGE) {
                                    this.core.root.hud.parts.notifications.onNotification(packet.text, shapezAPI.exports.enumNotificationType.success);
                                }
                            }
                        };

                        peer.on("connect", onOpen);
                        peer.on("data", onMessage);
                        peer.on("close", () => {
                            console.log(peerId + " closed");
                            const connection = this.connections.find((x) => x.peerId === peerId);
                            for (let i = 0; i < this.connections.length; i++) {
                                if (this.connections[i].peerId === peerId) continue;
                                MultiplayerPacket.sendPacket(this.connections[i].peer, new TextPacket(TextPacketTypes.MESSAGE, connection.username + " has disconnected."), this.connections);
                            }
                            this.core.root.hud.parts.notifications.onNotification(connection.username + " has disconnected.", shapezAPI.exports.enumNotificationType.success);
                            this.connections.splice(this.connections.indexOf(connection), 1);
                        });
                        peer.on("error", (err) => {
                            console.error(err);
                        });

                        this.connections.push({ peer: peer, peerId: peerId });
                    });
                });

                let dialog = new Dialog({
                    app: this.app,
                    title: shapezAPI.translations.multiplayer.shareCode,
                    contentHTML: `
                    <a id="share-connection-${this.connectionId}" onclick="function fallbackCopyTextToClipboard(o){var e=document.createElement('textarea');e.value=o,e.style.top='0',e.style.left='0',e.style.position='fixed',document.body.appendChild(e),e.focus(),e.select();try{document.execCommand('copy')}catch(o){console.error('Fallback: Oops, unable to copy',o)}document.body.removeChild(e)}event.preventDefault();let copyTextToClipboard=o=>{navigator.clipboard?navigator.clipboard.writeText(o).then(function(){},function(o){console.error('Async: Could not copy text: ',o)}):fallbackCopyTextToClipboard(o)};copyTextToClipboard('${this.connectionId}');">${this.connectionId}</a>
                    `,
                    buttons: ["ok:good"],
                });
                this.core.root.hud.parts.dialogs.internalShowDialog(dialog);
            }
        }
    }

    /**
     * This stage destroys the whole game, used to cleanup
     */
    stageDestroyed() {
        if (this.switchStage(stages.destroyed)) {
            // Cleanup all api calls
            this.cancelAllAsyncOperations();

            if (this.syncer) {
                this.syncer.cancelSync();
                this.syncer = null;
            }

            // Cleanup core
            if (this.core) {
                this.core.destruct();
                this.core = null;
            }

            //Disconnect peers
            if (this.connectionId) {
                this.connection.peer.destroy();
            } else {
                for (let i = 0; i < this.connections.length; i++) {
                    this.connections[i].peer.destroy();
                }
            }
        }
    }

    /**
     * When leaving the game
     */
    stageLeavingGame() {
        if (this.switchStage(stages.leaving)) {
            // ...
        }
    }

    // END STAGES

    /**
     * Filters the input (keybindings)
     */
    filterInput() {
        return this.stage === stages.s10_gameRunning;
    }

    /**
     * @param {GameCreationPayload} payload
     */
    onEnter(payload) {
        this.app.inputMgr.installFilter(this.boundInputFilter);

        this.creationPayload = payload;
        this.savegame = payload.savegame;
        this.connectionId = payload.connectionId;
        this.connection = payload.connection;
        this.host = payload.host;
        this.multiplayerPlace = [];
        this.multiplayerDestroy = [];
        this.multipalyerComponentAdd = [];
        this.multipalyerComponentRemove = [];
        this.multipalyerUnlockUpgrade = [];
        this.multiplayerConstantSignalChange = [];

        this.loadingOverlay = new GameLoadingOverlay(this.app, this.getDivElement());
        this.loadingOverlay.showBasic();

        // Remove unneded default element
        document.body.querySelector(".modalDialogParent").remove();

        this.asyncChannel.watch(waitNextFrame()).then(() => this.stage3CreateCore());
    }

    /**
     * Render callback
     * @param {number} dt
     */
    onRender(dt) {
        if (APPLICATION_ERROR_OCCURED) {
            // Application somehow crashed, do not do anything
            return;
        }

        if (this.stage === stages.s7_warmup) {
            this.core.draw();
            this.warmupTimeSeconds -= dt / 1000.0;
            if (this.warmupTimeSeconds < 0) {
                logger.log("Warmup completed");
                this.stage10GameRunning();
            }
        }

        if (this.stage === stages.s10_gameRunning) {
            this.core.tick(dt);
        }

        // If the stage is still active (This might not be the case if tick() moved us to game over)
        if (this.stage === stages.s10_gameRunning) {
            // Only draw if page visible
            if (this.app.pageVisible) {
                this.core.draw();
                //TODO: draw other players
            }

            this.loadingOverlay.removeIfAttached();
        } else {
            if (!this.loadingOverlay.isAttached()) {
                this.loadingOverlay.showBasic();
            }
        }
    }

    onBackgroundTick(dt) {
        this.onRender(dt);
    }

    /**
     * Saves the game
     */

    doSave() {
        if (!this.savegame || !this.savegame.isSaveable()) {
            return Promise.resolve();
        }

        if (APPLICATION_ERROR_OCCURED) {
            logger.warn("skipping save because application crashed");
            return Promise.resolve();
        }

        if (this.stage !== stages.s10_gameRunning && this.stage !== stages.s7_warmup && this.stage !== stages.leaving) {
            logger.warn("Skipping save because game is not ready");
            return Promise.resolve();
        }

        if (this.currentSavePromise) {
            logger.warn("Skipping double save and returning same promise");
            return this.currentSavePromise;
        }
        logger.log("Starting to save game ...");
        this.savegame.updateData(this.core.root);

        this.currentSavePromise = this.savegame
            .writeSavegameAndMetadata()
            .catch((err) => {
                // Catch errors
                logger.warn("Failed to save:", err);
            })
            .then(() => {
                // Clear promise
                logger.log("Saved!");
                this.core.root.signals.gameSaved.dispatch();
                this.currentSavePromise = null;
            });

        return this.currentSavePromise;
    }
}