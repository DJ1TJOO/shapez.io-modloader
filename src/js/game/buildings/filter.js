import { formatItemsPerSecond } from "../../core/utils";
import { enumDirection, Vector } from "../../core/vector";
import { T } from "../../translations";
import { FilterComponent } from "../components/filter";
import { ItemAcceptorComponent } from "../components/item_acceptor";
import { ItemEjectorComponent } from "../components/item_ejector";
import { enumPinSlotType, WiredPinsComponent } from "../components/wired_pins";
import { Entity } from "../entity";
import { defaultBuildingVariant, MetaBuilding } from "../meta_building";
import { GameRoot } from "../root";
import { enumHubGoalRewards } from "../tutorial_goals";

export class MetaFilterBuilding extends MetaBuilding {
    constructor() {
        super("filter");
    }

    /**
     * @param {string} variant
     */
    getSilhouetteColor(variant) {
        let condition = MetaFilterBuilding.silhouetteColors[variant];

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
        let reward = MetaFilterBuilding.avaibleVariants[defaultBuildingVariant];

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
        let condition = MetaFilterBuilding.isRemovable[variant];

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
        let condition = MetaFilterBuilding.isRotateable[variant];

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
        const variants = MetaFilterBuilding.avaibleVariants;

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
        let reward = MetaFilterBuilding.layerByVariant[defaultBuildingVariant];

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
        let condition = MetaFilterBuilding.dimensions[variant];

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
        let condition = MetaFilterBuilding.layerPreview[variant];

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
        if (typeof MetaFilterBuilding.additionalStatistics[variant] === "function") {
            // @ts-ignore
            speed = MetaFilterBuilding.additionalStatistics[variant](root);
        } else {
            // @ts-ignore
            speed = MetaFilterBuilding.additionalStatistics[variant];
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
        let condition = MetaFilterBuilding.overlayMatrices[variant];
        if (condition) {
            condition = condition[rotation];
        }
        return condition ? condition : null;
    }

    /**
     * @param {string} variant
     */
    getRenderPins(variant) {
        let condition = MetaFilterBuilding.renderPins[variant];

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
                    direction: enumDirection.left,
                    type: enumPinSlotType.logicalAcceptor,
                }, ],
            })
        );

        entity.addComponent(
            new ItemAcceptorComponent({
                slots: [{
                    pos: new Vector(0, 0),
                    directions: [enumDirection.bottom],
                }, ],
            })
        );

        entity.addComponent(
            new ItemEjectorComponent({
                slots: [{
                        pos: new Vector(0, 0),
                        direction: enumDirection.top,
                    },
                    {
                        pos: new Vector(1, 0),
                        direction: enumDirection.right,
                    },
                ],
            })
        );

        entity.addComponent(new FilterComponent());
    }

    /**
     * @param {Entity} entity
     * @param {number} rotationVariant
     * @param {string} variant
     */
    updateVariants(entity, rotationVariant, variant) {
        MetaFilterBuilding.componentVariations[variant](entity, rotationVariant);
    }
}

MetaFilterBuilding.overlayMatrices = {
    [defaultBuildingVariant]: null,
};

MetaFilterBuilding.dimensions = {
    [defaultBuildingVariant]: new Vector(2, 1),
};

MetaFilterBuilding.silhouetteColors = {
    [defaultBuildingVariant]: "#c45c2e",
};

MetaFilterBuilding.isRemovable = {
    [defaultBuildingVariant]: true,
};

MetaFilterBuilding.isRotateable = {
    [defaultBuildingVariant]: true,
};

MetaFilterBuilding.avaibleVariants = {
    [defaultBuildingVariant]: enumHubGoalRewards.reward_filter,
};

MetaFilterBuilding.layerByVariant = {
    [defaultBuildingVariant]: "regular",
};

MetaFilterBuilding.layerPreview = {
    [defaultBuildingVariant]: "wires",
};

MetaFilterBuilding.additionalStatistics = {
    [defaultBuildingVariant]: root => root.hubGoals.getBeltBaseSpeed(),
};

MetaFilterBuilding.renderPins = {
    [defaultBuildingVariant]: true,
};

MetaFilterBuilding.componentVariations = {
    [defaultBuildingVariant]: (entity, rotationVariant) => {
        entity.components.WiredPins.setSlots([{
            pos: new Vector(0, 0),
            direction: enumDirection.bottom,
            type: enumPinSlotType.logicalAcceptor,
        }, ]);

        entity.components.ItemAcceptor.setSlots([{
            pos: new Vector(0, 0),
            directions: [enumDirection.bottom],
        }, ]);

        entity.components.ItemEjector.setSlots([{
                pos: new Vector(0, 0),
                direction: enumDirection.top,
            },
            {
                pos: new Vector(1, 0),
                direction: enumDirection.right,
            },
        ]);
    },
};