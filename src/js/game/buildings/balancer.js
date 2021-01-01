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
     * @param {string} variant
     */
    getDimensions(variant) {
        let condition = MetaBalancerBuilding.dimensions[variant];

        if (typeof condition === "function") {
            // @ts-ignore
            condition = condition();
        }

        // @ts-ignore
        return typeof condition === "object" ? condition : new Vector(1, 1);
    }

    /**
     * @param {number} rotation
     * @param {number} rotationVariant
     * @param {string} variant
     * @param {Entity} entity
     * @returns {Array<number>|null}
     */
    getSpecialOverlayRenderMatrix(rotation, rotationVariant, variant, entity) {
        let condition = MetaBalancerBuilding.overlayMatrices[variant][rotation];
        return condition ? condition : null;
    }

    /**
     * @param {GameRoot} root
     * @param {string} variant
     * @returns {Array<[string, string]>}
     */
    getAdditionalStatistics(root, variant) {
        let speed = 0;
        if (typeof MetaBalancerBuilding.additionalStatistics[variant] === "function") {
            // @ts-ignore
            speed = MetaBalancerBuilding.additionalStatistics[variant](root);
        } else {
            // @ts-ignore
            speed = MetaBalancerBuilding.additionalStatistics[variant];
        }
        return [
            [T.ingame.buildingPlacement.infoTexts.speed, formatItemsPerSecond(speed)]
        ];
    }

    /**
     * @param {string} variant
     */
    getSilhouetteColor(variant) {
        let condition = MetaBalancerBuilding.silhouetteColors[variant];

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
    getAvailableVariants(root) {
        const variants = MetaBalancerBuilding.avaibleVariants;

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
     * @param {GameRoot} root
     */
    // @ts-ignore
    getIsUnlocked(root) {
        let reward = MetaBalancerBuilding.avaibleVariants[defaultBuildingVariant];

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
     * @param {Entity} entity
     * @param {number} rotationVariant
     * @param {string} variant
     */
    updateVariants(entity, rotationVariant, variant) {
        MetaBalancerBuilding.componentVariations[variant](entity, rotationVariant);
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
    [defaultBuildingVariant]: root =>
        (root.hubGoals.getProcessorBaseSpeed(enumItemProcessorTypes.balancer) / 2) * 2,
    [MetaBalancerBuilding.variants.merger]: root =>
        (root.hubGoals.getProcessorBaseSpeed(enumItemProcessorTypes.balancer) / 2) * 1,
    [MetaBalancerBuilding.variants.mergerInverse]: root =>
        (root.hubGoals.getProcessorBaseSpeed(enumItemProcessorTypes.balancer) / 2) * 1,
    [MetaBalancerBuilding.variants.splitter]: root =>
        (root.hubGoals.getProcessorBaseSpeed(enumItemProcessorTypes.balancer) / 2) * 1,
    [MetaBalancerBuilding.variants.splitterInverse]: root =>
        (root.hubGoals.getProcessorBaseSpeed(enumItemProcessorTypes.balancer) / 2) * 1,
};

MetaBalancerBuilding.silhouetteColors = {
    [defaultBuildingVariant]: "#555759",
    [MetaBalancerBuilding.variants.merger]: "#555759",
    [MetaBalancerBuilding.variants.mergerInverse]: "#555759",
    [MetaBalancerBuilding.variants.splitter]: "#555759",
    [MetaBalancerBuilding.variants.splitterInverse]: "#555759",
};

MetaBalancerBuilding.componentVariations = {
    [defaultBuildingVariant]: (entity, rotationVariant) => {
        entity.components.ItemAcceptor.setSlots([{
                pos: new Vector(0, 0),
                directions: [enumDirection.bottom],
            },
            {
                pos: new Vector(1, 0),
                directions: [enumDirection.bottom],
            },
        ]);

        entity.components.ItemEjector.setSlots([
            { pos: new Vector(0, 0), direction: enumDirection.top },
            { pos: new Vector(1, 0), direction: enumDirection.top },
        ]);

        entity.components.BeltUnderlays.underlays = [
            { pos: new Vector(0, 0), direction: enumDirection.top },
            { pos: new Vector(1, 0), direction: enumDirection.top },
        ];
    },

    [MetaBalancerBuilding.variants.merger]: (entity, rotationVariant) => {
        entity.components.ItemAcceptor.setSlots([{
                pos: new Vector(0, 0),
                directions: [enumDirection.bottom],
            },
            {
                pos: new Vector(0, 0),
                directions: [enumDirection.right],
            },
        ]);

        entity.components.ItemEjector.setSlots([{ pos: new Vector(0, 0), direction: enumDirection.top }]);

        entity.components.BeltUnderlays.underlays = [{ pos: new Vector(0, 0), direction: enumDirection.top }];
    },

    [MetaBalancerBuilding.variants.mergerInverse]: (entity, rotationVariant) => {
        entity.components.ItemAcceptor.setSlots([{
                pos: new Vector(0, 0),
                directions: [enumDirection.bottom],
            },
            {
                pos: new Vector(0, 0),
                directions: [enumDirection.left],
            },
        ]);

        entity.components.ItemEjector.setSlots([{ pos: new Vector(0, 0), direction: enumDirection.top }]);

        entity.components.BeltUnderlays.underlays = [{ pos: new Vector(0, 0), direction: enumDirection.top }];
    },

    [MetaBalancerBuilding.variants.splitter]: (entity, rotationVariant) => {
        {
            entity.components.ItemAcceptor.setSlots([{
                pos: new Vector(0, 0),
                directions: [enumDirection.bottom],
            }, ]);

            entity.components.ItemEjector.setSlots([{
                    pos: new Vector(0, 0),
                    direction: enumDirection.top,
                },
                {
                    pos: new Vector(0, 0),
                    direction: enumDirection.right,
                },
            ]);

            entity.components.BeltUnderlays.underlays = [
                { pos: new Vector(0, 0), direction: enumDirection.top },
            ];
        }
    },

    [MetaBalancerBuilding.variants.splitterInverse]: (entity, rotationVariant) => {
        {
            entity.components.ItemAcceptor.setSlots([{
                pos: new Vector(0, 0),
                directions: [enumDirection.bottom],
            }, ]);

            entity.components.ItemEjector.setSlots([{
                    pos: new Vector(0, 0),
                    direction: enumDirection.top,
                },
                {
                    pos: new Vector(0, 0),
                    direction: enumDirection.left,
                },
            ]);

            entity.components.BeltUnderlays.underlays = [
                { pos: new Vector(0, 0), direction: enumDirection.top },
            ];
        }
    },
};