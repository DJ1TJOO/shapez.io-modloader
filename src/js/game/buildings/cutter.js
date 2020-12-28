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
        let speed = 0;
        if (typeof MetaCutterBuilding.additionalStatistics[variant] === "function") {
            // @ts-ignore
            speed = MetaCutterBuilding.additionalStatistics[variant](root);
        } else {
            // @ts-ignore
            speed = MetaCutterBuilding.additionalStatistics[variant];
        }
        return [
            [T.ingame.buildingPlacement.infoTexts.speed, formatItemsPerSecond(speed)]
        ];
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
        MetaCutterBuilding.componentVariations[variant](entity);
    }
}
MetaCutterBuilding.variants = {
    quad: "quad",
};

MetaCutterBuilding.dimensions = {
    defaultBuildingVariant: new Vector(2, 1),
    [MetaCutterBuilding.variants.quad]: new Vector(4, 1),
};

MetaCutterBuilding.additionalStatistics = {
    [defaultBuildingVariant]: root =>
        (root.hubGoals.getProcessorBaseSpeed(enumItemProcessorTypes.cutter) / 2) * 1,
    [MetaCutterBuilding.variants.quad]: root =>
        (root.hubGoals.getProcessorBaseSpeed(enumItemProcessorTypes.cutterQuad) / 2) * 1,
};

MetaCutterBuilding.componentVariations = {
    [defaultBuildingVariant]: entity => {
        entity.components.ItemEjector.setSlots([
            { pos: new Vector(0, 0), direction: enumDirection.top },
            { pos: new Vector(1, 0), direction: enumDirection.top },
        ]);

        entity.components.ItemProcessor.type = enumItemProcessorTypes.cutter;
    },

    [MetaCutterBuilding.variants.quad]: entity => {
        entity.components.ItemEjector.setSlots([
            { pos: new Vector(0, 0), direction: enumDirection.top },
            { pos: new Vector(1, 0), direction: enumDirection.top },
            { pos: new Vector(2, 0), direction: enumDirection.top },
            { pos: new Vector(3, 0), direction: enumDirection.top },
        ]);
        entity.components.ItemProcessor.type = enumItemProcessorTypes.cutterQuad;
    },
};

MetaCutterBuilding.silhouetteColor = "#7dcda2";