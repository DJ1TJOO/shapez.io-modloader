import { generateMatrixRotations } from "../../core/utils";
import { enumDirection, Vector } from "../../core/vector";
import { enumLogicGateType, LogicGateComponent } from "../components/logic_gate";
import { enumPinSlotType, WiredPinsComponent } from "../components/wired_pins";
import { Entity } from "../entity";
import { defaultBuildingVariant, MetaBuilding } from "../meta_building";
import { GameRoot } from "../root";
import { enumHubGoalRewards } from "../tutorial_goals";

export class MetaTransistorBuilding extends MetaBuilding {
    constructor() {
        super("transistor");
    }

    /**
     * @param {string} variant
     */
    getSilhouetteColor(variant) {
        let condition = MetaTransistorBuilding.silhouetteColors[variant];

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
        let reward = MetaTransistorBuilding.avaibleVariants[defaultBuildingVariant];

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
        let condition = MetaTransistorBuilding.isRemovable[variant];

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
        let condition = MetaTransistorBuilding.isRotateable[variant];

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
        const variants = MetaTransistorBuilding.avaibleVariants;

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
        let reward = MetaTransistorBuilding.layerByVariant[defaultBuildingVariant];

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
        let condition = MetaTransistorBuilding.dimensions[variant];

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
            let condition = MetaTransistorBuilding.layerPreview[variant];

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
        let condition = MetaTransistorBuilding.overlayMatrices[variant];
        if (condition) {
            condition = condition[rotation];
        }
        return condition ? condition : null;
    }

    /**
     * @param {string} variant
     */
    getRenderPins(variant) {
        let condition = MetaTransistorBuilding.renderPins[variant];

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
            new WiredPinsComponent({
                slots: [{
                        pos: new Vector(0, 0),
                        direction: enumDirection.top,
                        type: enumPinSlotType.logicalEjector,
                    },
                    {
                        pos: new Vector(0, 0),
                        direction: enumDirection.left,
                        type: enumPinSlotType.logicalAcceptor,
                    },
                    {
                        pos: new Vector(0, 0),
                        direction: enumDirection.bottom,
                        type: enumPinSlotType.logicalAcceptor,
                    },
                ],
            })
        );

        entity.addComponent(
            new LogicGateComponent({
                type: enumLogicGateType.transistor,
            })
        );
    }

    /**
     * @param {Entity} entity
     * @param {number} rotationVariant
     * @param {string} variant
     */
    updateVariants(entity, rotationVariant, variant) {
        MetaTransistorBuilding.componentVariations[variant](entity, rotationVariant);
    }
}

MetaTransistorBuilding.variants = {
    mirrored: "mirrored",
};

MetaTransistorBuilding.overlayMatrices = {
    [defaultBuildingVariant]: generateMatrixRotations([0, 1, 0, 1, 1, 0, 0, 1, 0]),
    [MetaTransistorBuilding.variants.mirrored]: generateMatrixRotations([0, 1, 0, 0, 1, 1, 0, 1, 0]),
};

MetaTransistorBuilding.dimensions = {
    [defaultBuildingVariant]: new Vector(1, 1),
    [MetaTransistorBuilding.variants.mirrored]: new Vector(1, 1),
};

MetaTransistorBuilding.silhouetteColors = {
    [defaultBuildingVariant]: "#823cab",
    [MetaTransistorBuilding.variants.mirrored]: "#823cab",
};

MetaTransistorBuilding.isRemovable = {
    [defaultBuildingVariant]: true,
    [MetaTransistorBuilding.variants.mirrored]: true,
};

MetaTransistorBuilding.isRotateable = {
    [defaultBuildingVariant]: true,
    [MetaTransistorBuilding.variants.mirrored]: true,
};

MetaTransistorBuilding.renderPins = {
    [defaultBuildingVariant]: false,
    [MetaTransistorBuilding.variants.mirrored]: false,
};

MetaTransistorBuilding.layerPreview = {
    [defaultBuildingVariant]: "wires",
    [MetaTransistorBuilding.variants.mirrored]: "wires",
};

MetaTransistorBuilding.avaibleVariants = {
    [defaultBuildingVariant]: enumHubGoalRewards.reward_logic_gates,
    [MetaTransistorBuilding.variants.mirrored]: enumHubGoalRewards.reward_logic_gates,
};

MetaTransistorBuilding.layerByVariant = {
    [defaultBuildingVariant]: "wires",
    [MetaTransistorBuilding.variants.mirrored]: "wires",
};

MetaTransistorBuilding.componentVariations = {
    [defaultBuildingVariant]: (entity, rotationVariant) => {
        entity.components.WiredPins.slots[1].direction = enumDirection.left;
    },

    [MetaTransistorBuilding.variants.mirrored]: (entity, rotationVariant) => {
        entity.components.WiredPins.slots[1].direction = enumDirection.right;
    },
};