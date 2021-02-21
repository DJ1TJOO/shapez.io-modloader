import { MinerDeepComponent } from "../components/miner_deep";

const enumDirectionToVector = shapezAPI.exports.enumDirectionToVector;
const globalConfig = shapezAPI.exports.globalConfig;

export class MinerDeepSystem extends shapezAPI.exports.GameSystemWithFilter {
    constructor(root) {
        super(root, [MinerDeepComponent]);
    }

    static getId() {
        return "minerDeep";
    }

    update() {
        const minerBaseSpeed = this.root.hubGoals.getMinerBaseSpeed();
        let miningSpeedMultiplier = 1;

        for (let i = 0; i < this.allEntities.length; ++i) {
            const entity = this.allEntities[i];
            const minerComp = entity.components.MinerDeep;
            let miningSpeed = minerBaseSpeed * miningSpeedMultiplier;
            miningSpeed *= 2.5;

            // Check if miner is above an actual tile
            if (!minerComp.cachedMinedItem) {
                const staticComp = entity.components.StaticMapEntity;
                const tileBelow = this.root.map.getLowerLayerContentXY(staticComp.origin.x, staticComp.origin.y);
                if (!tileBelow) {
                    continue;
                }
                minerComp.cachedMinedItem = tileBelow;
            }

            const mineDuration = 1 / miningSpeed;
            const timeSinceMine = this.root.time.now() - minerComp.lastMiningTime;
            if (timeSinceMine > mineDuration) {
                // Store how much we overflowed
                const buffer = Math.min(timeSinceMine - mineDuration, this.root.dynamicTickrate.deltaSeconds);

                if (this.tryPerformMinerEject(entity, minerComp.cachedMinedItem)) {
                    // Analytics hook
                    this.root.signals.itemProduced.dispatch(minerComp.cachedMinedItem);
                    // Store mining time
                    minerComp.lastMiningTime = this.root.time.now() - buffer;
                }
            }
        }

        // After this frame we are done
        this.needsRecompute = false;
    }

    tryPerformMinerEject(entity, item) {
        const ejectComp = entity.components.ItemEjector;

        // Seems we are a regular miner or at the end of a row, try actually ejecting
        if (ejectComp.tryEject(0, item)) {
            return true;
        }

        return false;
    }

    drawChunk_ForegroundDynamicLayer(parameters, chunk) {
        const contents = chunk.containedEntitiesByLayer.regular;

        for (let i = 0; i < contents.length; ++i) {
            const entity = contents[i];
            const minerComp = entity.components.MinerDeep;
            if (!minerComp) {
                continue;
            }

            const staticComp = entity.components.StaticMapEntity;
            if (!minerComp.cachedMinedItem) {
                continue;
            }

            // Draw the item background - this is to hide the ejected item animation from
            // the item ejector

            const padding = 3;
            const destX = staticComp.origin.x * globalConfig.tileSize + padding;
            const destY = staticComp.origin.y * globalConfig.tileSize + padding;
            const dimensions = globalConfig.tileSize - 2 * padding;

            if (parameters.visibleRect.containsRect4Params(destX, destY, dimensions, dimensions)) {
                parameters.context.fillStyle = minerComp.cachedMinedItem.getBackgroundColorAsResource();
                parameters.context.fillRect(destX, destY, dimensions, dimensions);
            }

            minerComp.cachedMinedItem.drawItemCenteredClipped((0.5 + staticComp.origin.x) * globalConfig.tileSize, (0.5 + staticComp.origin.y) * globalConfig.tileSize, parameters, globalConfig.defaultItemDiameter);
        }
    }
}