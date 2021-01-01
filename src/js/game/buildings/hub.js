import { enumDirection, Vector } from "../../core/vector";
import { HubComponent } from "../components/hub";
import { ItemAcceptorComponent } from "../components/item_acceptor";
import { enumItemProcessorTypes, ItemProcessorComponent } from "../components/item_processor";
import { Entity } from "../entity";
import { defaultBuildingVariant, MetaBuilding } from "../meta_building";
import { WiredPinsComponent, enumPinSlotType } from "../components/wired_pins";

export class MetaHubBuilding extends MetaBuilding {
    constructor() {
        super("hub");
    }

    getDimensions(variant) {
        return new Vector(4, 4);
    }

    /**
     * @param {string} variant
     */
    getSilhouetteColor(variant) {
        const condition = MetaHubBuilding.silhouetteColors[variant];

        if (typeof condition === "function") {
            return condition(variant);
        } else if (typeof condition === "string") {
            return condition;
        } else {
            return "#ffffff";
        }
    }

    getIsRotateable(variant) {
        // TODO: add variant check
        return false;
    }

    getBlueprintSprite(variant) {
        // TODO: add variant check
        return null;
    }

    getSprite(variant) {
        // TODO: add variant check
        // We render it ourself
        return null;
    }

    getIsRemovable(variant) {
        const condition = MetaHubBuilding.isRemovable[variant];

        if (typeof condition === "function") {
            return condition(variant);
        } else if (typeof condition === "boolean") {
            return condition;
        } else {
            return true;
        }
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