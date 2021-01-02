import { enumDirection, Vector } from "../../core/vector";
import { ItemEjectorComponent } from "../components/item_ejector";
import { MinerComponent } from "../components/miner";
import { Entity } from "../entity";
import { MetaBuilding, defaultBuildingVariant } from "../meta_building";
import { GameRoot } from "../root";
import { enumHubGoalRewards } from "../tutorial_goals";
import { T } from "../../translations";
import { formatItemsPerSecond, generateMatrixRotations } from "../../core/utils";

export class MetaMinerBuilding extends MetaBuilding {
    constructor() {
        super("miner");
    }

    /**
     * @param {string} variant
     */
    getSilhouetteColor(variant) {
        let condition = MetaMinerBuilding.silhouetteColors[variant];

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
        return true;
    }

    /**
     * @param {string} variant
     */
    getIsRemovable(variant) {
        let condition = MetaMinerBuilding.isRemovable[variant];

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
        let condition = MetaMinerBuilding.isRotateable[variant];

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
        const variants = MetaMinerBuilding.avaibleVariants;

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

            // @ts-ignore
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
        let reward = MetaMinerBuilding.layerByVariant[defaultBuildingVariant];

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
        let condition = MetaMinerBuilding.dimensions[variant];

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
        if (typeof MetaMinerBuilding.additionalStatistics[variant] === "function") {
            // @ts-ignore
            speed = MetaMinerBuilding.additionalStatistics[variant](root);
        } else {
            // @ts-ignore
            speed = MetaMinerBuilding.additionalStatistics[variant];
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
        let condition = MetaMinerBuilding.overlayMatrices[variant];
        if (condition) {
            condition = condition[rotation];
        }
        return condition ? condition : null;
    }

    /**
     * Creates the entity at the given location
     * @param {Entity} entity
     */
    setupEntityComponents(entity) {
        entity.addComponent(new MinerComponent({}));
        entity.addComponent(
            new ItemEjectorComponent({
                slots: [{ pos: new Vector(0, 0), direction: enumDirection.top }],
            })
        );
    }

    /**
     * @param {Entity} entity
     * @param {number} rotationVariant
     * @param {string} variant
     */
    updateVariants(entity, rotationVariant, variant) {
        MetaMinerBuilding.componentVariations[variant](entity, rotationVariant);
    }
}

MetaMinerBuilding.variants = {
    chainable: "chainable",
};

MetaMinerBuilding.silhouetteColors = {
    [defaultBuildingVariant]: "#b37dcd",
    [MetaMinerBuilding.variants.chainable]: "#b37dcd",
};

MetaMinerBuilding.dimensions = {
    [defaultBuildingVariant]: new Vector(1, 1),
    [MetaMinerBuilding.variants.chainable]: new Vector(1, 1),
};

MetaMinerBuilding.isRemovable = {
    [defaultBuildingVariant]: true,
    [MetaMinerBuilding.variants.chainable]: true,
};

MetaMinerBuilding.isRotateable = {
    [defaultBuildingVariant]: true,
    [MetaMinerBuilding.variants.chainable]: true,
};

MetaMinerBuilding.layerByVariant = {
    [defaultBuildingVariant]: "regular",
    [MetaMinerBuilding.variants.chainable]: "regular",
};

MetaMinerBuilding.overlayMatrices = {
    [defaultBuildingVariant]: generateMatrixRotations([1, 1, 1, 1, 0, 1, 1, 1, 1]),
    [MetaMinerBuilding.variants.chainable]: generateMatrixRotations([0, 1, 0, 1, 1, 1, 1, 1, 1]),
};

MetaMinerBuilding.avaibleVariants = {
    [defaultBuildingVariant]: root =>
        !root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_miner_chainable),
    [MetaMinerBuilding.variants.chainable]: root =>
        root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_miner_chainable),
};

MetaMinerBuilding.additionalStatistics = {
    [defaultBuildingVariant]: root => root.hubGoals.getMinerBaseSpeed(),
    [MetaMinerBuilding.variants.chainable]: root => root.hubGoals.getMinerBaseSpeed(),
};

MetaMinerBuilding.componentVariations = {
    [defaultBuildingVariant]: (entity, rotationVariant) => {
        entity.components.Miner.chainable = false;
    },

    [MetaMinerBuilding.variants.chainable]: (entity, rotationVariant) => {
        entity.components.Miner.chainable = true;
    },
};