import { enumDirection, Vector } from "../../core/vector";
import { HubComponent } from "../components/hub";
import { ItemAcceptorComponent } from "../components/item_acceptor";
import { enumItemProcessorTypes, ItemProcessorComponent } from "../components/item_processor";
import { Entity } from "../entity";
import { defaultBuildingVariant, MetaBuilding } from "../meta_building";
import { WiredPinsComponent, enumPinSlotType } from "../components/wired_pins";
import { GameRoot } from "../root";
import { formatItemsPerSecond } from "../../core/utils";
import { T } from "../../translations";

export class MetaHubBuilding extends MetaBuilding {
    constructor() {
        super("hub");
    }

    /**
     * @param {string} variant
     */
    getSilhouetteColor(variant) {
        let condition = MetaHubBuilding.silhouetteColors[variant];

        if (typeof condition === "function") {
            // @ts-ignore
            condition = condition();
        }

        // @ts-ignore
        return typeof condition === "string" ? condition : "#ffffff";
    }

    /**
     * @param {string} variant
     */
    getDimensions(variant) {
        let condition = MetaHubBuilding.dimensions[variant];

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
    getIsRotateable(variant) {
        let condition = MetaHubBuilding.isRotateable[variant];

        if (typeof condition === "function") {
            // @ts-ignore
            condition = condition();
        }

        // @ts-ignore
        return typeof condition === "boolean" ? condition : true;
    }

    getBlueprintSprite() {
        return null;
    }

    getSprite() {
        return null;
    }

    /**
     * @param {string} variant
     */
    getIsRemovable(variant) {
        let condition = MetaHubBuilding.isRemovable[variant];

        if (typeof condition === "function") {
            // @ts-ignore
            condition = condition();
        }

        // @ts-ignore
        return typeof condition === "boolean" ? condition : true;
    }

    /**
     * Returns the edit layer of the building
     * @param {GameRoot} root
     * @param {string} variant
     * @returns {Layer}
     */
    getLayer(root, variant) {
        let reward = MetaHubBuilding.layerByVariant[defaultBuildingVariant];

        if (typeof reward === "function") {
            // @ts-ignore
            reward = reward();
        }

        // @ts-ignore
        return typeof reward === "string" ? reward : "regular";
    }

    /**
     * @param {GameRoot} root
     */
    getIsUnlocked(root) {
        let reward = MetaHubBuilding.avaibleVariants[defaultBuildingVariant];

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
        const variants = MetaHubBuilding.avaibleVariants;

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
     * @param {string} variant
     */
    getShowLayerPreview(variant) {
        let condition = MetaHubBuilding.layerPreview[variant];

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
        let condition = MetaHubBuilding.overlayMatrices[variant][rotation];
        return condition ? condition : null;
    }

    /**
     * Creates the entity at the given location
     * @param {Entity} entity
     */
    setupEntityComponents(entity) {
        entity.addComponent(new HubComponent());
        entity.addComponent(
            new ItemProcessorComponent({
                inputsPerCharge: 1,
                processorType: enumItemProcessorTypes.hub,
            })
        );

        entity.addComponent(
            new WiredPinsComponent({
                slots: [{
                    pos: new Vector(0, 2),
                    type: enumPinSlotType.logicalEjector,
                    direction: enumDirection.left,
                }, ],
            })
        );

        entity.addComponent(
            new ItemAcceptorComponent({
                slots: [{
                        pos: new Vector(0, 0),
                        directions: [enumDirection.top, enumDirection.left],
                        filter: "shape",
                    },
                    {
                        pos: new Vector(1, 0),
                        directions: [enumDirection.top],
                        filter: "shape",
                    },
                    {
                        pos: new Vector(2, 0),
                        directions: [enumDirection.top],
                        filter: "shape",
                    },
                    {
                        pos: new Vector(3, 0),
                        directions: [enumDirection.top, enumDirection.right],
                        filter: "shape",
                    },
                    {
                        pos: new Vector(0, 3),
                        directions: [enumDirection.bottom, enumDirection.left],
                        filter: "shape",
                    },
                    {
                        pos: new Vector(1, 3),
                        directions: [enumDirection.bottom],
                        filter: "shape",
                    },
                    {
                        pos: new Vector(2, 3),
                        directions: [enumDirection.bottom],
                        filter: "shape",
                    },
                    {
                        pos: new Vector(3, 3),
                        directions: [enumDirection.bottom, enumDirection.right],
                        filter: "shape",
                    },
                    {
                        pos: new Vector(0, 1),
                        directions: [enumDirection.left],
                        filter: "shape",
                    },
                    {
                        pos: new Vector(0, 2),
                        directions: [enumDirection.left],
                        filter: "shape",
                    },
                    {
                        pos: new Vector(0, 3),
                        directions: [enumDirection.left],
                        filter: "shape",
                    },
                    {
                        pos: new Vector(3, 1),
                        directions: [enumDirection.right],
                        filter: "shape",
                    },
                    {
                        pos: new Vector(3, 2),
                        directions: [enumDirection.right],
                        filter: "shape",
                    },
                    {
                        pos: new Vector(3, 3),
                        directions: [enumDirection.right],
                        filter: "shape",
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
        MetaHubBuilding.componentVariations[variant](entity, rotationVariant);
    }
}

MetaHubBuilding.silhouetteColors = {
    [defaultBuildingVariant]: "#eb5555",
};

MetaHubBuilding.dimensions = {
    [defaultBuildingVariant]: new Vector(4, 4),
};

MetaHubBuilding.isRemovable = {
    [defaultBuildingVariant]: false,
};

MetaHubBuilding.isRotateable = {
    [defaultBuildingVariant]: false,
};

MetaHubBuilding.overlayMatrices = {
    [defaultBuildingVariant]: null,
};

MetaHubBuilding.avaibleVariants = {
    [defaultBuildingVariant]: false,
};

MetaHubBuilding.layerByVariant = {
    [defaultBuildingVariant]: "regular",
};

MetaHubBuilding.layerPreview = {
    [defaultBuildingVariant]: false,
};

MetaHubBuilding.componentVariations = {
    [defaultBuildingVariant]: (entity, rotationVariant) => {
        entity.components.ItemProcessor.inputsPerCharge = 1;

        entity.components.ItemProcessor.type = enumItemProcessorTypes.hub;

        entity.components.WiredPins.setSlots([{
            pos: new Vector(0, 2),
            type: enumPinSlotType.logicalEjector,
            direction: enumDirection.left,
        }, ]);

        entity.components.ItemAcceptor.setSlots([{
                pos: new Vector(0, 0),
                directions: [enumDirection.top, enumDirection.left],
                filter: "shape",
            },
            {
                pos: new Vector(1, 0),
                directions: [enumDirection.top],
                filter: "shape",
            },
            {
                pos: new Vector(2, 0),
                directions: [enumDirection.top],
                filter: "shape",
            },
            {
                pos: new Vector(3, 0),
                directions: [enumDirection.top, enumDirection.right],
                filter: "shape",
            },
            {
                pos: new Vector(0, 3),
                directions: [enumDirection.bottom, enumDirection.left],
                filter: "shape",
            },
            {
                pos: new Vector(1, 3),
                directions: [enumDirection.bottom],
                filter: "shape",
            },
            {
                pos: new Vector(2, 3),
                directions: [enumDirection.bottom],
                filter: "shape",
            },
            {
                pos: new Vector(3, 3),
                directions: [enumDirection.bottom, enumDirection.right],
                filter: "shape",
            },
            {
                pos: new Vector(0, 1),
                directions: [enumDirection.left],
                filter: "shape",
            },
            {
                pos: new Vector(0, 2),
                directions: [enumDirection.left],
                filter: "shape",
            },
            {
                pos: new Vector(0, 3),
                directions: [enumDirection.left],
                filter: "shape",
            },
            {
                pos: new Vector(3, 1),
                directions: [enumDirection.right],
                filter: "shape",
            },
            {
                pos: new Vector(3, 2),
                directions: [enumDirection.right],
                filter: "shape",
            },
            {
                pos: new Vector(3, 3),
                directions: [enumDirection.right],
                filter: "shape",
            },
        ]);
    },
};