import { arrayHyperlinkVariantToRotation, MetaHyperlinkBuilding } from "../buildings/hyperlink";
import { HyperlinkComponent } from "../components/hyperlink";
const gMetaBuildingRegistry = shapezAPI.exports.gMetaBuildingRegistry;
const Vector = shapezAPI.exports.Vector;
const defaultBuildingVariant = shapezAPI.exports.defaultBuildingVariant;
const GameSystemWithFilter = shapezAPI.exports.GameSystemWithFilter;
const getCodeFromBuildingData = shapezAPI.exports.getCodeFromBuildingData;

/**
 * Manages all hyperlinks
 */
export class HyperlinkSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [HyperlinkComponent]);

        this.root.signals.entityDestroyed.add(this.updateSurroundingHyperlinkPlacement, this);

        // Notice: These must come *after* the entity destroyed signals
        this.root.signals.entityAdded.add(this.updateSurroundingHyperlinkPlacement, this);
    }

    static getId() {
        return "hyperlink";
    }

    updateSurroundingHyperlinkPlacement(entity) {
        // @HERE
        if (!this.root.gameInitialized) {
            return;
        }

        const staticComp = entity.components.StaticMapEntity;
        if (!staticComp) {
            return;
        }

        const metaHyperlink = gMetaBuildingRegistry.findByClass(MetaHyperlinkBuilding);
        // Compute affected area
        const originalRect = staticComp.getTileSpaceBounds();
        const affectedArea = originalRect.expandedInAllDirections(1);

        for (let x = affectedArea.x; x < affectedArea.right(); ++x) {
            for (let y = affectedArea.y; y < affectedArea.bottom(); ++y) {
                if (originalRect.containsPoint(x, y)) {
                    // Make sure we don't update the original entity
                    continue;
                }

                const targetEntities = this.root.map.getLayersContentsMultipleXY(x, y);
                for (let i = 0; i < targetEntities.length; ++i) {
                    const targetEntity = targetEntities[i];

                    const targetHyperlinkComp = targetEntity.components.Hyperlink;
                    const targetStaticComp = targetEntity.components.StaticMapEntity;

                    if (!targetHyperlinkComp) {
                        // Not a hyperlink
                        continue;
                    }

                    const { rotation, rotationVariant } = metaHyperlink.computeOptimalDirectionAndRotationVariantAtTile({
                        root: this.root,
                        tile: new Vector(x, y),
                        rotation: targetStaticComp.originalRotation,
                        variant: defaultBuildingVariant,
                        layer: targetEntity.layer,
                    });

                    // Compute delta to see if anything changed
                    const newDirection = arrayHyperlinkVariantToRotation[rotationVariant];

                    if (targetStaticComp.rotation !== rotation || newDirection !== targetHyperlinkComp.direction) {
                        // Change stuff
                        targetStaticComp.rotation = rotation;
                        metaHyperlink.updateVariants(targetEntity, rotationVariant, defaultBuildingVariant);

                        // Update code as well
                        targetStaticComp.code = getCodeFromBuildingData(metaHyperlink, defaultBuildingVariant, rotationVariant);

                        // Make sure the chunks know about the update
                        this.root.signals.entityChanged.dispatch(targetEntity);
                    }
                }
            }
        }
    }
}