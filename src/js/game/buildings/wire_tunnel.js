import { generateMatrixRotations } from "../../core/utils";
import { Vector } from "../../core/vector";
import { WireTunnelComponent } from "../components/wire_tunnel";
import { Entity } from "../entity";
import { defaultBuildingVariant, MetaBuilding } from "../meta_building";
import { GameRoot } from "../root";
import { enumHubGoalRewards } from "../tutorial_goals";

export class MetaWireTunnelBuilding extends MetaBuilding {
    constructor() {
        super("wire_tunnel");
    }

    /**
     * @param {string} variant
     */
    getSilhouetteColor(variant) {
        let condition = MetaWireTunnelBuilding.silhouetteColors[variant];

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
        let reward = MetaWireTunnelBuilding.avaibleVariants[defaultBuildingVariant];

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
        let condition = MetaWireTunnelBuilding.isRemovable[variant];

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
        let condition = MetaWireTunnelBuilding.isRotateable[variant];

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
        const variants = MetaWireTunnelBuilding.avaibleVariants;

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
        let reward = MetaWireTunnelBuilding.layerByVariant[defaultBuildingVariant];

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
        let condition = MetaWireTunnelBuilding.dimensions[variant];

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
            let condition = MetaWireTunnelBuilding.layerPreview[variant];

            if (typeof condition === "function") {
                // @ts-ignore
                condition = condition();
            }

            // @ts-ignore
            return typeof condition === "string" ? condition : null;
        }
        /**
         * @param {number} rotation
         * @param {number} rotationVariant
         * @param {string} variant
         * @param {Entity} entity
         * @returns {Array<number>|null}
         */
    getSpecialOverlayRenderMatrix(rotation, rotationVariant, variant, entity) {
        let condition;
        if (MetaWireTunnelBuilding.overlayMatrices[variant]) {
            condition = MetaWireTunnelBuilding.overlayMatrices[variant][rotation];
        }
        return condition ? condition : null;
    }

    /**
     * @param {string} variant
     */
    getRenderPins(variant) {
        let condition = MetaWireTunnelBuilding.renderPins[variant];

        if (typeof condition === "function") {
            condition = condition();
        }

        return typeof condition === "boolean" ? condition : true;
    }

    /**
     * @param {Entity} entity
     * @param {number} rotationVariant
     * @param {string} variant
     */
    updateVariants(entity, rotationVariant, variant) {
        MetaWireTunnelBuilding.componentVariations[variant](entity, rotationVariant);
    }

    /**
     * Creates the entity at the given location
     * @param {Entity} entity
     */
    setupEntityComponents(entity) {
        entity.addComponent(new WireTunnelComponent());
    }
}

MetaWireTunnelBuilding.overlayMatrices = {
    [defaultBuildingVariant]: generateMatrixRotations([0, 1, 0, 1, 1, 1, 0, 1, 0]),
};

MetaWireTunnelBuilding.dimensions = {
    [defaultBuildingVariant]: new Vector(1, 1),
};

MetaWireTunnelBuilding.silhouetteColors = {
    [defaultBuildingVariant]: "#777a86",
};

MetaWireTunnelBuilding.isRemovable = {
    [defaultBuildingVariant]: true,
};

MetaWireTunnelBuilding.isRotateable = {
    [defaultBuildingVariant]: false,
};

MetaWireTunnelBuilding.renderPins = {
    [defaultBuildingVariant]: false,
};

MetaWireTunnelBuilding.layerPreview = {
    [defaultBuildingVariant]: "wires",
};

MetaWireTunnelBuilding.avaibleVariants = {
    [defaultBuildingVariant]: enumHubGoalRewards.reward_wires_painter_and_levers,
};

MetaWireTunnelBuilding.layerByVariant = {
    [defaultBuildingVariant]: "wires",
};

MetaWireTunnelBuilding.componentVariations = {
    [defaultBuildingVariant]: (entity, rotationVariant) => {},
};