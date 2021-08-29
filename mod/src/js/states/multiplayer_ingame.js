import { MultiplayerHUD } from "../multiplayer/multiplayer_hud";
import { MultiplayerHUDNotifications } from "../multiplayer/multiplayer_notifications";
import { MultiplayerPeer } from "../multiplayer/multiplayer_peer";
import { MultiplayerSavegame } from "../multiplayer/multiplayer_savegame";

const APPLICATION_ERROR_OCCURED = shapezAPI.exports.APPLICATION_ERROR_OCCURED;
const Signal = shapezAPI.exports.Signal;
const logSection = shapezAPI.exports.logSection;
const createLogger = shapezAPI.exports.createLogger;
const waitNextFrame = shapezAPI.exports.waitNextFrame;
const globalConfig = shapezAPI.exports.globalConfig;
const GameLoadingOverlay = shapezAPI.exports.GameLoadingOverlay;
const KeyActionMapper = shapezAPI.exports.KeyActionMapper;
const Savegame = shapezAPI.exports.Savegame;
const GameCore = shapezAPI.exports.GameCore;
const MUSIC = shapezAPI.exports.MUSIC;

const logger = createLogger("state/ingame");
const Peer = require("simple-peer");

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
        /** @type {Peer.Instance} */
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
            logger.warn(
                "Tried to leave game twice or during destroy:",
                this.stage,
                "(attempted to move to",
                stateId,
                ")"
            );
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

            if (this.connection) {
                this.multiplayerSavegame = new MultiplayerSavegame(this.app, this.connection.gameData);
                this.core.initializeRoot(this, this.multiplayerSavegame);

                //Remove listeners notifications
                this.core.root.hud.signals.notification.remove(
                    this.core.root.hud.parts.notifications.onNotification
                );
                this.core.root.signals.gameSaved.removeAll();
                this.core.root.signals.gameSaved.add(this.core.root.hud.parts.gameMenu.onGameSaved, this);

                //Change to multiplayer notifications
                this.core.root.hud.parts.notifications = new MultiplayerHUDNotifications(this.core.root);
                this.core.root.hud.parts.notifications.initialize();
                const frag = document.createDocumentFragment();
                this.core.root.hud.parts.notifications.createElements(frag);
                document.body.appendChild(frag);
                if (this.multiplayerSavegame.hasGameDump()) {
                    this.stage4bResumeGame();
                } else {
                    this.onInitializationFailure("The multiplayer game could not be loaded.");
                }
            } else {
                this.core.initializeRoot(this, this.savegame);

                //Remove listeners notifications
                this.core.root.hud.signals.notification.remove(
                    this.core.root.hud.parts.notifications.onNotification
                );
                this.core.root.signals.gameSaved.removeAll();
                this.core.root.signals.gameSaved.add(
                    this.core.root.hud.parts.gameMenu.onGameSaved,
                    this.core.root.hud.parts.gameMenu
                );

                //Change to multiplayer notifications
                this.core.root.hud.parts.notifications = new MultiplayerHUDNotifications(this.core.root);
                this.core.root.hud.parts.notifications.initialize();
                const frag = document.createDocumentFragment();
                this.core.root.hud.parts.notifications.createElements(frag);
                document.body.appendChild(frag);

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
                this.onInitializationFailure("Savegame is corrupt and can not be restored.");
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
     * The final stage where this game is running and updating regulary.
     */
    stage10GameRunning() {
        if (this.switchStage(stages.s10_gameRunning)) {
            this.core.root.signals.readyToRender.dispatch();

            logSection("GAME STARTED", "#26a69a");

            // Initial resize, might have changed during loading (this is possible)
            this.core.resize(this.app.screenWidth, this.app.screenHeight);

            //Connect
            if (this.connectionId) this.peer = new MultiplayerPeer(this, this.connection.peer);
            else this.peer = new MultiplayerPeer(this);
        }
    }

    /**
     * This stage destroys the whole game, used to cleanup
     */
    stageDestroyed() {
        if (this.switchStage(stages.destroyed)) {
            try {
                // Cleanup all api calls
                this.cancelAllAsyncOperations();
            } catch (error) {}

            if (this.syncer) {
                this.syncer.cancelSync();
                this.syncer = null;
            }

            // Cleanup core
            if (this.core) {
                this.core.destruct();
                this.core = null;
            }

            if (this.peer) {
                //Disconnect peers
                if (this.connectionId) {
                    this.connection.peer.destroy();
                } else {
                    for (let i = 0; i < this.peer.connections.length; i++) {
                        this.peer.connections[i].peer.destroy();
                    }
                }
            }

            //Add buttons back
            shapezAPI.exports.HUDSettingsMenu.buttons.splice(
                shapezAPI.exports.HUDSettingsMenu.buttons.findIndex(x => x.id === "continue") + 1,
                0,
                {
                    id: "settings",
                    action: hudSettingsMenu => () => hudSettingsMenu.goToSettings(),
                    options: {
                        preventDefault: false,
                    },
                }
            );

            if (this.modlist)
                shapezAPI.exports.HUDSettingsMenu.buttons.splice(
                    shapezAPI.exports.HUDSettingsMenu.buttons.findIndex(x => x.id === "settings") + 1,
                    0,
                    {
                        id: "mods",
                        action: hudSettingsMenu => () =>
                            hudSettingsMenu.root.gameState.saveThenGoToState("ModsState", {
                                backToStateId: hudSettingsMenu.root.gameState.key,
                                backToStatePayload: hudSettingsMenu.root.gameState.creationPayload,
                            }),
                        options: {
                            preventDefault: false,
                        },
                    }
                );
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

        this.multiplayerHUD = new MultiplayerHUD(this);

        this.loadingOverlay = new GameLoadingOverlay(this.app, this.getDivElement());
        this.loadingOverlay.showBasic();

        // Remove unneded default element
        document.body.querySelector(".modalDialogParent").remove();

        this.asyncChannel.watch(waitNextFrame()).then(() => this.stage3CreateCore());

        const buttonIds = ["settings"];
        this.modlist = false;
        if (shapezAPI.exports.HUDSettingsMenu.buttons.find(x => x.id === "mods")) {
            buttonIds.push("mods");
            this.modlist = true;
        }
        shapezAPI.exports.HUDSettingsMenu.buttons = shapezAPI.exports.HUDSettingsMenu.buttons.filter(
            x => !buttonIds.includes(x.id)
        );
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

        if (
            this.stage !== stages.s10_gameRunning &&
            this.stage !== stages.s7_warmup &&
            this.stage !== stages.leaving
        ) {
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
            .catch(err => {
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
