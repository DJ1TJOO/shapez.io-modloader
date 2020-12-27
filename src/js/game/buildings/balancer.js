import { enumDirection, Vector } from "../../core/vector";
import { ItemAcceptorComponent } from "../components/item_acceptor";
import { ItemEjectorComponent } from "../components/item_ejector";
import { enumItemProcessorTypes, ItemProcessorComponent } from "../components/item_processor";
import { Entity } from "../entity";
import { MetaBuilding, defaultBuildingVariant } from "../meta_building";
import { GameRoot } from "../root";
import { enumHubGoalRewards } from "../tutorial_goals";
import { T } from "../../translations";
import { formatItemsPerSecond, generateMatrixRotations } from "../../core/utils";
import { BeltUnderlaysComponent } from "../components/belt_underlays";

export class MetaBalancerBuilding extends MetaBuilding {
    constructor() {
        super("balancer");
    }

    /**
     * @param {String} variant
     */
    getDimensions(variant) {
        return MetaBalancerBuilding.dimensions[variant];
    }

    /**
     * @param {number} rotation
     * @param {number} rotationVariant
     * @param {string} variant
     * @param {Entity} entity
     * @returns {Array<number>|null}
     */
    getSpecialOverlayRenderMatrix(rotation, rotationVariant, variant, entity) {
        const matrix = MetaBalancerBuilding.overlayMatrices[variant];
        if (matrix) {
            return matrix[rotation];
        }
        return null;
    }

    /**
     * @param {GameRoot} root
     * @param {string} variant
     * @returns {Array<[string, string]>}
     */
    getAdditionalStatistics(root, variant) {
        const speedMultiplier = MetaBalancerBuilding.additionalStatistics[variant];

        const speed =
            (root.hubGoals.getProcessorBaseSpeed(enumItemProcessorTypes.balancer) / 2) * speedMultiplier;
        return [
            [T.ingame.buildingPlacement.infoTexts.speed, formatItemsPerSecond(speed)]
        ];
    }

    getSilhouetteColor() {
        return MetaBalancerBuilding.silhouetteColor;
    }

    /**
     * @param {GameRoot} root
     */
    getAvailableVariants(root) {
        const variants = MetaBalancerBuilding.avaibleVariants;

        let available = [];
        for (const variant in variants) {
            const reward = variants[variant];
            if (typeof reward === "function") {
                // @ts-ignore
                if (reward() !== true && !root.hubGoals.isRewardUnlocked(reward())) continue;
                available.push(variant);
            } else {
                // @ts-ignore
                if (reward !== true && !root.hubGoals.isRewardUnlocked(reward)) continue;
                available.push(variant);
            }
        }

        return available;
    }

    /**
     * @param {GameRoot} root
     */
    getIsUnlocked(root) {
        return root.hubGoals.isRewardUnlocked(MetaBalancerBuilding.avaibleVariants[defaultBuildingVariant]);
    }

    /**
     * Creates the entity at the given location
     * @param {Entity} entity
     */
    setupEntityComponents(entity) {
        entity.addComponent(
            new ItemAcceptorComponent({
                slots: [], // set later
            })
        );

        entity.addComponent(
            new ItemProcessorComponent({
                inputsPerCharge: 1,
                processorType: enumItemProcessorTypes.balancer,
            })
        );

        entity.addComponent(
            new ItemEjectorComponent({
                slots: [], // set later
                renderFloatingItems: false,
            })
        );

        entity.addComponent(new BeltUnderlaysComponent({ underlays: [] }));
    }

    /**
     *
     * @param {Entity} entity
     * @param {number} rotationVariant
     * @param {string} variant
     */
    updateVariants(entity, rotationVariant, variant) {
        const componentVariations = MetaBalancerBuilding.componentVariations[variant];
        for (const componentVariation in componentVariations) {
            const comp = componentVariation.split("_")[0];
            const func = componentVariation.split("_")[1];

            if (!func) {
                console.log(componentVariations);
                continue;
            }

            if (typeof entity.components[comp][func] == "function") {
                entity.components[comp][func](componentVariations[componentVariation]);
            } else {
                entity.components[comp][func] = componentVariations[componentVariation];
            }
        }
    }
}

MetaBalancerBuilding.variants = {
    merger: "merger",
    mergerInverse: "merger-inverse",
    splitter: "splitter",
    splitterInverse: "splitter-inverse",
};

MetaBalancerBuilding.overlayMatrices = {
    [defaultBuildingVariant]: null,
    [MetaBalancerBuilding.variants.merger]: generateMatrixRotations([0, 1, 0, 0, 1, 1, 0, 1, 0]),
    [MetaBalancerBuilding.variants.mergerInverse]: generateMatrixRotations([0, 1, 0, 1, 1, 0, 0, 1, 0]),
    [MetaBalancerBuilding.variants.splitter]: generateMatrixRotations([0, 1, 0, 0, 1, 1, 0, 1, 0]),
    [MetaBalancerBuilding.variants.splitterInverse]: generateMatrixRotations([0, 1, 0, 1, 1, 0, 0, 1, 0]),
};

MetaBalancerBuilding.avaibleVariants = {
    [defaultBuildingVariant]: enumHubGoalRewards.reward_balancer,
    [MetaBalancerBuilding.variants.merger]: enumHubGoalRewards.reward_merger,
    [MetaBalancerBuilding.variants.mergerInverse]: enumHubGoalRewards.reward_merger,
    [MetaBalancerBuilding.variants.splitter]: enumHubGoalRewards.reward_splitter,
    [MetaBalancerBuilding.variants.splitterInverse]: enumHubGoalRewards.reward_splitter,
};

MetaBalancerBuilding.dimensions = {
    [defaultBuildingVariant]: new Vector(2, 1),
    [MetaBalancerBuilding.variants.merger]: new Vector(1, 1),
    [MetaBalancerBuilding.variants.mergerInverse]: new Vector(1, 1),
    [MetaBalancerBuilding.variants.splitter]: new Vector(1, 1),
    [MetaBalancerBuilding.variants.splitterInverse]: new Vector(1, 1),
};

MetaBalancerBuilding.additionalStatistics = {
    [defaultBuildingVariant]: 2,
    [MetaBalancerBuilding.variants.merger]: 1,
    [MetaBalancerBuilding.variants.mergerInverse]: 1,
    [MetaBalancerBuilding.variants.splitter]: 1,
    [MetaBalancerBuilding.variants.splitterInverse]: 1,
};

MetaBalancerBuilding.componentVariations = {
    [defaultBuildingVariant]: {
        ItemAcceptor_setSlots: [{
                pos: new Vector(0, 0),
                directions: [enumDirection.bottom],
            },
            {
                pos: new Vector(1, 0),
                directions: [enumDirection.bottom],
            },
        ],

        ItemEjector_setSlots: [
            { pos: new Vector(0, 0), direction: enumDirection.top },
            { pos: new Vector(1, 0), direction: enumDirection.top },
        ],

        BeltUnderlays_underlays: [
            { pos: new Vector(0, 0), direction: enumDirection.top },
            { pos: new Vector(1, 0), direction: enumDirection.top },
        ],
    },

    [MetaBalancerBuilding.variants.merger]: {
        ItemAcceptor_setSlots: [{
                pos: new Vector(0, 0),
                directions: [enumDirection.bottom],
            },
            {
                pos: new Vector(0, 0),
                directions: [enumDirection.right],
            },
        ],

        ItemEjector_setSlots: [{ pos: new Vector(0, 0), direction: enumDirection.top }],

        BeltUnderlays_underlays: [{ pos: new Vector(0, 0), direction: enumDirection.top }],
    },

    [MetaBalancerBuilding.variants.mergerInverse]: {
        ItemAcceptor_setSlots: [{
                pos: new Vector(0, 0),
                directions: [enumDirection.bottom],
            },
            {
                pos: new Vector(0, 0),
                directions: [enumDirection.left],
            },
        ],

        ItemEjector_setSlots: [{ pos: new Vector(0, 0), direction: enumDirection.top }],

        BeltUnderlays_underlays: [{ pos: new Vector(0, 0), direction: enumDirection.top }],
    },

    [MetaBalancerBuilding.variants.splitter]: {
        ItemAcceptor_setSlots: [{
            pos: new Vector(0, 0),
            directions: [enumDirection.bottom],
        }, ],

        ItemEjector_setSlots: [{
                pos: new Vector(0, 0),
                direction: enumDirection.top,
            },
            {
                pos: new Vector(0, 0),
                direction: enumDirection.right,
            },
        ],

        BeltUnderlays_underlays: [{ pos: new Vector(0, 0), direction: enumDirection.top }],
    },

    [MetaBalancerBuilding.variants.splitterInverse]: {
        ItemAcceptor_setSlots: [{
            pos: new Vector(0, 0),
            directions: [enumDirection.bottom],
        }, ],

        ItemEjector_setSlots: [{
                pos: new Vector(0, 0),
                direction: enumDirection.top,
            },
            {
                pos: new Vector(0, 0),
                direction: enumDirection.left,
            },
        ],

        BeltUnderlays_underlays: [{ pos: new Vector(0, 0), direction: enumDirection.top }],
    },
};

MetaBalancerBuilding.silhouetteColor = "#555759";