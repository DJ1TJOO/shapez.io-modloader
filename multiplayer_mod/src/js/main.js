import { modId } from "./modid";
import { MultiplayerCommandsHandler } from "./multiplayer/multiplayer_commands";
import { addMultiplayerButton, MultiplayerState } from "./states/multiplayer";
import { InMultiplayerGameState } from "./states/multiplayer_ingame";

registerMod({
    title: "Multiplayer",
    id: modId,
    description: "A mod that adds multiplayer to shapez.io",
    authors: ["DJ1TJOO"],
    version: "0.0.3",
    gameVersion: "ML01",
    dependencies: [],
    incompatible: [],
    settings: {
        showOtherPlayers: {
            type: "bool",
            value: true,
            title: "Show other players",
            description: "Show other players in multiplayer game",
            enabled: () => true,
        },
    },
    translations: {
        //TODO: add missing translations
        en: {
            [modId]: {
                description: "A mod that adds multiplayer to shapez.io",
            },
            settings: {
                labels: {
                    showOtherPlayers: {
                        title: "Show other players",
                        description: "Show other players in multiplayer game",
                    },
                },
            },
            multiplayer: {
                back: "Back",
                join: "Join",
                createMultiplayerGameHost: {
                    title: "Multiplayer Game",
                    desc: "Enter a multiplayer game server.",
                },
                joinMultiplayerGame: {
                    title: "Multiplayer Game",
                    desc: "Enter the multiplayer game code you got from the host.",
                },
                joinMultiplayerGameHost: {
                    title: "Multiplayer Game",
                    desc: "Enter the multiplayer game server you got from the host.",
                },
                multiplayerGameError: {
                    title: "Game not found",
                    desc: "The multiplayer game you wanted to join is not found or does not exsist.",
                },
                shareCode: "Share the code with your friends",
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
        shapezAPI.states.MultiplayerState = MultiplayerState;
        shapezAPI.states.InMultiplayerGameState = InMultiplayerGameState;

        shapezAPI.exports.SerializerInternal.prototype.deserializeComponents = (root, entity, data) => {
            for (const componentId in data) {
                if (!entity.components[componentId]) {
                    continue;
                }

                const errorStatus = entity.components[componentId].deserialize(data[componentId], root);
                if (errorStatus) {
                    return errorStatus;
                }
                if (componentId === "ConstantSignal") {
                    let component = new Proxy(entity.components[componentId], {
                        set: (target, key, value) => {
                            target[key] = value;
                            root.signals.constantSignalChange.dispatch(entity, target);
                            return true;
                        },
                    });
                    entity.components[componentId] = component;
                }
            }
        };

        shapezAPI.exports.GameHUD.prototype.draw = function(parameters) {
            const partsOrder = ["massSelector", "buildingPlacer", "blueprintPlacer", "colorBlindHelper", "changesDebugger", "minerHighlight"];

            for (let i = 0; i < partsOrder.length; ++i) {
                if (this.parts[partsOrder[i]]) {
                    this.parts[partsOrder[i]].draw(parameters);
                }
            }

            if (this.root.gameState.multiplayerHUD) this.root.gameState.multiplayerHUD.draw(parameters);
        };

        shapezAPI.exports.GameHUD.prototype.update = function() {
            if (!this.root.gameInitialized) {
                return;
            }
            for (const key in this.parts) {
                if (Array.isArray(this.parts[key])) {
                    for (let i = 0; i < this.parts[key].length; i++) {
                        this.parts[key][i].update();
                    }
                } else {
                    this.parts[key].update();
                }
            }

            if (this.root.gameState.multiplayerHUD) this.root.gameState.multiplayerHUD.update();
        };
        addMultiplayerButton(modId);
        shapezAPI.exports.MultiplayerCommandsHandler = MultiplayerCommandsHandler;
        shapezAPI.exports.HUDSettingsMenu.prototype.shouldPauseGame = function() {
            if (this.root.gameState.peer) return false;
            else return this.visible;
        };
        shapezAPI.exports.HUDSettingsMenu.prototype.shouldPauseRendering = function() {
            if (this.root.gameState.peer) return false;
            else return this.visible;
        };
        shapezAPI.exports.HUDModalDialogs.prototype.shouldPauseRendering = function() {
            if (this.root.gameState.peer) return false;
            else return this.dialogStack.length > 0;
        };
    },
});