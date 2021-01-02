import { formatBigNumber } from "../../core/utils";
import { enumDirection, Vector } from "../../core/vector";
import { T } from "../../translations";
import { ItemAcceptorComponent } from "../components/item_acceptor";
import { ItemEjectorComponent } from "../components/item_ejector";
import { StorageComponent } from "../components/storage";
import { enumPinSlotType, WiredPinsComponent } from "../components/wired_pins";
import { Entity } from "../entity";
import { defaultBuildingVariant, MetaBuilding } from "../meta_building";
import { GameRoot } from "../root";
import { enumHubGoalRewards } from "../tutorial_goals";

const storageSize = 5000;

export class MetaStorageBuilding extends MetaBuilding {
    constructor() {
        super("storage");
    }

    /**
     * @param {string} variant
     */
    getSilhouetteColor(variant) {
        let condition = MetaStorageBuilding.silhouetteColors[variant];

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
        let reward = MetaStorageBuilding.avaibleVariants[defaultBuildingVariant];

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
        let condition = MetaStorageBuilding.isRemovable[variant];

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
        let condition = MetaStorageBuilding.isRotateable[variant];

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
        const variants = MetaStorageBuilding.avaibleVariants;

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
        let reward = MetaStorageBuilding.layerByVariant[defaultBuildingVariant];

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
        let condition = MetaStorageBuilding.dimensions[variant];

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
        let condition = MetaStorageBuilding.layerPreview[variant];

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
        return MetaStorageBuilding.additionalStatistics[variant](root);
    }

    /**
     * @param {number} rotation
     * @param {number} rotationVariant
     * @param {string} variant
     * @param {Entity} entity
     * @returns {Array<number>|null}
     */
    getSpecialOverlayRenderMatrix(rotation, rotationVariant, variant, entity) {
        let condition = MetaStorageBuilding.overlayMatrices[variant];
        if (condition) {
            condition = condition[rotation];
        }
        return condition ? condition : null;
    }

    /**
     * @param {string} variant
     */
    getRenderPins(variant) {
        let condition = MetaStorageBuilding.renderPins[variant];

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
        // Required, since the item processor needs this.
        entity.addComponent(
            new ItemEjectorComponent({
                slots: [{
                        pos: new Vector(0, 0),
                        direction: enumDirection.top,
                    },
                    {
                        pos: new Vector(1, 0),
                        direction: enumDirection.top,
                    },
                ],
            })
        );

        entity.addComponent(
            new ItemAcceptorComponent({
                slots: [{
                        pos: new Vector(0, 1),
                        directions: [enumDirection.bottom],
                    },
                    {
                        pos: new Vector(1, 1),
                        directions: [enumDirection.bottom],
                    },
                ],
            })
        );

        entity.addComponent(
            new StorageComponent({
                maximumStorage: storageSize,
            })
        );

        entity.addComponent(
            new WiredPinsComponent({
                slots: [{
                        pos: new Vector(1, 1),
                        direction: enumDirection.right,
                        type: enumPinSlotType.logicalEjector,
                    },
                    {
                        pos: new Vector(0, 1),
                        direction: enumDirection.left,
                        type: enumPinSlotType.logicalEjector,
                    },
                ],
            })
        );
    }

    /**
     * @param {Entity} entity
     * @param {number} rotationVariant
     * @param {string} variant
     */
    updateVariants(entity, rotationVariant, variant) {
        MetaStorageBuilding.componentVariations[variant](entity, rotationVariant);
    }
}

MetaStorageBuilding.dimensions = {
    [defaultBuildingVariant]: new Vector(2, 2),
};

MetaStorageBuilding.silhouetteColors = {
    [defaultBuildingVariant]: "#bbdf6d",
};

MetaStorageBuilding.isRemovable = {
    [defaultBuildingVariant]: true,
};

MetaStorageBuilding.isRotateable = {
    [defaultBuildingVariant]: true,
};

MetaStorageBuilding.additionalStatistics = {
    [defaultBuildingVariant]: root => [
        [T.ingame.buildingPlacement.infoTexts.storage, formatBigNumber(storageSize)],
    ],
};

MetaStorageBuilding.overlayMatrices = {
    [defaultBuildingVariant]: null,
};

MetaStorageBuilding.avaibleVariants = {
    [defaultBuildingVariant]: enumHubGoalRewards.reward_storage,
};

MetaStorageBuilding.layerByVariant = {
    [defaultBuildingVariant]: "regular",
};

MetaStorageBuilding.layerPreview = {
    [defaultBuildingVariant]: "wires",
};

MetaStorageBuilding.renderPins = {
    [defaultBuildingVariant]: true,
};

MetaStorageBuilding.componentVariations = {
    [defaultBuildingVariant]: (entity, rotationVariant) => {
        entity.components.ItemEjector.setSlots([{
                pos: new Vector(0, 0),
                direction: enumDirection.top,
            },
            {
                pos: new Vector(1, 0),
                direction: enumDirection.top,
            },
        ]);
        entity.components.ItemAcceptor.setSlots([{
                pos: new Vector(0, 1),
                directions: [enumDirection.bottom],
            },
            {
                pos: new Vector(1, 1),
                directions: [enumDirection.bottom],
            },
        ]);
        entity.components.Storage.maximumStorage = storageSize;
        entity.components.WiredPins.setSlots([{
                pos: new Vector(1, 1),
                direction: enumDirection.right,
                type: enumPinSlotType.logicalEjector,
            },
            {
                pos: new Vector(0, 1),
                direction: enumDirection.left,
                type: enumPinSlotType.logicalEjector,
            },
        ]);
    },
};