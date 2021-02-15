import { addMultiplayerButton, MultiplayerState } from "./states/multiplayer";
import { InMultiplayerGameState } from "./states/multiplayer_ingame";

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

        addMultiplayerButton(modId);
    },
});