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
     * @param {String} variant
     */
    getDimensions(variant) {
        return MetaRotaterBuilding.dimensions[variant];
    }

    getSilhouetteColor() {
        return MetaRotaterBuilding.silhouetteColor;
    }

    /**
     * @param {number} rotation
     * @param {number} rotationVariant
     * @param {string} variant
     * @param {Entity} entity
     * @returns {Array<number>|null}
     */
    getSpecialOverlayRenderMatrix(rotation, rotationVariant, variant, entity) {
        const matrix = MetaRotaterBuilding.overlayMatrices[variant];
        if (matrix) {
            return matrix[rotation];
        }
        return null;
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
     *
     * @param {GameRoot} root
     */
    getAvailableVariants(root) {
        const variants = MetaRotaterBuilding.avaibleVariants;

        let available = [];
        for (const variant in variants) {
            const reward = variants[variant];
            if (typeof reward === "function") {
                // @ts-ignore
                if (reward() !== true && !root.hubGoals.isRewardUnlocked(reward())) continue;
                available.push(variant);
            } else {
                // @ts-ignore
                if (reward !== true && !root.hubGoals.isRewardUnlocked(reward)) continue;
                available.push(variant);
            }
        }

        return available;
    }

    /**
     * @param {GameRoot} root
     */
    getIsUnlocked(root) {
        const reward = MetaRotaterBuilding.avaibleVariants[defaultBuildingVariant];

        if (typeof reward === "function") {
            // @ts-ignore
            if (reward() !== true && !root.hubGoals.isRewardUnlocked(reward())) return false;
            // @ts-ignore
            return root.hubGoals.isRewardUnlocked(reward());
        } else if (typeof reward === "boolean") {
            // @ts-ignore
            return reward;
        } else if (root.hubGoals.isRewardUnlocked(reward) != undefined) {
            // @ts-ignore
            if (reward !== true && !root.hubGoals.isRewardUnlocked(reward)) return false;
            // @ts-ignore
            return root.hubGoals.isRewardUnlocked(reward);
        } else {
            return false;
        } // TODO: Test this
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
     *
     * @param {Entity} entity
     * @param {number} rotationVariant
     * @param {string} variant
     */
    updateVariants(entity, rotationVariant, variant) {
        switch (variant) {
            case defaultBuildingVariant:
                {
                    entity.components.ItemProcessor.type = enumItemProcessorTypes.rotater;
                    break;
                }
            case MetaRotaterBuilding.variants.ccw:
                {
                    entity.components.ItemProcessor.type = enumItemProcessorTypes.rotaterCCW;
                    break;
                }
            case MetaRotaterBuilding.variants.rotate180:
                {
                    entity.components.ItemProcessor.type = enumItemProcessorTypes.rotater180;
                    break;
                }
            default:
                assertAlways(false, "Unknown rotater variant: " + variant);
        }
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

MetaRotaterBuilding.overlayMatrices = {
    [defaultBuildingVariant]: generateMatrixRotations([0, 1, 1, 1, 1, 0, 0, 1, 1]),
    [MetaRotaterBuilding.variants.ccw]: generateMatrixRotations([1, 1, 0, 0, 1, 1, 1, 1, 0]),
    [MetaRotaterBuilding.variants.rotate180]: generateMatrixRotations([1, 1, 0, 1, 1, 1, 0, 1, 1]),
};

MetaRotaterBuilding.avaibleVariants = {
    [defaultBuildingVariant]: true,
    [MetaRotaterBuilding.variants.ccw]: enumHubGoalRewards.reward_rotater_ccw,
    [MetaRotaterBuilding.variants.rotate180]: enumHubGoalRewards.reward_rotater_180,
};

MetaRotaterBuilding.additionalStatistics = {
    [defaultBuildingVariant]: root => {
        return root.hubGoals.getProcessorBaseSpeed(enumItemProcessorTypes.rotater);
    },

    [MetaRotaterBuilding.variants.ccw]: root => {
        return root.hubGoals.getProcessorBaseSpeed(enumItemProcessorTypes.rotaterCCW);
    },

    [MetaRotaterBuilding.variants.rotate180]: root => {
        return root.hubGoals.getProcessorBaseSpeed(enumItemProcessorTypes.rotater180);
    },
};
MetaRotaterBuilding.silhouetteColor = "#7dc6cd";

MetaRotaterBuilding;