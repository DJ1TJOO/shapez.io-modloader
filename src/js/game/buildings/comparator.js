import { enumDirection, Vector } from "../../core/vector";
import { enumLogicGateType, LogicGateComponent } from "../components/logic_gate";
import { enumPinSlotType, WiredPinsComponent } from "../components/wired_pins";
import { Entity } from "../entity";
import { defaultBuildingVariant, MetaBuilding } from "../meta_building";
import { GameRoot } from "../root";
import { enumHubGoalRewards } from "../tutorial_goals";

export class MetaComparatorBuilding extends MetaBuilding {
    constructor() {
        super("comparator");
    }

    getSilhouetteColor(variant) {
        return MetaComparatorBuilding.silhouetteColor[variant];
    }

    /**
     * @param {GameRoot} root
     */
    getIsUnlocked(root) {
        const reward = MetaComparatorBuilding.avaibleVariants[defaultBuildingVariant];

        if (typeof reward === "function") {
            // @ts-ignore
            if (!root.hubGoals.isRewardUnlocked(reward())) return false;
            // @ts-ignore
            return root.hubGoals.isRewardUnlocked(reward());
        } else if (typeof reward === "boolean") {
            // @ts-ignore
            return reward;
        } else if (root.hubGoals.isRewardUnlocked(reward) != undefined) {
            // @ts-ignore
            return root.hubGoals.isRewardUnlocked(reward);
        } else {
            return false;
        }
    }

    /** @returns {"wires"} **/
    getLayer() {
        return "wires";
    }

    getDimensions(variant) {
        return MetaComparatorBuilding.dimensions[variant];
    }

    getRenderPins() {
        // We already have it included
        return false;
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
                ],
            })
        );

        entity.addComponent(
            new LogicGateComponent({
                type: enumLogicGateType.compare,
            })
        );
    }
}

MetaComparatorBuilding.avaibleVariants = {
    [defaultBuildingVariant]: enumHubGoalRewards.reward_virtual_processing,
};

MetaComparatorBuilding.dimensions = {
    [defaultBuildingVariant]: new Vector(1, 1),
};

MetaComparatorBuilding.silhouetteColor = {
    [defaultBuildingVariant]: "#823cab",
};