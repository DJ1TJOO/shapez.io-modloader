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

    /**
     * @param {string} variant
     */
    getSilhouetteColor(variant) {
        let condition = MetaCutterBuilding.silhouetteColors[variant];

        if (typeof condition === "function") {
            // @ts-ignore
            condition = condition();
        }

        // @ts-ignore
        return typeof condition === "string" ? condition : "#ffffff";
    }

    /**
     * Returns the edit layer of the building
     * @param {GameRoot} root
     * @param {string} variant
     * @returns {Layer}
     */
    getLayer(root, variant) {
        let reward = MetaCutterBuilding.layerByVariant[defaultBuildingVariant];

        if (typeof reward === "function") {
            // @ts-ignore
            reward = reward();
        }

        // @ts-ignore
        return typeof reward === "string" ? reward : "regular";
    }

    /**
     * @param {string} variant
     */
    getDimensions(variant) {
        let condition = MetaCutterBuilding.dimensions[variant];

        if (typeof condition === "function") {
            // @ts-ignore
            condition = condition();
        }

        // @ts-ignore
        return typeof condition === "object" ? condition : new Vector(1, 1);
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
        const variants = MetaCutterBuilding.avaibleVariants;

        let available = [];
        for (const variant in variants) {
            let reward = variants[variant];
            if (typeof reward === "function") {
                // @ts-ignore
                reward = reward(root);
            }

            if (typeof reward === "boolean") {
                available.push(variant);
                continue;
            }

            if (!root.hubGoals.isRewardUnlocked(reward)) continue;
            available.push(variant);
        }

        return available;
    }

    /**
     * @param {GameRoot} root
     */
    getIsUnlocked(root) {
        let reward = MetaCutterBuilding.avaibleVariants[defaultBuildingVariant];

        if (typeof reward === "function") {
            // @ts-ignore
            reward = reward(root);
        }

        if (typeof reward === "boolean") {
            // @ts-ignore
            return reward;
        }

        // @ts-ignore
        return typeof reward === "string" ? root.hubGoals.isRewardUnlocked(reward) : false;
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
     * @param {Entity} entity
     * @param {number} rotationVariant
     * @param {string} variant
     */
    updateVariants(entity, rotationVariant, variant) {
        MetaCutterBuilding.componentVariations[variant](entity, rotationVariant);
    }
}

MetaCutterBuilding.variants = {
    quad: "quad",
};

MetaCutterBuilding.overlayMatrices = {
    [defaultBuildingVariant]: null,
};

MetaCutterBuilding.dimensions = {
    [defaultBuildingVariant]: new Vector(2, 1),
    [MetaCutterBuilding.variants.quad]: new Vector(4, 1),
};

MetaCutterBuilding.silhouetteColors = {
    [defaultBuildingVariant]: "#7dcda2",
};

MetaCutterBuilding.avaibleVariants = {
    [defaultBuildingVariant]: enumHubGoalRewards.reward_cutter_and_trash,
};

MetaCutterBuilding.layerByVariant = {
    [defaultBuildingVariant]: "regular",
};

MetaCutterBuilding.additionalStatistics = {
    [defaultBuildingVariant]: root =>
        (root.hubGoals.getProcessorBaseSpeed(enumItemProcessorTypes.cutter) / 2) * 1,
    [MetaCutterBuilding.variants.quad]: root =>
        (root.hubGoals.getProcessorBaseSpeed(enumItemProcessorTypes.cutterQuad) / 2) * 1,
};

MetaCutterBuilding.componentVariations = {
    [defaultBuildingVariant]: (entity, rotationVariant) => {
        entity.components.ItemEjector.setSlots([
            { pos: new Vector(0, 0), direction: enumDirection.top },
            { pos: new Vector(1, 0), direction: enumDirection.top },
        ]);

        entity.components.ItemProcessor.type = enumItemProcessorTypes.cutter;
    },

    [MetaCutterBuilding.variants.quad]: (entity, rotationVariant) => {
        entity.components.ItemEjector.setSlots([
            { pos: new Vector(0, 0), direction: enumDirection.top },
            { pos: new Vector(1, 0), direction: enumDirection.top },
            { pos: new Vector(2, 0), direction: enumDirection.top },
            { pos: new Vector(3, 0), direction: enumDirection.top },
        ]);
        entity.components.ItemProcessor.type = enumItemProcessorTypes.cutterQuad;
    },
};