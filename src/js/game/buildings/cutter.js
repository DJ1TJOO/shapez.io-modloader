import { formatItemsPerSecond } from "../../core/utils";
import { enumDirection, Vector } from "../../core/vector";
import { T } from "../../translations";
import { ItemAcceptorComponent } from "../components/item_acceptor";
import { ItemEjectorComponent } from "../components/item_ejector";
import { enumItemProcessorTypes, ItemProcessorComponent } from "../components/item_processor";
import { Entity } from "../entity";
import { defaultBuildingVariant, MetaBuilding } from "../meta_building";
import { GameRoot } from "../root";
import { enumHubGoalRewards } from "../tutorial_goals";

export class MetaCutterBuilding extends MetaBuilding {
    constructor() {
        super("cutter");
    }

    getSilhouetteColor() {
        return MetaCutterBuilding.silhouetteColor;
    }

    getDimensions(variant) {
        return MetaCutterBuilding.dimensions[variant];
    }

    /**
     * @param {GameRoot} root
     * @param {string} variant
     * @returns {Array<[string, string]>}
     */
    getAdditionalStatistics(root, variant) {
        const speed = root.hubGoals.getProcessorBaseSpeed(
            variant === MetaCutterBuilding.variants.quad ?
            enumItemProcessorTypes.cutterQuad :
            enumItemProcessorTypes.cutter
        );
        return [
            [T.ingame.buildingPlacement.infoTexts.speed, formatItemsPerSecond(speed)]
        ];

        /*const speedMultiplier = MetaCutterBuilding.additionalStatistics[variant];

        const speed =
            (root.hubGoals.getProcessorBaseSpeed(enumItemProcessorTypes.balancer) / 2) * speedMultiplier;
        return [
            [T.ingame.buildingPlacement.infoTexts.speed, formatItemsPerSecond(speed)]
        ];*/ // BRB in 30 min
    }

    /**
     * @param {GameRoot} root
     */
    getAvailableVariants(root) {
        if (root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_cutter_quad)) {
            return [defaultBuildingVariant, MetaCutterBuilding.variants.quad];
        }
        return super.getAvailableVariants(root);
    }

    /**
     * @param {GameRoot} root
     */
    getIsUnlocked(root) {
        return root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_cutter_and_trash);
    }

    /**
     * Creates the entity at the given location
     * @param {Entity} entity
     */
    setupEntityComponents(entity) {
        entity.addComponent(
            new ItemProcessorComponent({
                inputsPerCharge: 1,
                processorType: enumItemProcessorTypes.cutter,
            })
        );
        entity.addComponent(new ItemEjectorComponent({}));
        entity.addComponent(
            new ItemAcceptorComponent({
                slots: [{
                    pos: new Vector(0, 0),
                    directions: [enumDirection.bottom],
                    filter: "shape",
                }, ],
            })
        );
    }

    /**
     *
     * @param {Entity} entity
     * @param {number} rotationVariant
     * @param {string} variant
     */
    updateVariants(entity, rotationVariant, variant) {
        switch (variant) {
            case defaultBuildingVariant:
                {
                    entity.components.ItemEjector.setSlots([
                        { pos: new Vector(0, 0), direction: enumDirection.top },
                        { pos: new Vector(1, 0), direction: enumDirection.top },
                    ]);
                    entity.components.ItemProcessor.type = enumItemProcessorTypes.cutter;
                    break;
                }
            case MetaCutterBuilding.variants.quad:
                {
                    entity.components.ItemEjector.setSlots([
                        { pos: new Vector(0, 0), direction: enumDirection.top },
                        { pos: new Vector(1, 0), direction: enumDirection.top },
                        { pos: new Vector(2, 0), direction: enumDirection.top },
                        { pos: new Vector(3, 0), direction: enumDirection.top },
                    ]);
                    entity.components.ItemProcessor.type = enumItemProcessorTypes.cutterQuad;
                    break;
                }

            default:
                assertAlways(false, "Unknown painter variant: " + variant);
        }
    }
}
MetaCutterBuilding.variants = {
    quad: "quad",
};

MetaCutterBuilding.dimensions = {
    defaultBuildingVariant: new Vector(2, 1),
    [MetaCutterBuilding.variants.quad]: new Vector(4, 1),
};

MetaBalancerBuilding.additionalStatistics = {
    [defaultBuildingVariant]: 2,
    [MetaBalancerBuilding.variants.merger]: 1,
    [MetaBalancerBuilding.variants.mergerInverse]: 1,
    [MetaBalancerBuilding.variants.splitter]: 1,
    [MetaBalancerBuilding.variants.splitterInverse]: 1,
};

MetaCutterBuilding.silhouetteColor = "#7dcda2";