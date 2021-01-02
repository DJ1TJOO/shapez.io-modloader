import { enumDirection, Vector } from "../../core/vector";
import { enumPinSlotType, WiredPinsComponent } from "../components/wired_pins";
import { Entity } from "../entity";
import { MetaBuilding, defaultBuildingVariant } from "../meta_building";
import { GameRoot } from "../root";
import { enumLogicGateType, LogicGateComponent } from "../components/logic_gate";
import { generateMatrixRotations } from "../../core/utils";
import { enumHubGoalRewards } from "../tutorial_goals";

export class MetaLogicGateBuilding extends MetaBuilding {
    constructor() {
        super("logic_gate");
    }

    /**
     * @param {string} variant
     */
    getSilhouetteColor(variant) {
        let condition = MetaLogicGateBuilding.silhouetteColors[variant];

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
        let reward = MetaLogicGateBuilding.avaibleVariants[defaultBuildingVariant];

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
        let condition = MetaLogicGateBuilding.isRemovable[variant];

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
        let condition = MetaLogicGateBuilding.isRotateable[variant];

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
        const variants = MetaLogicGateBuilding.avaibleVariants;

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
        let reward = MetaLogicGateBuilding.layerByVariant[defaultBuildingVariant];

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
        let condition = MetaLogicGateBuilding.dimensions[variant];

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
        let condition = MetaLogicGateBuilding.layerPreview[variant];

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
        let condition = MetaLogicGateBuilding.overlayMatrices[variant];
        if (condition) {
            condition = condition[rotation];
        }
        return condition ? condition : null;
    }

    /**
     * @param {string} variant
     */
    getRenderPins(variant) {
        let condition = MetaLogicGateBuilding.renderPins[variant];

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
        MetaLogicGateBuilding.componentVariations[variant](entity, rotationVariant);
    }
}

MetaLogicGateBuilding.variants = {
    not: "not",
    xor: "xor",
    or: "or",
};

MetaLogicGateBuilding.overlayMatrices = {
    [defaultBuildingVariant]: generateMatrixRotations([0, 1, 0, 1, 1, 1, 0, 1, 1]),
    [MetaLogicGateBuilding.variants.xor]: generateMatrixRotations([0, 1, 0, 1, 1, 1, 0, 1, 1]),
    [MetaLogicGateBuilding.variants.or]: generateMatrixRotations([0, 1, 0, 1, 1, 1, 0, 1, 1]),
    [MetaLogicGateBuilding.variants.not]: generateMatrixRotations([0, 1, 0, 0, 1, 0, 0, 1, 0]),
};
MetaLogicGateBuilding.dimensions = {
    [defaultBuildingVariant]: new Vector(1, 1),
    [MetaLogicGateBuilding.variants.xor]: new Vector(1, 1),
    [MetaLogicGateBuilding.variants.or]: new Vector(1, 1),
    [MetaLogicGateBuilding.variants.not]: new Vector(1, 1),
};

MetaLogicGateBuilding.silhouetteColors = {
    [defaultBuildingVariant]: "#f48d41",
    [MetaLogicGateBuilding.variants.xor]: "#f4a241",
    [MetaLogicGateBuilding.variants.or]: "#f4d041",
    [MetaLogicGateBuilding.variants.not]: "#f44184",
};

MetaLogicGateBuilding.isRemovable = {
    [defaultBuildingVariant]: true,
    [MetaLogicGateBuilding.variants.xor]: true,
    [MetaLogicGateBuilding.variants.or]: true,
    [MetaLogicGateBuilding.variants.not]: true,
};

MetaLogicGateBuilding.isRotateable = {
    [defaultBuildingVariant]: true,
    [MetaLogicGateBuilding.variants.xor]: true,
    [MetaLogicGateBuilding.variants.or]: true,
    [MetaLogicGateBuilding.variants.not]: true,
};

MetaLogicGateBuilding.avaibleVariants = {
    [defaultBuildingVariant]: enumHubGoalRewards.reward_logic_gates,
    [MetaLogicGateBuilding.variants.xor]: enumHubGoalRewards.reward_logic_gates,
    [MetaLogicGateBuilding.variants.or]: enumHubGoalRewards.reward_logic_gates,
    [MetaLogicGateBuilding.variants.not]: enumHubGoalRewards.reward_logic_gates,
};

MetaLogicGateBuilding.layerByVariant = {
    [defaultBuildingVariant]: "wires",
    [MetaLogicGateBuilding.variants.xor]: "wires",
    [MetaLogicGateBuilding.variants.or]: "wires",
    [MetaLogicGateBuilding.variants.not]: "wires",
};

MetaLogicGateBuilding.renderPins = {
    [defaultBuildingVariant]: false,
    [MetaLogicGateBuilding.variants.xor]: false,
    [MetaLogicGateBuilding.variants.or]: false,
    [MetaLogicGateBuilding.variants.not]: false,
};

MetaLogicGateBuilding.layerPreview = {
    [defaultBuildingVariant]: "wires",
    [MetaLogicGateBuilding.variants.xor]: "wires",
    [MetaLogicGateBuilding.variants.or]: "wires",
    [MetaLogicGateBuilding.variants.not]: "wires",
};

MetaLogicGateBuilding.componentVariations = {
    [defaultBuildingVariant]: (entity, rotationVariant) => {
        entity.components.WiredPins.setSlots([{
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
                direction: enumDirection.right,
                type: enumPinSlotType.logicalAcceptor,
            },
        ]);

        entity.components.LogicGate.type = enumLogicGateType.and;
    },

    [MetaLogicGateBuilding.variants.xor]: (entity, rotationVariant) => {
        entity.components.WiredPins.setSlots([{
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
                direction: enumDirection.right,
                type: enumPinSlotType.logicalAcceptor,
            },
        ]);

        entity.components.LogicGate.type = enumLogicGateType.xor;
    },

    [MetaLogicGateBuilding.variants.or]: (entity, rotationVariant) => {
        entity.components.WiredPins.setSlots([{
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
                direction: enumDirection.right,
                type: enumPinSlotType.logicalAcceptor,
            },
        ]);

        entity.components.LogicGate.type = enumLogicGateType.or;
    },
    [MetaLogicGateBuilding.variants.not]: (entity, rotationVariant) => {
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

        entity.components.LogicGate.type = enumLogicGateType.not;
    },
};