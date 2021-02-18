String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

import { modId } from "./modid";
import { MultiplayerCommandsHandler } from "./multiplayer/multiplayer_commands";
import { addMultiplayerButton, MultiplayerState } from "./states/multiplayer";
import { InMultiplayerGameState } from "./states/multiplayer_ingame";

registerMod({
    title: "Multiplayer",
    id: modId,
    description: "A mod that adds multiplayer to shapez.io",
    authors: ["DJ1TJOO"],
    version: "0.0.4",
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
                    desc: "The multiplayer game you wanted to join is not found or does not exist.",
                },
                notSameMods: {
                    title: "Not same mods installed",
                    desc: "You don't have the same mods installed as the owner",
                },
                user: {
                    disconnected: "<username> has disconnected",
                    joined: "<username> has joined the game",
                },

                shareCode: "Share the code with your friends",
                hostOnly: "Only the host can get the game code",
                commands: {
                    error: "There was an error while executing the '<cmd>' command",
                    doesNotExist: "The command '<cmd>' doesn't exist",
                },
            },
        },
        nl: {
            [modId]: {
                description: "Een mod die multiplayer toevoegt aan shapez.io",
            },
            settings: {
                labels: {
                    showOtherPlayers: {
                        title: "Laat andere spelers zien",
                        description: "Laat andere spelers zien in een multiplayer spel",
                    },
                },
            },
            multiplayer: {
                back: "Terug",
                join: "Meedoen",
                createMultiplayerGameHost: {
                    title: "Multiplayer Spel",
                    desc: "Voer een multiplayer spel server in.",
                },
                joinMultiplayerGame: {
                    title: "Multiplayer Spel",
                    desc: "Voer de multiplayer spelcode in die je van de host hebt gekregen",
                },
                joinMultiplayerGameHost: {
                    title: "Multiplayer Spel",
                    desc: "Voer een multiplayer spel server in die je hebt gekregen van de host.",
                },
                multiplayerGameError: {
                    title: "Spel niet gevonden",
                    desc: "Het multiplayer spel waaraan je wilde deelnemen, is niet gevonden of bestaat niet.",
                },
                user: {
                    disconnected: "<username> heeft het spel verlaten",
                    joined: "<username> heeft zich aangesloten",
                },

                shareCode: "Deel de code met je vrienden",
                hostOnly: "Alleen de host kan de spel code krijgen",
                commands: {
                    error: "Er is een fout opgetreden bij het uitvoeren van de '<cmd>' command",
                    doesNotExist: "Het command '<cmd>' bestaat niet",
                },
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