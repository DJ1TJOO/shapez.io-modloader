import { TrasherComponent } from "../components/trasher";

const MAX_QUEUED_CHARGES = 2;
export class TrasherSystem extends window["shapezAPI"].exports.GameSystemWithFilter {
    constructor(root) {
        super(root, [TrasherComponent]);
        /* typehints:start */
        this.allEntities = [];
        this.root = root;
        /* typehints:end */
    }

    static getId() {
        return "trasher";
    }

    update() {
        for (let i = 0; i < this.allEntities.length; ++i) {
            const entity = this.allEntities[i];

            const trasherComp = entity.components.Trasher;
            const ejectorComp = entity.components.ItemEjector;

            const currentCharge = trasherComp.ongoingCharges[0];

            if (currentCharge) {
                // Process next charge
                if (currentCharge.remainingTime > 0.0) {
                    currentCharge.remainingTime -= this.root.dynamicTickrate.deltaSeconds;
                    if (currentCharge.remainingTime < 0.0) {
                        // Add bonus time, this is the time we spent too much
                        trasherComp.bonusTime += -currentCharge.remainingTime;
                    }
                }

                // Check if it finished
                if (currentCharge.remainingTime <= 0.0) {
                    const itemsToEject = currentCharge.items;

                    // Go over all items and try to eject them
                    for (let j = 0; j < itemsToEject.length; ++j) {
                        const { item, requiredSlot, preferredSlot } = itemsToEject[j];

                        window["assert"](
                            ejectorComp,
                            "To eject items, the building needs to have an ejector"
                        );

                        let slot = null;
                        if (requiredSlot !== null && requiredSlot !== undefined) {
                            // We have a slot override, check if that is free
                            if (ejectorComp.canEjectOnSlot(requiredSlot)) {
                                slot = requiredSlot;
                            }
                        } else if (preferredSlot !== null && preferredSlot !== undefined) {
                            // We have a slot preference, try using it but otherwise use a free slot
                            if (ejectorComp.canEjectOnSlot(preferredSlot)) {
                                slot = preferredSlot;
                            } else {
                                slot = ejectorComp.getFirstFreeSlot();
                            }
                        } else {
                            // We can eject on any slot
                            slot = ejectorComp.getFirstFreeSlot();
                        }

                        if (slot !== null) {
                            // Alright, we can actually eject
                            if (!ejectorComp.tryEject(slot, item)) {
                                window["assert"](false, "Failed to eject");
                            } else {
                                itemsToEject.splice(j, 1);
                                j -= 1;
                            }
                        }
                    }

                    // If the charge was entirely emptied to the outputs, start the next charge
                    if (itemsToEject.length === 0) {
                        trasherComp.ongoingCharges.shift();
                    }
                }
            }

            // Check if we have an empty queue and can start a new charge
            if (trasherComp.ongoingCharges.length < MAX_QUEUED_CHARGES) {
                if (this.canProcess(entity)) {
                    this.startNewCharge(entity);
                }
            }
        }
    }

    checkRequirements(entity, item, slotIndex) {
        return true;
    }

    canProcess(entity) {
        const trasherComp = entity.components.Trasher;
        return trasherComp.inputSlots.length >= trasherComp.inputsPerCharge;
    }

    startNewCharge(entity) {
        const trasherComp = entity.components.Trasher;

        // First, take items
        const items = trasherComp.inputSlots;
        trasherComp.inputSlots = [];

        const itemsBySlot = {};
        for (let i = 0; i < items.length; ++i) {
            itemsBySlot[items[i].sourceSlot] = items[i].item;
        }

        const outItems = [];

        // Track produced items
        for (let i = 0; i < outItems.length; ++i) {
            if (!outItems[i].doNotTrack) {
                this.root.signals.itemProduced.dispatch(outItems[i].item);
            }
        }

        // Queue Charge
        const originalTime = 1 / 1e30;

        const bonusTimeToApply = Math.min(originalTime, trasherComp.bonusTime);
        const timeToProcess = originalTime - bonusTimeToApply;

        trasherComp.bonusTime -= bonusTimeToApply;
        trasherComp.ongoingCharges.push({
            items: outItems,
            remainingTime: timeToProcess,
        });
    }
}