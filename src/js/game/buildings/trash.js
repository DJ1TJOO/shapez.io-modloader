import { generateMatrixRotations } from "../../core/utils";
import { enumDirection, Vector } from "../../core/vector";
import { ItemAcceptorComponent } from "../components/item_acceptor";
import { enumItemProcessorTypes, ItemProcessorComponent } from "../components/item_processor";
import { Entity } from "../entity";
import { defaultBuildingVariant, MetaBuilding } from "../meta_building";
import { GameRoot } from "../root";
import { enumHubGoalRewards } from "../tutorial_goals";

const overlayMatrix = generateMatrixRotations([1, 1, 0, 1, 1, 1, 0, 1, 1]);

export class MetaTrashBuilding extends MetaBuilding {
    constructor() {
        super("trash");
    }

    /**
     * @param {string} variant
     */
    getSilhouetteColor(variant) {
        let condition = MetaTrashBuilding.silhouetteColors[variant];

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
        let reward = MetaTrashBuilding.avaibleVariants[defaultBuildingVariant];

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
        let condition = MetaTrashBuilding.isRemovable[variant];

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
        let condition = MetaTrashBuilding.isRotateable[variant];

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
        const variants = MetaTrashBuilding.avaibleVariants;

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
        let reward = MetaTrashBuilding.layerByVariant[defaultBuildingVariant];

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
        let condition = MetaTrashBuilding.dimensions[variant];

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
        let condition = MetaTrashBuilding.layerPreview[variant];

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
        let condition = MetaTrashBuilding.overlayMatrices[variant];
        if (condition) {
            condition = condition[rotation];
        }
        return condition ? condition : null;
    }

    /**
     * @param {string} variant
     */
    getRenderPins(variant) {
        let condition = MetaTrashBuilding.renderPins[variant];

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
            new ItemAcceptorComponent({
                slots: [{
                    pos: new Vector(0, 0),
                    directions: [
                        enumDirection.top,
                        enumDirection.right,
                        enumDirection.bottom,
                        enumDirection.left,
                    ],
                }, ],
            })
        );
        entity.addComponent(
            new ItemProcessorComponent({
                inputsPerCharge: 1,
                processorType: enumItemProcessorTypes.trash,
            })
        );
    }

    /**
     * @param {Entity} entity
     * @param {number} rotationVariant
     * @param {string} variant
     */
    updateVariants(entity, rotationVariant, variant) {
        MetaTrashBuilding.componentVariations[variant](entity, rotationVariant);
    }
}

MetaTrashBuilding.overlayMatrices = {
    [defaultBuildingVariant]: generateMatrixRotations([1, 1, 0, 1, 1, 1, 0, 1, 1]),
};

MetaTrashBuilding.dimensions = {
    [defaultBuildingVariant]: new Vector(1, 1),
};

MetaTrashBuilding.silhouetteColors = {
    [defaultBuildingVariant]: "#ed1d5d",
};

MetaTrashBuilding.isRemovable = {
    [defaultBuildingVariant]: true,
};

MetaTrashBuilding.isRotateable = {
    [defaultBuildingVariant]: true,
};

MetaTrashBuilding.renderPins = {
    [defaultBuildingVariant]: false,
};

MetaTrashBuilding.layerByVariant = {
    [defaultBuildingVariant]: "regular",
};

MetaTrashBuilding.layerPreview = {
    [defaultBuildingVariant]: null,
};

MetaTrashBuilding.avaibleVariants = {
    [defaultBuildingVariant]: enumHubGoalRewards.reward_cutter_and_trash,
};

MetaTrashBuilding.componentVariations = {
    [defaultBuildingVariant]: (entity, rotationVariant) => {
        entity.components.ItemAcceptor.setSlots([{
            pos: new Vector(0, 0),
            directions: [
                enumDirection.top,
                enumDirection.right,
                enumDirection.bottom,
                enumDirection.left,
            ],
        }, ]);

        entity.components.ItemProcessor.inputsPerCharge = 1;

        entity.components.ItemProcessor.type = enumItemProcessorTypes.trash;
    },
};