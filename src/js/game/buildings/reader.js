import { enumDirection, Vector } from "../../core/vector";
import { ItemAcceptorComponent } from "../components/item_acceptor";
import { ItemEjectorComponent } from "../components/item_ejector";
import { enumItemProcessorTypes, ItemProcessorComponent } from "../components/item_processor";
import { enumPinSlotType, WiredPinsComponent } from "../components/wired_pins";
import { Entity } from "../entity";
import { defaultBuildingVariant, MetaBuilding } from "../meta_building";
import { GameRoot } from "../root";
import { BeltUnderlaysComponent } from "../components/belt_underlays";
import { BeltReaderComponent } from "../components/belt_reader";
import { enumHubGoalRewards } from "../tutorial_goals";
import { generateMatrixRotations, formatItemsPerSecond } from "../../core/utils";
import { T } from "../../translations";

export class MetaReaderBuilding extends MetaBuilding {
    constructor() {
        super("reader");
    }

    /**
     * @param {string} variant
     */
    getSilhouetteColor(variant) {
        let condition = MetaReaderBuilding.silhouetteColors[variant];

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
        let reward = MetaReaderBuilding.avaibleVariants[defaultBuildingVariant];

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
        let condition = MetaReaderBuilding.isRemovable[variant];

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
        let condition = MetaReaderBuilding.isRotateable[variant];

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
        const variants = MetaReaderBuilding.avaibleVariants;

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
        let reward = MetaReaderBuilding.layerByVariant[defaultBuildingVariant];

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
        let condition = MetaReaderBuilding.dimensions[variant];

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
        let condition = MetaReaderBuilding.layerPreview[variant];

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
        if (typeof MetaReaderBuilding.additionalStatistics[variant] === "function") {
            // @ts-ignore
            speed = MetaReaderBuilding.additionalStatistics[variant](root);
        } else {
            // @ts-ignore
            speed = MetaReaderBuilding.additionalStatistics[variant];
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
        let condition = MetaReaderBuilding.overlayMatrices[variant];
        if (condition) {
            condition = condition[rotation];
        }
        return condition ? condition : null;
    }

    /**
     * @param {string} variant
     */
    getRenderPins(variant) {
        let condition = MetaReaderBuilding.renderPins[variant];

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
                        direction: enumDirection.right,
                        type: enumPinSlotType.logicalEjector,
                    },
                    {
                        pos: new Vector(0, 0),
                        direction: enumDirection.left,
                        type: enumPinSlotType.logicalEjector,
                    },
                ],
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
                }, ],
            })
        );

        entity.addComponent(
            new ItemProcessorComponent({
                processorType: enumItemProcessorTypes.reader,
                inputsPerCharge: 1,
            })
        );

        entity.addComponent(
            new BeltUnderlaysComponent({
                underlays: [{
                    pos: new Vector(0, 0),
                    direction: enumDirection.top,
                }, ],
            })
        );

        entity.addComponent(new BeltReaderComponent());
    }

    /**
     * @param {Entity} entity
     * @param {number} rotationVariant
     * @param {string} variant
     */
    updateVariants(entity, rotationVariant, variant) {
        MetaReaderBuilding.componentVariations[variant](entity, rotationVariant);
    }
}

MetaReaderBuilding.dimensions = {
    [defaultBuildingVariant]: new Vector(1, 1),
};

MetaReaderBuilding.silhouetteColors = {
    [defaultBuildingVariant]: "#25fff2",
};

MetaReaderBuilding.isRemovable = {
    [defaultBuildingVariant]: true,
};

MetaReaderBuilding.isRotateable = {
    [defaultBuildingVariant]: true,
};

MetaReaderBuilding.additionalStatistics = {
    [defaultBuildingVariant]: root => root.hubGoals.getBeltBaseSpeed(),
};

MetaReaderBuilding.overlayMatrices = {
    [defaultBuildingVariant]: generateMatrixRotations([0, 1, 0, 0, 1, 0, 0, 1, 0]),
};

MetaReaderBuilding.avaibleVariants = {
    [defaultBuildingVariant]: enumHubGoalRewards.reward_belt_reader,
};

MetaReaderBuilding.layerByVariant = {
    [defaultBuildingVariant]: "regular",
};

MetaReaderBuilding.layerPreview = {
    [defaultBuildingVariant]: "wires",
};

MetaReaderBuilding.renderPins = {
    [defaultBuildingVariant]: true,
};

MetaReaderBuilding.componentVariations = {
    [defaultBuildingVariant]: (entity, rotationVariant) => {
        entity.components.ItemAcceptor.setSlots([{
            pos: new Vector(0, 0),
            directions: [enumDirection.bottom],
        }, ]);

        entity.components.ItemEjector.setSlots([{
            pos: new Vector(0, 0),
            direction: enumDirection.top,
        }, ]);

        entity.components.ItemProcessor.inputsPerCharge = 1;

        entity.components.ItemProcessor.type = enumItemProcessorTypes.reader;

        entity.components.BeltUnderlays.underlays = [{
            pos: new Vector(0, 0),
            direction: enumDirection.top,
        }, ];
    },
};