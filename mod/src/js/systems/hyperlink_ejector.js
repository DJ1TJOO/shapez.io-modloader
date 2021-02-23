import { HyperlinkAcceptorComponent } from "../components/hyperlink_acceptor";
import { HyperlinkEjectorComponent } from "../components/hyperlink_ejector";
const globalConfig = shapezAPI.exports.globalConfig;
const DrawParameters = shapezAPI.exports.DrawParameters;
const createLogger = shapezAPI.exports.createLogger;
const Rectangle = shapezAPI.exports.Rectangle;
const StaleAreaDetector = shapezAPI.exports.StaleAreaDetector;
const enumDirectionToVector = shapezAPI.exports.enumDirectionToVector;
const BaseItem = shapezAPI.exports.BaseItem;
const Entity = shapezAPI.exports.Entity;
const BeltComponent = shapezAPI.exports.BeltComponent;
const GameSystemWithFilter = shapezAPI.exports.GameSystemWithFilter;
const MapChunkView = shapezAPI.exports.MapChunkView;

const logger = createLogger("systems/ejector");

export class HyperlinkEjectorSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [HyperlinkEjectorComponent]);

        this.staleAreaDetector = new StaleAreaDetector({
            root: this.root,
            name: "hyperlink-ejector",
            recomputeMethod: this.recomputeArea.bind(this),
        });

        this.staleAreaDetector.recomputeOnComponentsChanged([HyperlinkEjectorComponent, HyperlinkAcceptorComponent, BeltComponent], 1);

        this.root.signals.postLoadHook.add(this.recomputeCacheFull, this);
    }

    static getId() {
        return "hyperlinkEjector";
    }

    /**
     * Recomputes an area after it changed
     * @param {Rectangle} area
     */
    recomputeArea(area) {
        /** @type {Set<number>} */
        const seenUids = new Set();
        for (let x = 0; x < area.w; ++x) {
            for (let y = 0; y < area.h; ++y) {
                const tileX = area.x + x;
                const tileY = area.y + y;
                // @NOTICE: Item ejector currently only supports regular layer
                const contents = this.root.map.getLayerContentXY(tileX, tileY, "regular");
                if (contents && contents.components.HyperlinkEjector) {
                    if (!seenUids.has(contents.uid)) {
                        seenUids.add(contents.uid);
                        this.recomputeSingleEntityCache(contents);
                    }
                }
            }
        }
    }

    /**
     * Recomputes the whole cache after the game has loaded
     */
    recomputeCacheFull() {
        logger.log("Full cache recompute in post load hook");
        for (let i = 0; i < this.allEntities.length; ++i) {
            const entity = this.allEntities[i];
            this.recomputeSingleEntityCache(entity);
        }
    }

    /**
     * @param {Entity} entity
     */
    recomputeSingleEntityCache(entity) {
        const ejectorComp = entity.components.HyperlinkEjector;
        const staticComp = entity.components.StaticMapEntity;
        for (let slotIndex = 0; slotIndex < ejectorComp.slots.length; ++slotIndex) {
            const ejectorSlot = ejectorComp.slots[slotIndex];

            // Clear the old cache.
            ejectorSlot.cachedDestSlot = null;
            ejectorSlot.cachedTargetEntity = null;
            ejectorSlot.cachedBeltPath = null;

            // Figure out where and into which direction we eject items
            const ejectSlotWsTile = staticComp.localTileToWorld(ejectorSlot.pos);
            const ejectSlotWsDirection = staticComp.localDirectionToWorld(ejectorSlot.direction);
            const ejectSlotWsDirectionVector = enumDirectionToVector[ejectSlotWsDirection];
            const ejectSlotTargetWsTile = ejectSlotWsTile.add(ejectSlotWsDirectionVector);

            // Try to find the given acceptor component to take the item
            // Since there can be cross layer dependencies, check on all layers
            const targetEntities = this.root.map.getLayersContentsMultipleXY(ejectSlotTargetWsTile.x, ejectSlotTargetWsTile.y);

            for (let i = 0; i < targetEntities.length; ++i) {
                const targetEntity = targetEntities[i];

                const targetStaticComp = targetEntity.components.StaticMapEntity;

                // Check for item acceptors
                const targetAcceptorComp = targetEntity.components.HyperlinkAcceptor;
                if (!targetAcceptorComp) {
                    // Entity doesn't accept items
                    continue;
                }

                const matchingSlot = targetAcceptorComp.findMatchingSlot(targetStaticComp.worldToLocalTile(ejectSlotTargetWsTile), targetStaticComp.worldDirectionToLocal(ejectSlotWsDirection));

                if (!matchingSlot) {
                    // No matching slot found
                    continue;
                }

                // A slot can always be connected to one other slot only
                ejectorSlot.cachedTargetEntity = targetEntity;
                ejectorSlot.cachedDestSlot = matchingSlot;
                break;
            }
        }
    }

    update() {
        this.staleAreaDetector.update();

        // Precompute effective belt speed
        let progressGrowth = 8 * this.root.dynamicTickrate.deltaSeconds;

        // Go over all cache entries
        for (let i = 0; i < this.allEntities.length; ++i) {
            const sourceEntity = this.allEntities[i];
            const sourceEjectorComp = sourceEntity.components.HyperlinkEjector;
            const slots = sourceEjectorComp.slots;
            for (let j = 0; j < slots.length; ++j) {
                const sourceSlot = slots[j];
                const item = sourceSlot.item;
                if (!item) {
                    // No item available to be ejected
                    continue;
                }

                // Advance items on the slot
                sourceSlot.progress = Math.min(1, sourceSlot.progress + progressGrowth * this.root.hubGoals.getBeltBaseSpeed() * globalConfig.itemSpacingOnBelts * 2);

                // Check if we are still in the process of ejecting, can't proceed then
                if (sourceSlot.progress < 1.0) {
                    continue;
                }

                // Check if the target acceptor can actually accept this item
                const destEntity = sourceSlot.cachedTargetEntity;
                const destSlot = sourceSlot.cachedDestSlot;
                if (destSlot) {
                    const targetAcceptorComp = destEntity.components.HyperlinkAcceptor;
                    if (!targetAcceptorComp.canAcceptItem(destSlot.index, item)) {
                        continue;
                    }

                    // Try to hand over the item
                    if (this.tryPassOverItem(item, destEntity, destSlot.index)) {
                        // Handover successful, clear slot
                        if (!this.root.app.settings.getAllSettings().simplifiedBelts) {
                            targetAcceptorComp.onItemAccepted(destSlot.index, destSlot.acceptedDirection, item);
                        }
                        sourceSlot.item = null;
                        continue;
                    }
                }
            }
        }
    }

    /**
     *
     * @param {BaseItem} item
     * @param {Entity} receiver
     * @param {number} slotIndex
     */
    tryPassOverItem(item, receiver, slotIndex) {
        // Try figuring out how what to do with the item
        // @TODO: Kinda hacky. How to solve this properly? Don't want to go through inheritance hell.

        const itemProcessorComp = receiver.components.ItemProcessor;
        if (itemProcessorComp) {
            // Check for potential filters
            if (!this.root.systemMgr.systems.itemProcessor.checkRequirements(receiver, item, slotIndex)) {
                return false;
            }

            // Its an item processor ..
            if (itemProcessorComp.tryTakeItem(item, slotIndex)) {
                return true;
            }
            // Item processor can have nothing else
            return false;
        }

        const undergroundBeltComp = receiver.components.UndergroundBelt;
        if (undergroundBeltComp) {
            // Its an underground belt. yay.
            if (undergroundBeltComp.tryAcceptExternalItem(item, this.root.hubGoals.getUndergroundBeltBaseSpeed())) {
                return true;
            }

            // Underground belt can have nothing else
            return false;
        }

        const storageComp = receiver.components.Storage;
        if (storageComp) {
            // It's a storage
            if (storageComp.canAcceptItem(item)) {
                storageComp.takeItem(item);
                return true;
            }

            // Storage can't have anything else
            return false;
        }

        const filterComp = receiver.components.Filter;
        if (filterComp) {
            // It's a filter! Unfortunately the filter has to know a lot about it's
            // surrounding state and components, so it can't be within the component itself.
            if (this.root.systemMgr.systems.filter.tryAcceptItem(receiver, slotIndex, item)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param {DrawParameters} parameters
     * @param {MapChunkView} chunk
     */
    drawChunk(parameters, chunk) {
        if (this.root.app.settings.getAllSettings().simplifiedBelts) {
            // Disabled in potato mode
            return;
        }
        //
        const contents = chunk.containedEntitiesByLayer.regular;

        for (let i = 0; i < contents.length; ++i) {
            const entity = contents[i];
            let ejectorComp = entity.components.HyperlinkEjector;

            const staticComp = entity.components.StaticMapEntity;

            for (let i = 0; i < ejectorComp.slots.length; ++i) {
                const slot = ejectorComp.slots[i];
                const ejectedItem = slot.item;

                if (!ejectedItem) {
                    // No item
                    continue;
                }

                if (!ejectorComp.renderFloatingItems && !slot.cachedTargetEntity) {
                    // Not connected to any building
                    continue;
                }

                const realPosition = staticComp.localTileToWorld(slot.pos);
                if (!chunk.tileSpaceRectangle.containsPoint(realPosition.x, realPosition.y)) {
                    // Not within this chunk
                    continue;
                }

                const realDirection = staticComp.localDirectionToWorld(slot.direction);
                const realDirectionVector = enumDirectionToVector[realDirection];

                const tileX = realPosition.x + 0.5 + realDirectionVector.x * 0.5 * slot.progress;
                const tileY = realPosition.y + 0.5 + realDirectionVector.y * 0.5 * slot.progress;

                const worldX = tileX * globalConfig.tileSize;
                const worldY = tileY * globalConfig.tileSize;

                ejectedItem.drawItemCenteredClipped(worldX, worldY, parameters, globalConfig.defaultItemDiameter);
            }
        }
    }
}