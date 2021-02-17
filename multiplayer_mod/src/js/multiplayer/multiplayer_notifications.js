import { MultiplayerCommandsHandler } from "./multiplayer_commands";
import { MultiplayerPacket, TextPacket, TextPacketTypes } from "./multiplayer_packets";

const T = shapezAPI.translations;
const makeDiv = shapezAPI.exports.makeDiv;
const InputReceiver = shapezAPI.exports.InputReceiver;
const KeyActionMapper = shapezAPI.exports.KeyActionMapper;

/** @enum {string} */
export const enumNotificationType = {
    saved: "saved",
    upgrade: "upgrade",
    success: "success",
    message: "message",
    error: "error",
};

export function makeDivElement(id = null, classes = [], innerHTML = "") {
    const div = document.createElement("div");
    if (id) {
        div.id = id;
    }
    for (let i = 0; i < classes.length; ++i) {
        div.classList.add(classes[i]);
    }
    div.innerHTML = innerHTML;
    return div;
}

export function makeDivFirst(parent, id = null, classes = [], innerHTML = "") {
    const div = makeDivElement(id, classes, innerHTML);
    if (parent.childNodes[0]) parent.childNodes[0].parentNode.insertBefore(div, parent.childNodes[0].parentNode.firstChild);
    else parent.appendChild(div);
    return div;
}

export function makeDivBefore(sibling, id = null, classes = [], innerHTML = "") {
    const div = makeDivElement(id, classes, innerHTML);
    sibling.parentNode.insertBefore(div, sibling);
    return div;
}

export function makeDivAfter(sibling, id = null, classes = [], innerHTML = "") {
    const div = makeDivElement(id, classes, innerHTML);
    if (sibling.nextElementSibling) sibling.parentNode.insertBefore(div, sibling.nextElementSibling);
    else sibling.parentNode.appendChild(div);
    return div;
}

const notificationDuration = 3;

export class MultiplayerHUDNotifications extends shapezAPI.exports.BaseHUDPart {
    constructor(root) {
        super(root);
    }

    createElements(parent) {
        if (!document.getElementById("ingame_HUD_Notifications")) this.element = makeDiv(parent, "ingame_HUD_Notifications", [], ``);
        else this.element = document.getElementById("ingame_HUD_Notifications");

        this.inputElement = makeDiv(
            this.element,
            "notificationInput", [],
            `
            <input type="text" class="notificationInput" placeholder="Message">
            `
        );

        this.inputElement.addEventListener("mouseenter", (e) => {
            this.root.app.inputMgr.makeSureAttachedAndOnTop(this.inputReciever);
        });

        this.inputElement.addEventListener("mouseleave", (e) => {
            this.root.app.inputMgr.makeSureDetached(this.inputReciever);
        });
    }

    initialize() {
        this.root.hud.signals.notification.add(this.onNotification, this);

        /** @type {Array<{ element: HTMLElement, expireAt: number}>} */
        this.notificationElements = [];

        this.visibleNotificationElements = [];

        // Automatic notifications
        this.root.signals.gameSaved.add(() => this.onNotification(T.ingame.notifications.gameSaved, enumNotificationType.saved));

        //To disable other inputs when typing
        this.inputReciever = new InputReceiver("notifications");
        this.keyActionMapper = new KeyActionMapper(this.root, this.inputReciever);

        // @ts-ignore
        this.keyActionMapper.getBinding(shapezAPI.KEYMAPPINGS.general.confirm).add(this.sendMessage, this);

        this.commandHandler = new MultiplayerCommandsHandler(this.root);
    }

    sendMessage() {
        if (!this.root.gameState.peer) return;
        let value = this.inputElement.getElementsByClassName("notificationInput")[0].value;
        if (this.commandHandler.isCommandString(value)) {
            let command = this.commandHandler.getCommandFromCommandString(value);
            if (command && this.commandHandler.isCommand(command.cmd)) {
                if (!this.commandHandler.executeCommand(command.cmd, command.args)) this.onNotification(`There was an error while executing the '${command.cmd}' command`, enumNotificationType.error);
            } else this.onNotification(`Command '${command.cmd}' doesn't exist`, enumNotificationType.error);
        } else {
            let message = this.root.gameState.peer.user.username + ": " + value;
            if (this.root.gameState.peer.host) {
                for (let i = 0; i < this.root.gameState.peer.connections.length; i++) {
                    MultiplayerPacket.sendPacket(this.root.gameState.peer.connections[i].peer, new TextPacket(TextPacketTypes.MESSAGE, message));
                }
            } else if (this.root.gameState.peer.peer) {
                MultiplayerPacket.sendPacket(this.root.gameState.peer.peer, new TextPacket(TextPacketTypes.MESSAGE, message));
            }
            this.onNotification(message, enumNotificationType.message);
        }
        this.inputElement.getElementsByClassName("notificationInput")[0].value = "";
    }

    /**
     * @param {string} message
     * @param {enumNotificationType} type
     */
    onNotification(message, type) {
        const element = makeDivAfter(this.inputElement, null, ["notification", "type-" + type], message);
        element.setAttribute("data-icon", "icons/notification_" + type + ".png");

        const notification = {
            element,
            expireAt: this.root.time.realtimeNow() + notificationDuration,
        };
        this.visibleNotificationElements.push(this.notificationElements.push(notification) - 1);
    }

    update() {
        const now = this.root.time.realtimeNow();
        for (let i = 0; i < this.visibleNotificationElements.length; ++i) {
            const handle = this.notificationElements[this.visibleNotificationElements[i]];
            if (handle.expireAt <= now) {
                this.visibleNotificationElements.splice(i, 1);
            }
        }
    }
}