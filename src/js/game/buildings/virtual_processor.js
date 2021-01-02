import { Vector, enumDirection } from "../../core/vector";
import { LogicGateComponent, enumLogicGateType } from "../components/logic_gate";
import { WiredPinsComponent, enumPinSlotType } from "../components/wired_pins";
import { Entity } from "../entity";
import { defaultBuildingVariant, MetaBuilding } from "../meta_building";
import { GameRoot } from "../root";
import { enumHubGoalRewards } from "../tutorial_goals";
import { MetaCutterBuilding } from "./cutter";
import { MetaPainterBuilding } from "./painter";
import { MetaRotaterBuilding } from "./rotater";
import { MetaStackerBuilding } from "./stacker";

export class MetaVirtualProcessorBuilding extends MetaBuilding {
    constructor() {
        super("virtual_processor");
    }

    /**
     * @param {string} variant
     */
    getSilhouetteColor(variant) {
        let condition = MetaVirtualProcessorBuilding.silhouetteColors[variant];

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
        let reward = MetaVirtualProcessorBuilding.avaibleVariants[defaultBuildingVariant];

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
        let condition = MetaVirtualProcessorBuilding.isRemovable[variant];

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
        let condition = MetaVirtualProcessorBuilding.isRotateable[variant];

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
        const variants = MetaVirtualProcessorBuilding.avaibleVariants;

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
        let reward = MetaVirtualProcessorBuilding.layerByVariant[defaultBuildingVariant];

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
        let condition = MetaVirtualProcessorBuilding.dimensions[variant];

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
        let condition = MetaVirtualProcessorBuilding.layerPreview[variant];

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
        if (MetaVirtualProcessorBuilding.overlayMatrices[variant]) {
            condition = MetaVirtualProcessorBuilding.overlayMatrices[variant][rotation];
        }
        return condition ? condition : null;
    }

    /**
     * @param {string} variant
     */
    getRenderPins(variant) {
        let condition = MetaVirtualProcessorBuilding.renderPins[variant];

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
                slots: [],
            })
        );

        entity.addComponent(new LogicGateComponent({}));
    }

    /**
     * @param {Entity} entity
     * @param {number} rotationVariant
     * @param {string} variant
     */
    updateVariants(entity, rotationVariant, variant) {
        MetaVirtualProcessorBuilding.componentVariations[variant](entity, rotationVariant);
    }
}

MetaVirtualProcessorBuilding.variants = {
    rotater: "rotater",
    unstacker: "unstacker",
    stacker: "stacker",
    painter: "painter",
};

MetaVirtualProcessorBuilding.overlayMatrices = {
    [defaultBuildingVariant]: null,
    [MetaVirtualProcessorBuilding.variants.rotater]: null,
    [MetaVirtualProcessorBuilding.variants.unstacker]: null,
    [MetaVirtualProcessorBuilding.variants.stacker]: null,
    [MetaVirtualProcessorBuilding.variants.painter]: null,
};

MetaVirtualProcessorBuilding.avaibleVariants = {
    [defaultBuildingVariant]: enumHubGoalRewards.reward_virtual_processing,
    [MetaVirtualProcessorBuilding.variants.rotater]: enumHubGoalRewards.reward_virtual_processing,
    [MetaVirtualProcessorBuilding.variants.unstacker]: enumHubGoalRewards.reward_virtual_processing,
    [MetaVirtualProcessorBuilding.variants.stacker]: enumHubGoalRewards.reward_virtual_processing,
    [MetaVirtualProcessorBuilding.variants.painter]: enumHubGoalRewards.reward_virtual_processing,
};

MetaVirtualProcessorBuilding.dimensions = {
    [defaultBuildingVariant]: new Vector(2, 1),
    [MetaVirtualProcessorBuilding.variants.rotater]: new Vector(1, 1),
    [MetaVirtualProcessorBuilding.variants.unstacker]: new Vector(1, 1),
    [MetaVirtualProcessorBuilding.variants.stacker]: new Vector(1, 1),
    [MetaVirtualProcessorBuilding.variants.painter]: new Vector(1, 1),
};

MetaVirtualProcessorBuilding.isRemovable = {
    [defaultBuildingVariant]: true,
    [MetaVirtualProcessorBuilding.variants.rotater]: true,
    [MetaVirtualProcessorBuilding.variants.unstacker]: true,
    [MetaVirtualProcessorBuilding.variants.stacker]: true,
    [MetaVirtualProcessorBuilding.variants.painter]: true,
};

MetaVirtualProcessorBuilding.isRotateable = {
    [defaultBuildingVariant]: true,
    [MetaVirtualProcessorBuilding.variants.rotater]: true,
    [MetaVirtualProcessorBuilding.variants.unstacker]: true,
    [MetaVirtualProcessorBuilding.variants.stacker]: true,
    [MetaVirtualProcessorBuilding.variants.painter]: true,
};

MetaVirtualProcessorBuilding.renderPins = {
    [defaultBuildingVariant]: false,
    [MetaVirtualProcessorBuilding.variants.rotater]: false,
    [MetaVirtualProcessorBuilding.variants.unstacker]: false,
    [MetaVirtualProcessorBuilding.variants.stacker]: false,
    [MetaVirtualProcessorBuilding.variants.painter]: false,
};

MetaVirtualProcessorBuilding.layerPreview = {
    [defaultBuildingVariant]: "wires",
    [MetaVirtualProcessorBuilding.variants.rotater]: "wires",
    [MetaVirtualProcessorBuilding.variants.unstacker]: "wires",
    [MetaVirtualProcessorBuilding.variants.stacker]: "wires",
    [MetaVirtualProcessorBuilding.variants.painter]: "wires",
};

MetaVirtualProcessorBuilding.layerByVariant = {
    [defaultBuildingVariant]: "wires",
    [MetaVirtualProcessorBuilding.variants.rotater]: "wires",
    [MetaVirtualProcessorBuilding.variants.unstacker]: "wires",
    [MetaVirtualProcessorBuilding.variants.stacker]: "wires",
    [MetaVirtualProcessorBuilding.variants.painter]: "wires",
};

MetaVirtualProcessorBuilding.silhouetteColors = {
    [defaultBuildingVariant]: new MetaCutterBuilding().getSilhouetteColor(defaultBuildingVariant),
    [MetaVirtualProcessorBuilding.variants.rotater]: new MetaRotaterBuilding().getSilhouetteColor(
        MetaVirtualProcessorBuilding.variants.rotater
    ),
    [MetaVirtualProcessorBuilding.variants.unstacker]: new MetaStackerBuilding().getSilhouetteColor(
        MetaVirtualProcessorBuilding.variants.unstacker
    ),
    [MetaVirtualProcessorBuilding.variants.stacker]: new MetaStackerBuilding().getSilhouetteColor(
        MetaVirtualProcessorBuilding.variants.stacker
    ),
    [MetaVirtualProcessorBuilding.variants.painter]: new MetaPainterBuilding().getSilhouetteColor(
        MetaVirtualProcessorBuilding.variants.painter
    ),
};

MetaVirtualProcessorBuilding.componentVariations = {
    [defaultBuildingVariant]: (entity, rotationVariant) => {
        entity.components.WiredPins.setSlots([{
                pos: new Vector(0, 0),
                direction: enumDirection.left,
                type: enumPinSlotType.logicalEjector,
            },
            {
                pos: new Vector(0, 0),
                direction: enumDirection.right,
                type: enumPinSlotType.logicalEjector,
            },
            {
                pos: new Vector(0, 0),
                direction: enumDirection.bottom,
                type: enumPinSlotType.logicalAcceptor,
            },
        ]);
    },

    [MetaVirtualProcessorBuilding.variants.rotater]: (entity, rotationVariant) => {
        entity.components.WiredPins.setSlots([{
                pos: new Vector(0, 0),
                direction: enumDirection.top,
                type: enumPinSlotType.logicalEjector,
            },
            {
                pos: new Vector(0, 0),
                direction: enumDirection.bottom,
                type: enumPinSlotType.logicalAcceptor,
            },
        ]);
    },

    [MetaVirtualProcessorBuilding.variants.unstacker]: (entity, rotationVariant) => {
        entity.components.WiredPins.setSlots([{
                pos: new Vector(0, 0),
                direction: enumDirection.left,
                type: enumPinSlotType.logicalEjector,
            },
            {
                pos: new Vector(0, 0),
                direction: enumDirection.right,
                type: enumPinSlotType.logicalEjector,
            },
            {
                pos: new Vector(0, 0),
                direction: enumDirection.bottom,
                type: enumPinSlotType.logicalAcceptor,
            },
        ]);
    },

    [MetaVirtualProcessorBuilding.variants.stacker]: (entity, rotationVariant) => {
        entity.components.WiredPins.setSlots([{
                pos: new Vector(0, 0),
                direction: enumDirection.top,
                type: enumPinSlotType.logicalEjector,
            },
            {
                pos: new Vector(0, 0),
                direction: enumDirection.bottom,
                type: enumPinSlotType.logicalAcceptor,
            },
            {
                pos: new Vector(0, 0),
                direction: enumDirection.right,
                type: enumPinSlotType.logicalAcceptor,
            },
        ]);
    },

    [MetaVirtualProcessorBuilding.variants.painter]: (entity, rotationVariant) => {
        entity.components.WiredPins.setSlots([{
                pos: new Vector(0, 0),
                direction: enumDirection.top,
                type: enumPinSlotType.logicalEjector,
            },
            {
                pos: new Vector(0, 0),
                direction: enumDirection.bottom,
                type: enumPinSlotType.logicalAcceptor,
            },
            {
                pos: new Vector(0, 0),
                direction: enumDirection.right,
                type: enumPinSlotType.logicalAcceptor,
            },
        ]);
    },
};