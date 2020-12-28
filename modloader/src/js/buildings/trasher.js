import { TrasherComponent } from "../components/trasher";

const overlayMatrix = window["shapezAPI"].generateMatrixRotations([1, 1, 0, 1, 1, 1, 0, 1, 1]);

export class MetaTrasherBuilding extends window["shapezAPI"].exports.MetaBuilding {
    constructor() {
        super("trasher");
    }

    getIsRotateable() {
        return false;
    }

    getSilhouetteColor() {
        return "#ed1d5d";
    }

    getDimensions() {
        return new window["shapezAPI"].exports.Vector(1, 1);
    }

    getSpecialOverlayRenderMatrix(rotation) {
        return overlayMatrix[rotation];
    }

    getIsUnlocked(root) {
        return root.hubGoals.isRewardUnlocked(
            MetaTrasherBuilding.avaibleVariants[window["shapezAPI"].exports.defaultBuildingVariant]
        );
    }

    getAvailableVariants(root) {
        const variants = MetaTrasherBuilding.avaibleVariants;

        let available = [];
        for (const variant in variants) {
            const reward = variants[variant];
            // @ts-ignore
            if (reward !== true && !root.hubGoals.isRewardUnlocked(reward)) continue;
            available.push(variant);
        }

        return available;
    }

    setupEntityComponents(entity) {
        entity.addComponent(
            new window["shapezAPI"].exports.ItemAcceptorComponent({
                slots: [{
                    pos: new window["shapezAPI"].exports.Vector(0, 0),
                    directions: [
                        window["shapezAPI"].exports.enumDirection.top,
                        window["shapezAPI"].exports.enumDirection.right,
                        window["shapezAPI"].exports.enumDirection.bottom,
                        window["shapezAPI"].exports.enumDirection.left,
                    ],
                }, ],
            })
        );
        entity.addComponent(
            new TrasherComponent({
                //hello did you made mods readable from files ?
                inputsPerCharge: 1,
            })
        );
    }
}

MetaTrasherBuilding.variants = {
    pink: "pink",
};

MetaTrasherBuilding.avaibleVariants = {
    [window["shapezAPI"].exports.defaultBuildingVariant]: window["shapezAPI"].exports.enumHubGoalRewards.reward_cutter_and_trash,
    [MetaTrasherBuilding.variants.pink]: window["shapezAPI"].exports.enumHubGoalRewards.reward_cutter_and_trash,
};