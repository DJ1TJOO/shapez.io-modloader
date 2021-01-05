import { generateMatrixRotations } from "../../core/utils";
import { enumDirection, Vector } from "../../core/vector";
import { enumLogicGateType, LogicGateComponent } from "../components/logic_gate";
import { enumPinSlotType, WiredPinsComponent } from "../components/wired_pins";
import { Entity } from "../entity";
import { defaultBuildingVariant, MetaBuilding } from "../meta_building";
import { GameRoot } from "../root";
import { enumHubGoalRewards } from "../tutorial_goals";

export class MetaAnalyzerBuilding extends MetaBuilding {
    constructor() {
        super("analyzer");
    }

    /**
     * @param {string} variant
     */
    getSilhouetteColor(variant) {
        return MetaAnalyzerBuilding.silhouetteColors[variant]();
    }

    /**
     * @param {GameRoot} root
     */
    getIsUnlocked(root) {
        return this.getAvailableVariants(root).length > 0;
    }

    /**
     * @param {string} variant
     */
    getIsRemovable(variant) {
        return MetaAnalyzerBuilding.isRemovable[variant]();
    }

    /**
     * @param {string} variant
     */
    getIsRotateable(variant) {
        return MetaAnalyzerBuilding.isRotateable[variant]();
    }

    /**
     * @param {GameRoot} root
     */
    getAvailableVariants(root) {
        const variants = MetaAnalyzerBuilding.avaibleVariants;

        let available = [];
        for (const variant in variants) {
            if (variants[variant](root)) available.push(variant);
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
        return MetaAnalyzerBuilding.layerByVariant[variant](root);
    }

    /**
     * @param {string} variant
     */
    getDimensions(variant) {
        return MetaAnalyzerBuilding.dimensions[variant]();
    }

    /**
     * @param {string} variant
     */
    getShowLayerPreview(variant) {
        return MetaAnalyzerBuilding.layerPreview[variant]();
    }

    /**
     * @param {number} rotation
     * @param {number} rotationVariant
     * @param {string} variant
     * @param {Entity} entity
     * @returns {Array<number>|null}
     */
    getSpecialOverlayRenderMatrix(rotation, rotationVariant, variant, entity) {
        return MetaAnalyzerBuilding.overlayMatrices[variant](entity, rotationVariant)[rotation];
    }

    /**
     * @param {string} variant
     */
    getRenderPins(variant) {
        return MetaAnalyzerBuilding.renderPins[variant]();
    }

    /**
     * Creates the entity at the given location
     * @param {Entity} entity
     */
    setupEntityComponents(entity) {
        MetaAnalyzerBuilding.setupEntityComponents.forEach(func => func(entity));
    }

    /**
     * @param {Entity} entity
     * @param {number} rotationVariant
     * @param {string} variant
     */
    updateVariants(entity, rotationVariant, variant) {
        MetaAnalyzerBuilding.componentVariations[variant](entity, rotationVariant);
    }
}

MetaAnalyzerBuilding.setupEntityComponents = [
    entity =>
    entity.addComponent(
        new WiredPinsComponent({
            slots: [{
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
            ],
        })
    ),

    entity =>
    entity.addComponent(
        new LogicGateComponent({
            type: enumLogicGateType.analyzer,
        })
    ),
];

MetaAnalyzerBuilding.silhouetteColors = {
    [defaultBuildingVariant]: () => "#555759",
};

MetaAnalyzerBuilding.avaibleVariants = {
    [defaultBuildingVariant]: root =>
        root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_virtual_processing),
};

MetaAnalyzerBuilding.overlayMatrices = {
    [defaultBuildingVariant]: (entity, rotationVariant) =>
        generateMatrixRotations([1, 1, 0, 1, 1, 1, 0, 1, 0]),
};

MetaAnalyzerBuilding.dimensions = {
    [defaultBuildingVariant]: () => new Vector(1, 1),
};

MetaAnalyzerBuilding.renderPins = {
    [defaultBuildingVariant]: () => false,
};

MetaAnalyzerBuilding.layerByVariant = {
    [defaultBuildingVariant]: root => "wires",
};

MetaAnalyzerBuilding.isRemovable = {
    [defaultBuildingVariant]: () => true,
};

MetaAnalyzerBuilding.isRotateable = {
    [defaultBuildingVariant]: () => true,
};

MetaAnalyzerBuilding.layerPreview = {
    [defaultBuildingVariant]: () => "wires",
};

MetaAnalyzerBuilding.componentVariations = {
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

        entity.components.LogicGate.type = enumLogicGateType.analyzer;
    },
};

//TODO: keep this for later
// import { generateMatrixRotations } from "../../core/utils";
// import { enumDirection, Vector } from "../../core/vector";
// import { enumLogicGateType, LogicGateComponent } from "../components/logic_gate";
// import { enumPinSlotType, WiredPinsComponent } from "../components/wired_pins";
// import { Entity } from "../entity";
// import { defaultBuildingVariant, MetaBuilding } from "../meta_building";
// import { GameRoot } from "../root";
// import { enumHubGoalRewards } from "../tutorial_goals";

// export class MetaAnalyzerBuilding extends MetaBuilding {
//     constructor() {
//         super("analyzer");
//     }

//     /**
//      * @param {string} variant
//      */
//     getSilhouetteColor(variant) {
//         let functions = MetaAnalyzerBuilding.getSilhouetteColor.slice().reverse();
//         let ret = undefined;
//         for (let i = 0; i < functions.length; i++) {
//             const localRet = functions[i](variant, ret);
//             if (typeof localRet !== "undefined") ret = localRet;
//         }
//         return ret;
//     }

//     /**
//      * @param {GameRoot} root
//      */
//     getIsUnlocked(root) {
//         if (this.getAvailableVariants(root).indexOf(defaultBuildingVariant) >= 0) return true;
//         else return false;
//     }

//     /**
//      * @param {string} variant
//      */
//     getIsRemovable(variant) {
//         for (let i = 0; i < MetaAnalyzerBuilding.getIsRemovable.length; i++) {
//             const ret = MetaAnalyzerBuilding.getIsRemovable[i](variant);
//             if (typeof ret !== "undefined") return ret;
//         }
//     }

//     /**
//      * @param {string} variant
//      */
//     getIsRotateable(variant) {
//         for (let i = 0; i < MetaAnalyzerBuilding.getIsRotateable.length; i++) {
//             const ret = MetaAnalyzerBuilding.getIsRotateable[i](variant);
//             if (typeof ret !== "undefined") return ret;
//         }
//     }

//     /**
//      * @param {GameRoot} root
//      */
//     getAvailableVariants(root) {
//         let avaibleVariants = [];
//         for (let i = 0; i < MetaAnalyzerBuilding.avaibleVariants.length; i++) {
//             const ret = MetaAnalyzerBuilding.avaibleVariants[i](root);
//             if (typeof ret !== "undefined") avaibleVariants = [...avaibleVariants, ...ret];
//         }
//         return avaibleVariants;
//     }

//     /**
//      * Returns the edit layer of the building
//      * @param {GameRoot} root
//      * @param {string} variant
//      * @returns {Layer}
//      */
//     getLayer(root, variant) {
//         for (let i = 0; i < MetaAnalyzerBuilding.getLayer.length; i++) {
//             const ret = MetaAnalyzerBuilding.getLayer[i](root, variant);
//             // @ts-ignore
//             if (typeof ret !== "undefined") return ret;
//         }
//     }

//     /**
//      * @param {string} variant
//      */
//     getDimensions(variant) {
//         for (let i = 0; i < MetaAnalyzerBuilding.getDimensions.length; i++) {
//             const ret = MetaAnalyzerBuilding.getDimensions[i](variant);
//             if (typeof ret !== "undefined") return ret;
//         }
//     }

//     /**
//      * @param {string} variant
//      */
//     getShowLayerPreview(variant) {
//         for (let i = 0; i < MetaAnalyzerBuilding.getShowLayerPreview.length; i++) {
//             const ret = MetaAnalyzerBuilding.getShowLayerPreview[i](variant);
//             if (typeof ret !== "undefined") return ret;
//         }
//     }

//     /**
//      * @param {number} rotation
//      * @param {number} rotationVariant
//      * @param {string} variant
//      * @param {Entity} entity
//      * @returns {Array<number>|null}
//      */
//     getSpecialOverlayRenderMatrix(rotation, rotationVariant, variant, entity) {
//         for (let i = 0; i < MetaAnalyzerBuilding.getSpecialOverlayRenderMatrix.length; i++) {
//             const ret = MetaAnalyzerBuilding.getSpecialOverlayRenderMatrix[i](
//                 rotation,
//                 rotationVariant,
//                 variant,
//                 entity
//             );
//             // @ts-ignore
//             if (typeof ret !== "undefined") return ret;
//         }
//     }

//     /**
//      * @param {string} variant
//      */
//     getRenderPins(variant) {
//         for (let i = 0; i < MetaAnalyzerBuilding.getRenderPins.length; i++) {
//             const ret = MetaAnalyzerBuilding.getRenderPins[i](variant);
//             if (typeof ret !== "undefined") return ret;
//         }
//     }

//     /**
//      * Creates the entity at the given location
//      * @param {Entity} entity
//      */
//     setupEntityComponents(entity) {
//         for (let i = 0; i < MetaAnalyzerBuilding.setupEntityComponents.length; i++) {
//             MetaAnalyzerBuilding.setupEntityComponents[i](entity);
//         }
//     }

//     /**
//      * @param {Entity} entity
//      * @param {number} rotationVariant
//      * @param {string} variant
//      */
//     updateVariants(entity, rotationVariant, variant) {
//         for (let i = 0; i < MetaAnalyzerBuilding.updateVariants.length; i++) {
//             MetaAnalyzerBuilding.updateVariants[i](entity, rotationVariant, variant);
//         }
//     }
// }

// MetaAnalyzerBuilding.getSilhouetteColor = [
//     (variant, ret) => {
//         if (variant === defaultBuildingVariant) return "#555759";
//     },
// ];

// MetaAnalyzerBuilding.avaibleVariants = [
//     root => {
//         if (root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_virtual_processing))
//             return [defaultBuildingVariant];
//     },
// ];

// MetaAnalyzerBuilding.getSpecialOverlayRenderMatrix = [
//     (rotation, rotationVariant, variant, entity) => {
//         if (variant === defaultBuildingVariant) return generateMatrixRotations([1, 1, 0, 1, 1, 1, 0, 1, 0]);
//     },
// ];

// MetaAnalyzerBuilding.getDimensions = [
//     variant => {
//         if (variant === defaultBuildingVariant) return new Vector(1, 1);
//     },
// ];

// MetaAnalyzerBuilding.getRenderPins = [
//     variant => {
//         if (variant === defaultBuildingVariant) return false;
//     },
// ];

// MetaAnalyzerBuilding.getLayer = [
//     (root, variant) => {
//         if (variant === defaultBuildingVariant) return "wires";
//     },
// ];

// MetaAnalyzerBuilding.getIsRemovable = [
//     variant => {
//         if (variant === defaultBuildingVariant) return true;
//     },
// ];

// MetaAnalyzerBuilding.getIsRotateable = [
//     variant => {
//         if (variant === defaultBuildingVariant) return true;
//     },
// ];

// MetaAnalyzerBuilding.getShowLayerPreview = [
//     variant => {
//         if (variant === defaultBuildingVariant) return "wires";
//     },
// ];

// MetaAnalyzerBuilding.updateVariants = [
//     (entity, rotationVariant, variant) => {
//         if (variant === defaultBuildingVariant) {
//             entity.components.WiredPins.setSlots([
//                 {
//                     pos: new Vector(0, 0),
//                     direction: enumDirection.left,
//                     type: enumPinSlotType.logicalEjector,
//                 },
//                 {
//                     pos: new Vector(0, 0),
//                     direction: enumDirection.right,
//                     type: enumPinSlotType.logicalEjector,
//                 },
//                 {
//                     pos: new Vector(0, 0),
//                     direction: enumDirection.bottom,
//                     type: enumPinSlotType.logicalAcceptor,
//                 },
//             ]);

//             entity.components.LogicGate.type = enumLogicGateType.analyzer;
//         }
//     },
// ];

// MetaAnalyzerBuilding.setupEntityComponents = [
//     entity => {
//         entity.addComponent(
//             new WiredPinsComponent({
//                 slots: [
//                     {
//                         pos: new Vector(0, 0),
//                         direction: enumDirection.left,
//                         type: enumPinSlotType.logicalEjector,
//                     },
//                     {
//                         pos: new Vector(0, 0),
//                         direction: enumDirection.right,
//                         type: enumPinSlotType.logicalEjector,
//                     },
//                     {
//                         pos: new Vector(0, 0),
//                         direction: enumDirection.bottom,
//                         type: enumPinSlotType.logicalAcceptor,
//                     },
//                 ],
//             })
//         );
//     },
//     entity => {
//         entity.addComponent(
//             new LogicGateComponent({
//                 type: enumLogicGateType.analyzer,
//             })
//         );
//     },
// ];