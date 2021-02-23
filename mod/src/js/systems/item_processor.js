import { enumMergedShape } from "../shapes";
const ItemProcessorSystem = shapezAPI.ingame.systems.find((x) => x.getId() === shapezAPI.exports.ItemProcessorSystem.getId());
const globalConfig = shapezAPI.exports.globalConfig;

function isTruthyItem(item) {
    if (!item) {
        return false;
    }

    if (item.getItemType() === "boolean") {
        return !!item.value;
    }

    return true;
}
export function setupItemProcessor() {
    ItemProcessorSystem.prototype.update = function() {
        for (let i = 0; i < this.allEntities.length; ++i) {
            const entity = this.allEntities[i];
            const processorComp = entity.components.ItemProcessor;
            let ejectorComp = entity.components.HyperlinkEjector;
            if (!ejectorComp) {
                ejectorComp = entity.components.ItemEjector;
            }
            for (let chargeIndex = 0;; chargeIndex++) {
                // Check if we have an open queue spot and can start a new charge
                if (this.canProcess(entity)) {
                    if (processorComp.ongoingCharges.length < shapezAPI.exports.MAX_QUEUED_CHARGES) {
                        this.startNewCharge(entity);
                    }
                }

                if (chargeIndex >= 1 || processorComp.ongoingCharges.length == 0) {
                    break;
                }

                const currentCharge = processorComp.ongoingCharges[chargeIndex];
                // Process next charge
                if (currentCharge.remainingTime > 0.0) {
                    const deltaTime = this.root.dynamicTickrate.deltaSeconds + processorComp.bonusTime;
                    currentCharge.remainingTime -= deltaTime;
                    processorComp.bonusTime = 0;
                    if (currentCharge.remainingTime > 0.0) {
                        // This charge is not finished, so don't process the next one
                        break;
                    }
                    if (currentCharge.remainingTime < 0.0) {
                        // Add bonus time, this is the time we spent too much
                        processorComp.bonusTime += -currentCharge.remainingTime;
                    }
                }
                // Check if it finished
                if (currentCharge.remainingTime <= 0.0) {
                    if (!currentCharge.items) {
                        this.processCharge(entity);
                    }
                    const itemsToEject = currentCharge.items;
                    // Go over all items and try to eject them
                    for (let j = 0; j < itemsToEject.length; ++j) {
                        const { item, requiredSlot, preferredSlot } = itemsToEject[j];

                        let slot = null;

                        if (requiredSlot !== null && requiredSlot !== undefined) {
                            // We have a slot override, check if that is free
                            if (ejectorComp.canEjectOnSlot(requiredSlot)) {
                                slot = requiredSlot;
                            }
                        } else if (preferredSlot !== null && preferredSlot !== undefined) {
                            // We have a slot preference, try using it but otherwise use a free slot

                            if (ejectorComp.canEjectOnSlot(preferredSlot) && preferredSlot !== ejectorComp.lastUsedSlot) {
                                slot = preferredSlot;
                                ejectorComp.lastUsedSlot = slot;
                            } else {
                                if (!entity.components.HyperlinkAcceptor && ejectorComp.slots[2]) {
                                    slot = ejectorComp.getNextFreeSlotForTriple(preferredSlot, ejectorComp.lastUsedSlot);
                                    if (slot !== null) {
                                        ejectorComp.lastUsedSlot = slot;
                                    }
                                } else {
                                    slot = ejectorComp.getFirstFreeSlot();
                                }
                            }
                        } else {
                            // We can eject on any slot
                            slot = ejectorComp.getFirstFreeSlot();
                        }
                        if (slot !== null) {
                            // Alright, we can actually eject
                            if (!ejectorComp.tryEject(slot, item)) {
                                assert(false, "Failed to eject");
                            } else {
                                itemsToEject.splice(j, 1);
                                j -= 1;
                            }
                        }
                    }

                    // If the charge was entirely emptied to the outputs, start the next charge
                    if (itemsToEject.length === 0) {
                        processorComp.ongoingCharges.shift();
                    }
                }
            }
        }
    };

    //Add process types
    shapezAPI.exports.enumItemProcessorTypes["hyperlink"] = "hyperlink";
    shapezAPI.exports.enumItemProcessorTypes["cutterLaser"] = "cutterLaser";
    shapezAPI.exports.enumItemProcessorTypes["smartStacker"] = "smartStacker";
    shapezAPI.exports.enumItemProcessorTypes["shapeMerger"] = "shapeMerger";

    //Add buildings speeds
    globalConfig.buildingSpeeds["cutterLaser"] = 1 / 3;
    globalConfig.buildingSpeeds["smartStacker"] = 1 / 8;
    globalConfig.buildingSpeeds["shapeMerger"] = 1 / 8;

    //Add speeds
    shapezAPI.ingame.hub_goals.getProcessorBaseSpeed["hyperlink"] = function(processorType) {
        return globalConfig.beltSpeedItemsPerSecond * this.upgradeImprovements.belt * 10;
    };
    shapezAPI.ingame.hub_goals.getProcessorBaseSpeed["cutterLaser"] = function(processorType) {
        assert(globalConfig.buildingSpeeds[processorType], "Processor type has no speed set in globalConfig.buildingSpeeds: " + processorType);
        return globalConfig.beltSpeedItemsPerSecond * this.upgradeImprovements.processors * globalConfig.buildingSpeeds[processorType];
    };
    shapezAPI.ingame.hub_goals.getProcessorBaseSpeed["smartStacker"] = function(processorType) {
        assert(globalConfig.buildingSpeeds[processorType], "Processor type has no speed set in globalConfig.buildingSpeeds: " + processorType);
        return globalConfig.beltSpeedItemsPerSecond * this.upgradeImprovements.processors * globalConfig.buildingSpeeds[processorType];
    };
    shapezAPI.ingame.hub_goals.getProcessorBaseSpeed["shapeMerger"] = function(processorType) {
        assert(globalConfig.buildingSpeeds[processorType], "Processor type has no speed set in globalConfig.buildingSpeeds: " + processorType);
        return globalConfig.beltSpeedItemsPerSecond * this.upgradeImprovements.processors * globalConfig.buildingSpeeds[processorType];
    };

    shapezAPI.exports.enumItemProcessorRequirements["shapeMerger"] = "shapeMerger";
    shapezAPI.exports.enumItemProcessorRequirements["smartStacker"] = "smartStacker";

    //Check requirements
    ItemProcessorSystem.checkRequirements["shapeMerger"] = function(entity, item, slotIndex, itemProcessorComp, pinsComp) {
        if (!(item.definition.layers.length == 1)) {
            return false;
        }
        const layer = item.definition.layers[0];
        for (let quad = 0; quad < 4; ++quad) {
            if (enumMergedShape[layer[quad].subShape]) {
                return false;
            }
        }
        return true;
    };
    ItemProcessorSystem.checkRequirements["smartStacker"] = () => true;

    //Can process
    ItemProcessorSystem.canProcess["shapeMerger"] = (entity, processorComp) => {
        const hasInputs = processorComp.inputSlots.length >= processorComp.inputsPerCharge;
        return hasInputs;
    };

    ItemProcessorSystem.canProcess["smartStacker"] = (entity, processorComp) => {
        const hasEnoughInputs = processorComp.inputSlots.length >= processorComp.inputsPerCharge;

        const itemsBySlot = {};
        for (let i = 0; i < processorComp.inputSlots.length; ++i) {
            itemsBySlot[processorComp.inputSlots[i].sourceSlot] = processorComp.inputSlots[i];
        }

        if (!itemsBySlot[0]) {
            return false;
        }
        if (!hasEnoughInputs) {
            return false;
        }
        return true;
    };

    //Add processes
    ItemProcessorSystem.prototype.process_HYPERLINK = function(payload) {
        assert(payload.entity.components.HyperlinkEjector || payload.entity.components.HyperlinkAcceptor, "To be a hyperlink, the building needs to have a hyperlink part");
        const availableSlots = payload.entity.components.HyperlinkEjector.slots.length;

        const processorComp = payload.entity.components.ItemProcessor;

        const nextSlot = processorComp.nextOutputSlot++ % availableSlots;
        if (payload.entity.components.ItemEjector) {
            for (let i = 0; i < payload.items.length; ++i) {
                payload.outItems.push({
                    item: payload.items[i].item,
                    preferredSlot: (nextSlot + i) % availableSlots,
                    doNotTrack: true,
                });
            }
        } else {
            for (let i = 0; i < payload.items.length; ++i) {
                payload.outItems.push({
                    item: payload.items[i].item,
                    preferredSlot: (nextSlot + i) % availableSlots,
                    doNotTrack: true,
                });
            }
        }

        return true;
    };

    ItemProcessorSystem.prototype.process_CUTTER_LASER = function(payload) {
        const inputItem = payload.items[0].item;
        assert(inputItem instanceof shapezAPI.exports.ShapeItem, "Input for cut is not a shape");
        const pinsComp = payload.entity.components.WiredPins;
        let wantedCorners = [0, 1, 2, 3];
        let unwantedCorners = [];
        for (let i = 0; i < 4; ++i) {
            const network = pinsComp.slots[i].linkedNetwork;
            const networkValue = network && network.hasValue() ? network.currentValue : null;
            if (networkValue && isTruthyItem(networkValue)) {
                wantedCorners.splice(i - 4 + wantedCorners.length, 1);
                unwantedCorners.push(i);
            }
        }
        const inputDefinition = inputItem.definition;
        const allDefinitons = this.root.shapeDefinitionMgr.shapeActionCutLaser(inputDefinition, wantedCorners, unwantedCorners);
        for (let i = 0; i < allDefinitons.length; ++i) {
            if (!allDefinitons[i].isEntirelyEmpty()) {
                payload.outItems.push({
                    item: this.root.shapeDefinitionMgr.getShapeItemFromDefinition(allDefinitons[i]),
                    requiredSlot: i,
                });
            }
        }
    };

    ItemProcessorSystem.prototype.process_SMART_STACKER = function(payload) {
        const mainItem = payload.itemsBySlot[0];
        const item1 = payload.itemsBySlot[1];
        const item2 = payload.itemsBySlot[2];
        const item3 = payload.itemsBySlot[3];

        assert(mainItem, "Must have a base item to stack with.");
        assert(item1 || item2 || item3, "Must have something to stack with.");

        const stackedDefinition = this.root.shapeDefinitionMgr.shapeActionSmartStack(mainItem.definition, item1 ? item1.definition : null, item2 ? item2.definition : null, item3 ? item3.definition : null);
        payload.outItems.push({
            item: this.root.shapeDefinitionMgr.getShapeItemFromDefinition(stackedDefinition),
        });
    };

    ItemProcessorSystem.prototype.process_SHAPE_MERGER = function(payload) {
        const item1 = payload.itemsBySlot[0];
        const item2 = payload.itemsBySlot[1];

        assert(item1 instanceof shapezAPI.exports.ShapeItem, "Input for item 1 is not a shape");
        assert(item2 instanceof shapezAPI.exports.ShapeItem, "Input for item 2 is not a shape");

        const combinedDefinition = this.root.shapeDefinitionMgr.shapeActionMerge(item1.definition, item2.definition);
        payload.outItems.push({
            item: this.root.shapeDefinitionMgr.getShapeItemFromDefinition(combinedDefinition),
        });
    };
}

export function addHandlers(root) {
    const itemProcessorSystem = root.systemMgr.systems[ItemProcessorSystem.getId()];
    itemProcessorSystem.handlers[shapezAPI.exports.enumItemProcessorTypes.hyperlink] = itemProcessorSystem.process_HYPERLINK.bind(itemProcessorSystem);
    itemProcessorSystem.handlers[shapezAPI.exports.enumItemProcessorTypes.cutterLaser] = itemProcessorSystem.process_CUTTER_LASER.bind(itemProcessorSystem);
    itemProcessorSystem.handlers[shapezAPI.exports.enumItemProcessorTypes.smartStacker] = itemProcessorSystem.process_SMART_STACKER.bind(itemProcessorSystem);
    itemProcessorSystem.handlers[shapezAPI.exports.enumItemProcessorTypes.shapeMerger] = itemProcessorSystem.process_SHAPE_MERGER.bind(itemProcessorSystem);
}