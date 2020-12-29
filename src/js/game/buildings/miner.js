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

    getSilhouetteColor(variant) {
        return MetaMinerBuilding.silhouetteColor[variant];
    }

    /**
     * @param {GameRoot} root
     * @param {string} variant
     * @returns {Array<[string, string]>}
     */
    getAdditionalStatistics(root, variant) {
        const speed = root.hubGoals.getMinerBaseSpeed();
        return [
            [T.ingame.buildingPlacement.infoTexts.speed, formatItemsPerSecond(speed)]
        ];
    }

    /**
     *
     * @param {GameRoot} root
     */
    getAvailableVariants(root) {
        const variants = MetaMinerBuilding.avaibleVariants;

        let available = [];
        for (const variant in variants) {
            const reward = variants[variant];
            if (typeof reward === "function") {
                // @ts-ignore
                if (!reward(root)) continue;
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
     * @param {number} rotation
     * @param {number} rotationVariant
     * @param {string} variant
     * @param {Entity} entity
     */
    getSpecialOverlayRenderMatrix(rotation, rotationVariant, variant, entity) {
        return MetaMinerBuilding.overlayMatrix[variant][rotation];
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
     *
     * @param {Entity} entity
     * @param {number} rotationVariant
     * @param {string} variant
     */
    updateVariants(entity, rotationVariant, variant) {
        entity.components.Miner.chainable = variant === MetaMinerBuilding.variants.chainable;
    }
}

MetaMinerBuilding.silhouetteColor = {
    [defaultBuildingVariant]: "#b37dcd",
};

MetaMinerBuilding.variants = {
    chainable: "chainable",
};

MetaMinerBuilding.overlayMatrix = {
    [defaultBuildingVariant]: generateMatrixRotations([1, 1, 1, 1, 0, 1, 1, 1, 1]),
    [MetaMinerBuilding.variants.chainable]: generateMatrixRotations([0, 1, 0, 1, 1, 1, 1, 1, 1]),
};

MetaMinerBuilding.avaibleVariants = {
    [defaultBuildingVariant]: root =>
        !root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_miner_chainable),
    [MetaMinerBuilding.variants.chainable]: enumHubGoalRewards.reward_miner_chainable,
};