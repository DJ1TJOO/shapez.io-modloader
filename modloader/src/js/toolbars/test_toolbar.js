import { MetaTrasherBuilding } from "../buildings/trasher";

export class HUDTestToolbar extends shapezAPI.exports.HUDBaseToolbar {
    constructor(root) {
        super(root, {
            primaryBuildings: HUDTestToolbar.bar.primaryBuildings,
            secondaryBuildings: HUDTestToolbar.bar.secondaryBuildings,
            visibilityCondition: () =>
                !this.root.camera.getIsMapOverlayActive() && this.root.currentLayer === "test",
            htmlElementId: HUDTestToolbar.bar.htmlElementId,
            layer: "test",
        });
        /* typehints:start */
        this.root = root;
        /* typehints:end */
    }
}

HUDTestToolbar.bar = {
    primaryBuildings: [MetaTrasherBuilding],
    secondaryBuildings: [],
    htmlElementId: "ingame_HUD_test_toolbar",
};