import { formatItemsPerSecond, generateMatrixRotations } from "../../core/utils";
import { enumDirection, Vector } from "../../core/vector";
import { T } from "../../translations";
import { ItemAcceptorComponent } from "../components/item_acceptor";
import { ItemEjectorComponent } from "../components/item_ejector";
import { enumItemProcessorTypes, ItemProcessorComponent } from "../components/item_processor";
import { Entity } from "../entity";
import { defaultBuildingVariant, MetaBuilding } from "../meta_building";
import { GameRoot } from "../root";
import { enumHubGoalRewards } from "../tutorial_goals";

export class MetaRotaterBuilding extends MetaBuilding {
    constructor() {
        super("rotater");
    }

    /**
     * @param {string} variant
     */
    getSilhouetteColor(variant) {
        let condition = MetaRotaterBuilding.silhouetteColors[variant];

        if (typeof condition === "function") {
            // @ts-ignore
            condition = condition();
        }

        // @ts-ignore
        return typeof condition === "string" ? condition : "#ffffff";
    }

    /**
     * @param {GameRoot} root
     */
    getIsUnlocked(root) {
        let reward = MetaRotaterBuilding.avaibleVariants[defaultBuildingVariant];

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
     * @param {string} variant
     */
    getIsRemovable(variant) {
        let condition = MetaRotaterBuilding.isRemovable[variant];

        if (typeof condition === "function") {
            // @ts-ignore
            condition = condition();
        }

        // @ts-ignore
        return typeof condition === "boolean" ? condition : true;
    }

    /**
     * @param {string} variant
     */
    getIsRotateable(variant) {
        let condition = MetaRotaterBuilding.isRotateable[variant];

        if (typeof condition === "function") {
            // @ts-ignore
            condition = condition();
        }

        // @ts-ignore
        return typeof condition === "boolean" ? condition : true;
    }

    /**
     * @param {GameRoot} root
     */
    getAvailableVariants(root) {
        const variants = MetaRotaterBuilding.avaibleVariants;

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
     * Returns the edit layer of the building
     * @param {GameRoot} root
     * @param {string} variant
     * @returns {Layer}
     */
    getLayer(root, variant) {
        let reward = MetaRotaterBuilding.layerByVariant[defaultBuildingVariant];

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
        let condition = MetaRotaterBuilding.dimensions[variant];

        if (typeof condition === "function") {
            // @ts-ignore
            condition = condition();
        }

        // @ts-ignore
        return typeof condition === "object" ? condition : new Vector(1, 1);
    }

    /**
     * @param {string} variant
     */
    getShowLayerPreview(variant) {
        let condition = MetaRotaterBuilding.layerPreview[variant];

        if (typeof condition === "function") {
            // @ts-ignore
            condition = condition();
        }

        // @ts-ignore
        return typeof condition === "string" ? condition : null;
    }

    /**
     * @param {GameRoot} root
     * @param {string} variant
     * @returns {Array<[string, string]>}
     */
    getAdditionalStatistics(root, variant) {
        let speed = 0;
        if (typeof MetaRotaterBuilding.additionalStatistics[variant] === "function") {
            // @ts-ignore
            speed = MetaRotaterBuilding.additionalStatistics[variant](root);
        } else {
            // @ts-ignore
            speed = MetaRotaterBuilding.additionalStatistics[variant];
        }
        return [
            [T.ingame.buildingPlacement.infoTexts.speed, formatItemsPerSecond(speed)]
        ];
    }

    /**
     * @param {number} rotation
     * @param {number} rotationVariant
     * @param {string} variant
     * @param {Entity} entity
     * @returns {Array<number>|null}
     */
    getSpecialOverlayRenderMatrix(rotation, rotationVariant, variant, entity) {
        let condition = MetaRotaterBuilding.overlayMatrices[variant];
        if (condition) {
            condition = condition[rotation];
        }
        return condition ? condition : null;
    }

    /**
     * @param {string} variant
     */
    getRenderPins(variant) {
        let condition = MetaRotaterBuilding.renderPins[variant];

        if (typeof condition === "function") {
            // @ts-ignore
            condition = condition();
        }

        return typeof condition === "boolean" ? condition : true;
    }

    /**
     * Creates the entity at the given location
     * @param {Entity} entity
     */
    setupEntityComponents(entity) {
        entity.addComponent(
            new ItemProcessorComponent({
                inputsPerCharge: 1,
                processorType: enumItemProcessorTypes.rotater,
            })
        );

        entity.addComponent(
            new ItemEjectorComponent({
                slots: [{ pos: new Vector(0, 0), direction: enumDirection.top }],
            })
        );
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
        MetaRotaterBuilding.componentVariations[variant](entity, rotationVariant);
    }
}

MetaRotaterBuilding.variants = {
    ccw: "ccw",
    rotate180: "rotate180",
};

MetaRotaterBuilding.dimensions = {
    [defaultBuildingVariant]: new Vector(1, 1),
    [MetaRotaterBuilding.variants.ccw]: new Vector(1, 1),
    [MetaRotaterBuilding.variants.rotate180]: new Vector(1, 1),
};

MetaRotaterBuilding.silhouetteColors = {
    [defaultBuildingVariant]: "#7dc6cd",
    [MetaRotaterBuilding.variants.ccw]: "#7dc6cd",
    [MetaRotaterBuilding.variants.rotate180]: "#7dc6cd",
};

MetaRotaterBuilding.overlayMatrices = {
    [defaultBuildingVariant]: generateMatrixRotations([0, 1, 1, 1, 1, 0, 0, 1, 1]),
    [MetaRotaterBuilding.variants.ccw]: generateMatrixRotations([1, 1, 0, 0, 1, 1, 1, 1, 0]),
    [MetaRotaterBuilding.variants.rotate180]: generateMatrixRotations([1, 1, 0, 1, 1, 1, 0, 1, 1]),
};

MetaRotaterBuilding.avaibleVariants = {
    [defaultBuildingVariant]: enumHubGoalRewards.reward_rotater,
    [MetaRotaterBuilding.variants.ccw]: enumHubGoalRewards.reward_rotater_ccw,
    [MetaRotaterBuilding.variants.rotate180]: enumHubGoalRewards.reward_rotater_180,
};

MetaRotaterBuilding.isRemovable = {
    [defaultBuildingVariant]: true,
    [MetaRotaterBuilding.variants.ccw]: true,
    [MetaRotaterBuilding.variants.rotate180]: true,
};

MetaRotaterBuilding.isRotateable = {
    [defaultBuildingVariant]: true,
    [MetaRotaterBuilding.variants.ccw]: true,
    [MetaRotaterBuilding.variants.rotate180]: true,
};

MetaRotaterBuilding.layerByVariant = {
    [defaultBuildingVariant]: "regular",
    [MetaRotaterBuilding.variants.ccw]: "regular",
    [MetaRotaterBuilding.variants.rotate180]: "regular",
};

MetaRotaterBuilding.layerPreview = {
    [defaultBuildingVariant]: null,
    [MetaRotaterBuilding.variants.ccw]: null,
    [MetaRotaterBuilding.variants.rotate180]: null,
};

MetaRotaterBuilding.renderPins = {
    [defaultBuildingVariant]: null,
    [MetaRotaterBuilding.variants.ccw]: null,
    [MetaRotaterBuilding.variants.rotate180]: null,
};

MetaRotaterBuilding.additionalStatistics = {
    [defaultBuildingVariant]: root => root.hubGoals.getProcessorBaseSpeed(enumItemProcessorTypes.rotater),
    [MetaRotaterBuilding.variants.ccw]: root =>
        root.hubGoals.getProcessorBaseSpeed(enumItemProcessorTypes.rotaterCCW),
    [MetaRotaterBuilding.variants.rotate180]: root =>
        root.hubGoals.getProcessorBaseSpeed(enumItemProcessorTypes.rotater180),
};

MetaRotaterBuilding.componentVariations = {
    [defaultBuildingVariant]: (entity, rotationVariant) => {
        entity.components.ItemProcessor.type = enumItemProcessorTypes.rotater;
    },

    [MetaRotaterBuilding.variants.ccw]: (entity, rotationVariant) => {
        entity.components.ItemProcessor.type = enumItemProcessorTypes.rotaterCCW;
    },

    [MetaRotaterBuilding.variants.rotate180]: (entity, rotationVariant) => {
        entity.components.ItemProcessor.type = enumItemProcessorTypes.rotater180;
    },
};