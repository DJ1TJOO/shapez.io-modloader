import { enumDirection, Vector } from "../../core/vector";
import { enumPinSlotType, WiredPinsComponent } from "../components/wired_pins";
import { Entity } from "../entity";
import { defaultBuildingVariant, MetaBuilding } from "../meta_building";
import { GameRoot } from "../root";
import { ConstantSignalComponent } from "../components/constant_signal";
import { generateMatrixRotations } from "../../core/utils";
import { enumHubGoalRewards } from "../tutorial_goals";

export class MetaConstantSignalBuilding extends MetaBuilding {
    constructor() {
        super("constant_signal");
    }

    /**
     * @param {string} variant
     */
    getSilhouetteColor(variant) {
        let condition = MetaConstantSignalBuilding.silhouetteColors[variant];

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
        let reward = MetaConstantSignalBuilding.avaibleVariants[defaultBuildingVariant];

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
     * @param {GameRoot} root
     */
    getAvailableVariants(root) {
        const variants = MetaConstantSignalBuilding.avaibleVariants;

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
        let reward = MetaConstantSignalBuilding.layerByVariant[defaultBuildingVariant];

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
        let condition = MetaConstantSignalBuilding.dimensions[variant];

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
     */
    getRenderPins(root, variant) {
        let condition = MetaConstantSignalBuilding.renderPins[variant];

        if (typeof condition === "function") {
            condition = condition(root);
        }

        // @ts-ignore
        return typeof condition === "boolean" ? condition : false;
    }

    /**
     * @param {number} rotation
     * @param {number} rotationVariant
     * @param {string} variant
     * @param {Entity} entity
     * @returns {Array<number>|null}
     */
    getSpecialOverlayRenderMatrix(rotation, rotationVariant, variant, entity) {
        let condition = MetaConstantSignalBuilding.overlayMatrices[variant][rotation];
        return condition ? condition : null;
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
        entity.addComponent(new ConstantSignalComponent({}));
    }

    /**
     * @param {Entity} entity
     * @param {number} rotationVariant
     * @param {string} variant
     */
    updateVariants(entity, rotationVariant, variant) {
        MetaConstantSignalBuilding.componentVariations[variant](entity, rotationVariant);
    }
}

MetaConstantSignalBuilding.overlayMatrices = {
    [defaultBuildingVariant]: generateMatrixRotations([0, 1, 0, 1, 1, 1, 1, 1, 1]),
};

MetaConstantSignalBuilding.dimensions = {
    [defaultBuildingVariant]: new Vector(1, 1),
};

MetaConstantSignalBuilding.silhouetteColors = {
    [defaultBuildingVariant]: "#2b84fd",
};

MetaConstantSignalBuilding.renderPins = {
    [defaultBuildingVariant]: false,
};

MetaConstantSignalBuilding.avaibleVariants = {
    [defaultBuildingVariant]: enumHubGoalRewards.reward_constant_signal,
};

MetaConstantSignalBuilding.layerByVariant = {
    [defaultBuildingVariant]: "wires",
};

MetaConstantSignalBuilding.componentVariations = {
    [defaultBuildingVariant]: (entity, rotationVariant) => {
        entity.components.WiredPins.setSlots([{
            pos: new Vector(0, 0),
            direction: enumDirection.top,
            type: enumPinSlotType.logicalEjector,
        }, ]);
    },
};