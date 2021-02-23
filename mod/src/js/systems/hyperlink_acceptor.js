import { HyperlinkAcceptorComponent } from "../components/hyperlink_acceptor";

const globalConfig = shapezAPI.exports.globalConfig;
const DrawParameters = shapezAPI.exports.DrawParameters;
const fastArrayDelete = shapezAPI.exports.fastArrayDelete;
const enumDirectionToVector = shapezAPI.exports.enumDirectionToVector;
const GameSystemWithFilter = shapezAPI.exports.GameSystemWithFilter;
const MapChunkView = shapezAPI.exports.MapChunkView;

export class HyperlinkAcceptorSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [HyperlinkAcceptorComponent]);

        // Well ... it's better to be verbose I guess?
        this.accumulatedTicksWhileInMapOverview = 0;
    }

    static getId() {
        return "hyperlinkAcceptor";
    }

    update() {
        if (this.root.app.settings.getAllSettings().simplifiedBelts) {
            // Disabled in potato mode
            return;
        }

        // This system doesn't render anything while in map overview,
        // so simply accumulate ticks
        if (this.root.camera.getIsMapOverlayActive()) {
            ++this.accumulatedTicksWhileInMapOverview;
            return;
        }

        // Compute how much ticks we missed
        const numTicks = 1 + this.accumulatedTicksWhileInMapOverview;
        const progress =
            this.root.dynamicTickrate.deltaSeconds *
            2 *
            this.root.hubGoals.getBeltBaseSpeed() *
            globalConfig.itemSpacingOnBelts * // * 2 because its only a half tile
            numTicks;

        // Reset accumulated ticks
        this.accumulatedTicksWhileInMapOverview = 0;

        for (let i = 0; i < this.allEntities.length; ++i) {
            const entity = this.allEntities[i];
            const aceptorComp = entity.components.HyperlinkAcceptor;
            const animations = aceptorComp.itemConsumptionAnimations;

            // Process item consumption animations to avoid items popping from the belts
            for (let animIndex = 0; animIndex < animations.length; ++animIndex) {
                const anim = animations[animIndex];
                anim.animProgress += progress;
                if (anim.animProgress > 1) {
                    fastArrayDelete(animations, animIndex);
                    animIndex -= 1;
                }
            }
        }
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

        const contents = chunk.containedEntitiesByLayer.regular;
        for (let i = 0; i < contents.length; ++i) {
            const entity = contents[i];
            const acceptorComp = entity.components.HyperlinkAcceptor;
            if (!acceptorComp) {
                continue;
            }

            const staticComp = entity.components.StaticMapEntity;
            for (let animIndex = 0; animIndex < acceptorComp.itemConsumptionAnimations.length; ++animIndex) {
                const { item, slotIndex, animProgress, direction } = acceptorComp.itemConsumptionAnimations[animIndex];

                const slotData = acceptorComp.slots[slotIndex];
                const realSlotPos = staticComp.localTileToWorld(slotData.pos);

                if (!chunk.tileSpaceRectangle.containsPoint(realSlotPos.x, realSlotPos.y)) {
                    // Not within this chunk
                    continue;
                }

                const fadeOutDirection = enumDirectionToVector[staticComp.localDirectionToWorld(direction)];
                const finalTile = realSlotPos.subScalars(fadeOutDirection.x * (animProgress / 2 - 0.5), fadeOutDirection.y * (animProgress / 2 - 0.5));

                item.drawItemCenteredClipped((finalTile.x + 0.5) * globalConfig.tileSize, (finalTile.y + 0.5) * globalConfig.tileSize, parameters, globalConfig.defaultItemDiameter);
            }
        }
    }
}