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

    getSilhouetteColor() {
        return MetaAnalyzerBuilding.silhouetteColor;
    }

    /**
     * @param {GameRoot} root
     */
    getIsUnlocked(root) {
        const reward = MetaAnalyzerBuilding.avaibleVariants[defaultBuildingVariant];

        if (typeof reward === "function") {
            // @ts-ignore
            if (reward() !== true && !root.hubGoals.isRewardUnlocked(reward())) return false;
            // @ts-ignore
            return root.hubGoals.isRewardUnlocked(reward());
        } else if (typeof reward === "boolean") {
            // @ts-ignore
            return reward;
        } else if (root.hubGoals.isRewardUnlocked(reward) != undefined) {
            // @ts-ignore
            if (reward !== true && !root.hubGoals.isRewardUnlocked(reward)) return false;
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

    getDimensions() {
        return MetaAnalyzerBuilding.dimensions;
    }

    getRenderPins() {
        // We already have it included
        return false;
    }

    getSpecialOverlayRenderMatrix(rotation, rotationVariant, variant) {
        return MetaAnalyzerBuilding.overlayMatrices[rotation];
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
        );

        entity.addComponent(
            new LogicGateComponent({
                type: enumLogicGateType.analyzer,
            })
        );
    }
}

MetaAnalyzerBuilding.overlayMatrices = generateMatrixRotations([1, 1, 0, 1, 1, 1, 0, 1, 0]);

MetaAnalyzerBuilding.avaibleVariants = {
    [defaultBuildingVariant]: enumHubGoalRewards.reward_virtual_processing,
};

MetaAnalyzerBuilding.dimensions = new Vector(1, 1);

MetaAnalyzerBuilding.silhouetteColor = "#555759";