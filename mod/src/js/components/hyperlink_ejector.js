const Entity = shapezAPI.exports.Entity;
const Vector = shapezAPI.exports.Vector;
const enumDirection = shapezAPI.exports.enumDirection;
const BaseItem = shapezAPI.exports.BaseItem;
const types = shapezAPI.exports.types;
const BeltPath = shapezAPI.exports.BeltPath;
const typeItemSingleton = shapezAPI.exports.typeItemSingleton;
const enumDirectionToVector = shapezAPI.exports.enumDirectionToVector;
/**
 * @typedef {{
 *    pos: Vector,
 *    direction: enumDirection,
 *    item: BaseItem,
 *    progress: number?,
 *    cachedDestSlot?: import("./hyperlink_acceptor").ItemAcceptorLocatedSlot,
 *    cachedBeltPath?: BeltPath,
 *    cachedTargetEntity?: Entity
 * }} HyperlinkEjectorSlot
 */

export class HyperlinkEjectorComponent extends shapezAPI.exports.Component {
    static getId() {
        return "HyperlinkEjector";
    }

    static getSchema() {
        // The cachedDestSlot, cachedTargetEntity fields are not serialized.
        return {
            slots: types.fixedSizeArray(
                types.structured({
                    item: types.nullable(typeItemSingleton),
                    progress: types.float,
                })
            ),
        };
    }

    /**
     *
     * @param {object} param0
     * @param {Array<{pos: Vector, direction: enumDirection }>=} param0.slots The slots to eject on
     * @param {boolean=} param0.renderFloatingItems Whether to render items even if they are not connected
     */
    constructor({ slots = [], renderFloatingItems = true }) {
        super();

        this.setSlots(slots);
        this.renderFloatingItems = renderFloatingItems;
        this.lastUsedSlot = null;
        this.hasSpaceToMove = false;
    }

    /**
     * @param {Array<{pos: Vector, direction: enumDirection }>} slots The slots to eject on
     */
    setSlots(slots) {
        /** @type {Array<HyperlinkEjectorSlot>} */
        this.slots = [];
        for (let i = 0; i < slots.length; ++i) {
            const slot = slots[i];
            this.slots.push({
                pos: slot.pos,
                direction: slot.direction,
                item: null,
                progress: 0,
                cachedDestSlot: null,
                cachedTargetEntity: null,
            });
        }
    }

    /**
     * Returns where this slot ejects to
     * @param {HyperlinkEjectorSlot} slot
     * @returns {Vector}
     */
    getSlotTargetLocalTile(slot) {
        const directionVector = enumDirectionToVector[slot.direction];
        return slot.pos.add(directionVector);
    }

    /**
     * Returns whether any slot ejects to the given local tile
     * @param {Vector} tile
     */
    anySlotEjectsToLocalTile(tile) {
        for (let i = 0; i < this.slots.length; ++i) {
            if (this.getSlotTargetLocalTile(this.slots[i]).equals(tile)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Returns if we can eject on a given slot
     * @param {number} slotIndex
     * @returns {boolean}
     */
    canEjectOnSlot(slotIndex) {
        assert(slotIndex >= 0 && slotIndex < this.slots.length, "Invalid ejector slot: " + slotIndex);
        return !this.slots[slotIndex].item;
    }

    /**
     * Returns the first free slot on this ejector or null if there is none
     * @returns {number?}
     */
    getFirstFreeSlot() {
            for (let i = 0; i < this.slots.length; ++i) {
                if (this.canEjectOnSlot(i)) {
                    return i;
                }
            }
            return null;
        }
        /**
         * Returns the first free slot on this ejector or null if there is none
         * @returns {number?}
         */
    getNextFreeSlotForTriple(slot, lastUsedSlot) {
            if (!this.canEjectOnSlot(0) && !this.canEjectOnSlot(1) && !this.canEjectOnSlot(2)) {
                return null;
            }
            if (this.canEjectOnSlot(0) && this.canEjectOnSlot(1) && this.canEjectOnSlot(2)) {
                return this.getFirstFreeSlot();
            }
            if (this.canEjectOnSlot(0) && !this.canEjectOnSlot(1) && !this.canEjectOnSlot(2)) {
                return 0;
            }
            if (!this.canEjectOnSlot(0) && this.canEjectOnSlot(1) && !this.canEjectOnSlot(2)) {
                return 1;
            }
            if (!this.canEjectOnSlot(0) && !this.canEjectOnSlot(1) && this.canEjectOnSlot(2)) {
                return 2;
            }
            switch (slot) {
                case 0:
                    if (this.canEjectOnSlot(0) && lastUsedSlot != 0) {
                        return 0;
                    } else if (this.canEjectOnSlot(1) && lastUsedSlot != 1) {
                        return 1;
                    } else if (this.canEjectOnSlot(2) && lastUsedSlot != 2) {
                        return 2;
                    } else {
                        return null;
                    }
                    break;
                case 1:
                    if (this.canEjectOnSlot(2) && lastUsedSlot != 2) {
                        return 2;
                    } else if (this.canEjectOnSlot(0) && lastUsedSlot != 0) {
                        return 0;
                    } else if (this.canEjectOnSlot(1) && lastUsedSlot != 1) {
                        return 1;
                    } else {
                        return null;
                    }
                case 2:
                    if (this.canEjectOnSlot(0) && lastUsedSlot != 0) {
                        return 0;
                    } else if (this.canEjectOnSlot(1) && lastUsedSlot != 1) {
                        return 1;
                    } else if (this.canEjectOnSlot(2) && lastUsedSlot != 2) {
                        return 2;
                    } else {
                        return null;
                    }
                default:
                    break;
            }
            return null;
        }
        /**
         * Tries to eject a given item
         * @param {number} slotIndex
         * @param {BaseItem} item
         * @returns {boolean}
         */
    tryEject(slotIndex, item) {
        if (!this.canEjectOnSlot(slotIndex)) {
            return false;
        }
        this.slots[slotIndex].item = item;
        this.slots[slotIndex].progress = 0;
        return true;
    }

    /**
     * Clears the given slot and returns the item it had
     * @param {number} slotIndex
     * @returns {BaseItem|null}
     */
    takeSlotItem(slotIndex) {
        const slot = this.slots[slotIndex];
        const item = slot.item;
        slot.item = null;
        slot.progress = 0.0;
        return item;
    }
}