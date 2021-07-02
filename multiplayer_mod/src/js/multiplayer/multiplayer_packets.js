const BaseItem = shapezAPI.exports.BaseItem;
const BeltPath = shapezAPI.exports.BeltPath;
const Camera = shapezAPI.exports.Camera;
const Component = shapezAPI.exports.Component;
const BeltComponent = shapezAPI.exports.BeltComponent;
const BeltReaderComponent = shapezAPI.exports.BeltReaderComponent;
const BeltUnderlaysComponent = shapezAPI.exports.BeltUnderlaysComponent;
const ConstantSignalComponent = shapezAPI.exports.ConstantSignalComponent;
const DisplayComponent = shapezAPI.exports.DisplayComponent;
const FilterComponent = shapezAPI.exports.FilterComponent;
const HubComponent = shapezAPI.exports.HubComponent;
const ItemAcceptorComponent = shapezAPI.exports.ItemAcceptorComponent;
const ItemEjectorComponent = shapezAPI.exports.ItemEjectorComponent;
const ItemProcessorComponent = shapezAPI.exports.ItemProcessorComponent;
const ItemProducerComponent = shapezAPI.exports.ItemProducerComponent;
const LeverComponent = shapezAPI.exports.LeverComponent;
const LogicGateComponent = shapezAPI.exports.LogicGateComponent;
const MinerComponent = shapezAPI.exports.MinerComponent;
const StaticMapEntityComponent = shapezAPI.exports.StaticMapEntityComponent;
const StorageComponent = shapezAPI.exports.StorageComponent;
const UndergroundBeltComponent = shapezAPI.exports.UndergroundBeltComponent;
const WireComponent = shapezAPI.exports.WireComponent;
const WiredPinsComponent = shapezAPI.exports.WiredPinsComponent;
const WireTunnelComponent = shapezAPI.exports.WireTunnelComponent;
const Entity = shapezAPI.exports.Entity;
const EntityManager = shapezAPI.exports.EntityManager;
const HubGoals = shapezAPI.ingame.hub_goals;
const BooleanItem = shapezAPI.exports.BooleanItem;
const ColorItem = shapezAPI.exports.ColorItem;
const ShapeItem = shapezAPI.exports.ShapeItem;
const BaseMap = shapezAPI.exports.BaseMap;
const MapView = shapezAPI.exports.MapView;
const ProductionAnalytics = shapezAPI.exports.ProductionAnalytics;
const ShapeDefinition = shapezAPI.exports.ShapeDefinition;
const ShapeDefinitionManager = shapezAPI.exports.ShapeDefinitionManager;
const BaseGameSpeed = shapezAPI.exports.BaseGameSpeed;
const FastForwardGameSpeed = shapezAPI.exports.FastForwardGameSpeed;
const PausedGameSpeed = shapezAPI.exports.PausedGameSpeed;
const RegularGameSpeed = shapezAPI.exports.RegularGameSpeed;
const BasicSerializableObject = shapezAPI.exports.BasicSerializableObject;
const types = shapezAPI.exports.types;
const Vector = shapezAPI.exports.Vector;
const getBuildingDataFromCode = shapezAPI.exports.getBuildingDataFromCode;
const globalConfig = shapezAPI.exports.globalConfig;
const createLogger = shapezAPI.exports.createLogger;

const Peer = require("simple-peer");
/**
 * SerializedObject
 * @typedef {{
 *   serialized: Object,
 *   class: String,
 *   }} SerializedObject
 */

export const MultiplayerPacketTypes = {
    DATA: 0,
    FLAG: 1,
    SIGNAL: 2,
    TEXT: 3,
};

export class StringSerializable extends BasicSerializableObject {
    /**
     * @param {string} value
     */
    constructor(value) {
        super();
        this.value = value;
    }

    static getId() {
        return "string";
    }

    static getSchema() {
        return { value: types.string };
    }

    serialize() {
        return { value: this.value };
    }

    deserialize(data) {
        this.value = data.value;
    }
}

export class NumberSerializable extends BasicSerializableObject {
    /**
     * @param {number} value
     */
    constructor(value) {
        super();
        this.value = value;
    }

    static getId() {
        return "number";
    }

    static getSchema() {
        return { value: types.float };
    }

    serialize() {
        return { value: this.value };
    }

    deserialize(data) {
        this.value = data.value;
    }
}

export const MultiplayerPacketSerializableObject = {
    [BaseGameSpeed.name]: BaseGameSpeed,
    [BaseItem.name]: BaseItem,
    [BaseMap.name]: BaseMap,
    [BeltComponent.name]: BeltComponent,
    [BeltPath.name]: BeltPath,
    [BeltReaderComponent.name]: BeltReaderComponent,
    [BeltUnderlaysComponent.name]: BeltUnderlaysComponent,
    [BooleanItem.name]: BooleanItem,
    [Camera.name]: Camera,
    [ColorItem.name]: ColorItem,
    [Component.name]: Component,
    [ConstantSignalComponent.name]: ConstantSignalComponent,
    [DisplayComponent.name]: DisplayComponent,
    [Entity.name]: Entity,
    [EntityManager.name]: EntityManager,
    [FastForwardGameSpeed.name]: FastForwardGameSpeed,
    [FilterComponent.name]: FilterComponent,
    [HubComponent.name]: HubComponent,
    [HubGoals.name]: HubGoals,
    [ItemAcceptorComponent.name]: ItemAcceptorComponent,
    [ItemEjectorComponent.name]: ItemEjectorComponent,
    [ItemProcessorComponent.name]: ItemProcessorComponent,
    [ItemProducerComponent.name]: ItemProducerComponent,
    [LeverComponent.name]: LeverComponent,
    [LogicGateComponent.name]: LogicGateComponent,
    [MapView.name]: MapView,
    [MinerComponent.name]: MinerComponent,
    [NumberSerializable.name]: NumberSerializable,
    [PausedGameSpeed.name]: PausedGameSpeed,
    [ProductionAnalytics.name]: ProductionAnalytics,
    [RegularGameSpeed.name]: RegularGameSpeed,
    [ShapeDefinition.name]: ShapeDefinition,
    [ShapeDefinitionManager.name]: ShapeDefinitionManager,
    [ShapeItem.name]: ShapeItem,
    [StaticMapEntityComponent.name]: StaticMapEntityComponent,
    [StorageComponent.name]: StorageComponent,
    [StringSerializable.name]: StringSerializable,
    [UndergroundBeltComponent.name]: UndergroundBeltComponent,
    [WireComponent.name]: WireComponent,
    [WiredPinsComponent.name]: WiredPinsComponent,
    [WireTunnelComponent.name]: WireTunnelComponent,
};

const logger = createLogger("multiplayer_serializer_internal");

// Internal serializer methods
export class MultiplayerSerializerInternal {
    serializeEntityArray(array) {
        const serialized = [];
        for (let i = 0; i < array.length; ++i) {
            const entity = array[i];
            if (!entity.queuedForDestroy && !entity.destroyed) {
                serialized.push(entity.serialize());
            }
        }
        return serialized;
    }

    deserializeEntityArray(root, array) {
        for (let i = 0; i < array.length; ++i) {
            this.deserializeEntity(root, array[i]);
        }
    }

    deserializeEntity(root, payload) {
        const staticData = payload.components.StaticMapEntity;
        assert(staticData, "entity has no static data");

        const code = staticData.code;
        const data = getBuildingDataFromCode(code);

        const metaBuilding = data.metaInstance;

        const entity = metaBuilding.createEntity({
            root,
            origin: Vector.fromSerializedObject(staticData.origin),
            rotation: staticData.rotation,
            originalRotation: staticData.originalRotation,
            rotationVariant: data.rotationVariant,
            variant: data.variant,
        });

        entity.uid = payload.uid;
        this.deserializeComponents(root, entity, payload.components);
        return entity;
    }

    /////// COMPONENTS ////

    deserializeComponents(root, entity, data) {
        for (const componentId in data) {
            if (!entity.components[componentId]) {
                if (G_IS_DEV && !globalConfig.debug.disableSlowAsserts) {
                    // @ts-ignore
                    if (++window.componentWarningsShown < 100) {
                        logger.warn("Entity no longer has component:", componentId);
                    }
                }
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
    }
}

export class MultiplayerPacket {
    constructor(type) {
        this.type = type;
    }

    /**
     * Sends the packet over a peer via the datachannel
     * @param {Peer.Instance} peer
     * @param {MultiplayerPacket} packet
     * @param {Array} packet
     */
    static sendPacket(peer, packet, connections = undefined) {
        this._packetsToSend.push(() => {
            if (!peer.connected) return;
            try {
                peer.send(JSON.stringify(packet));
            } catch (error) {
                if (connections)
                    connections.splice(connections.indexOf(connections.find(x => x.peer === peer)), 1);
                console.log(error);
            }
        });

        if (this._packetsToSend.length <= 1) {
            this.sendNextPacket();
        }
    }

    static sendNextPacket() {
        if (this._packetsToSend.length < 1) return;

        this._packetsToSend[0]();
        this._packetsToSend.shift();
    }

    /**
     * Serializes data
     * @param {Array<BasicSerializableObject>} args
     * @returns {Array<SerializedObject>}
     */
    static serialize(args) {
        const argsNew = [];
        for (let i = 0; i < args.length; i++) {
            const element = args[i];
            argsNew.push({
                serialized: element.serialize(),
                class: element.constructor.name,
            });
        }
        return argsNew;
    }

    /**
     * Deserializes data
     * @param {Array<SerializedObject>} args
     * @returns {Array<BasicSerializableObject>}
     */
    static deserialize(args, root) {
        const argsNew = [];
        for (let i = 0; i < args.length; i++) {
            const element = args[i];
            // @ts-ignore
            let object = new MultiplayerPacketSerializableObject[element.class]({});
            if (object instanceof Entity)
                object = new MultiplayerSerializerInternal().deserializeEntity(root, element.serialized);
            // @ts-ignore
            else object.deserialize(element.serialized, root);
            argsNew.push(object);
        }
        return argsNew;
    }
}

/** @type {Array<Function>} */
MultiplayerPacket._packetsToSend = [];

export class DataPacket extends MultiplayerPacket {
    constructor(size, data) {
        super(MultiplayerPacketTypes.DATA);

        /** @type {number} */
        this.size = size;

        /** @type {number} */
        this.data = data;
    }

    /**
     *
     * @param {string} str
     * @param {number} size
     */
    static chunkSubstr(str, size) {
        const numChunks = Math.ceil(str.length / size);
        const chunks = new Array(numChunks);

        for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
            chunks[i] = str.substr(o, size);
        }

        return chunks;
    }

    /**
     *
     * @param {any} data
     * @param {number} size
     */
    static createFromData(data, size) {
        const chunks = this.chunkSubstr(JSON.stringify(data), size);
        const dataPackets = [];
        for (let i = 0; i < chunks.length; i++) dataPackets[i] = new DataPacket(size, chunks[i]);
        return dataPackets;
    }
}

export const FlagPacketFlags = {
    STARTDATA: 0,
    ENDDATA: 1,
    RECEIVED_PACKET: 2,
};

export class FlagPacket extends MultiplayerPacket {
    constructor(flag) {
        super(MultiplayerPacketTypes.FLAG);

        /** @type {number} */
        this.flag = flag;
    }
}

export const SignalPacketSignals = {
    entityManuallyPlaced: 0,
    entityAdded: 1,
    entityGotNewComponent: 2,
    entityComponentChanged: 3,
    entityComponentRemoved: 4,
    entityQueuedForDestroy: 5,
    entityDestroyed: 6,

    setTile: 7,

    storyGoalCompleted: 8,
    upgradePurchased: 9,

    shapeDelivered: 10,
    itemProduced: 11,
};

export class SignalPacket extends MultiplayerPacket {
    /**
     * Constructor of SignalPacket
     * @param {number} signal
     * @param {Array<BasicSerializableObject>} args
     */
    constructor(signal, args) {
        super(MultiplayerPacketTypes.SIGNAL);

        /** @type {number} */
        this.signal = signal;

        /** @type {Array<SerializedObject>} */
        this.args = MultiplayerPacket.serialize(args);
    }
}

export const TextPacketTypes = {
    USER_JOINED: 0,
    USER_DISCONNECTED: 1,
    USER_UPDATE: 2,
    HOST_USER: 3,
    MESSAGE: 4,
};

export class TextPacket extends MultiplayerPacket {
    /**
     * Constructor of TextPacket
     * @param {number} textType
     * @param {string} text
     */
    constructor(textType, text) {
        super(MultiplayerPacketTypes.TEXT);

        /** @type {number} */
        this.textType = textType;

        /** @type {string} */
        this.text = text;
    }
}
