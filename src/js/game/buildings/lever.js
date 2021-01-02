import { enumDirection, Vector } from "../../core/vector";
import { enumPinSlotType, WiredPinsComponent } from "../components/wired_pins";
import { Entity } from "../entity";
import { defaultBuildingVariant, MetaBuilding } from "../meta_building";
import { GameRoot } from "../root";
import { LeverComponent } from "../components/lever";
import { enumHubGoalRewards } from "../tutorial_goals";

export class MetaLeverBuilding extends MetaBuilding {
    constructor() {
        super("lever");
    }

    /**
     * @param {string} variant
     */
    getSilhouetteColor(variant) {
        let condition = MetaLeverBuilding.silhouetteColors[variant];

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
        let reward = MetaLeverBuilding.avaibleVariants[defaultBuildingVariant];

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
        let condition = MetaLeverBuilding.isRemovable[variant];

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
        let condition = MetaLeverBuilding.isRotateable[variant];

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
        const variants = MetaLeverBuilding.avaibleVariants;

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
        let reward = MetaLeverBuilding.layerByVariant[defaultBuildingVariant];

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
        let condition = MetaLeverBuilding.dimensions[variant];

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
        let condition = MetaLeverBuilding.layerPreview[variant];

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
        let condition = MetaLeverBuilding.overlayMatrices[variant];
        if (condition) {
            condition = condition[rotation];
        }
        return condition ? condition : null;
    }

    getSprite() {
        return null;
    }

    /**
     * @param {string} variant
     */
    getRenderPins(variant) {
        let condition = MetaLeverBuilding.renderPins[variant];

        if (typeof condition === "function") {
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
            new WiredPinsComponent({
                slots: [{
                    pos: new Vector(0, 0),
                    direction: enumDirection.top,
                    type: enumPinSlotType.logicalEjector,
                }, ],
            })
        );

        entity.addComponent(new LeverComponent({}));
    }

    /**
     * @param {Entity} entity
     * @param {number} rotationVariant
     * @param {string} variant
     */
    updateVariants(entity, rotationVariant, variant) {
        MetaLeverBuilding.componentVariations[variant](entity, rotationVariant);
    }
}

MetaLeverBuilding.overlayMatrices = {
    [defaultBuildingVariant]: null,
};

MetaLeverBuilding.dimensions = {
    [defaultBuildingVariant]: new Vector(1, 1),
};

MetaLeverBuilding.silhouetteColors = {
    [defaultBuildingVariant]: "#1a678b",
};

MetaLeverBuilding.isRemovable = {
    [defaultBuildingVariant]: true,
};

MetaLeverBuilding.isRotateable = {
    [defaultBuildingVariant]: true,
};

MetaLeverBuilding.avaibleVariants = {
    [defaultBuildingVariant]: enumHubGoalRewards.reward_wires_painter_and_levers,
};

MetaLeverBuilding.layerByVariant = {
    [defaultBuildingVariant]: "regular",
};

MetaLeverBuilding.layerPreview = {
    [defaultBuildingVariant]: "wires",
};

MetaLeverBuilding.renderPins = {
    [defaultBuildingVariant]: true,
};

MetaLeverBuilding.componentVariations = {
    [defaultBuildingVariant]: (entity, rotationVariant) => {
        entity.components.WiredPins.setSlots([{
            pos: new Vector(0, 0),
            direction: enumDirection.top,
            type: enumPinSlotType.logicalEjector,
        }, ]);
    },
};