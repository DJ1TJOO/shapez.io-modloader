import { MetaTrasherBuilding } from "./buildings/trasher";
import { TrasherComponent } from "./components/trasher";
import { AboutModloaderState } from "./states/about";
import { TrasherSystem } from "./systems/trasher";

var modId = "7079f8cb-b943-4b09-b263-a32b9ed63d36";
window["registerMod"]({
    title: "test",
    id: modId,
    description: "Test mod",
    authors: ["DJ1TJOO", "Shrimp", "SHADOW"],
    version: "1.0.0",
    gameVersion: 1007,
    dependencies: ["51172f31-98b0-45ae-9896-be697b2429e2"],
    incompatible: [],
    main: () => {
        console.log("main test 1");

        window["shapezAPI"].injectCss("**{css}**", "AboutModloaderState");

        window["shapezAPI"].states.push(AboutModloaderState);

        window["shapezAPI"].registerAtlases(
            "**{atlas_atlas0_hq}**",
            "**{atlas_atlas0_mq}**",
            "**{atlas_atlas0_lq}**"
        );

        window["shapezAPI"].registerBuilding(MetaTrasherBuilding, "**{icons_trasher}**", "K", "Trasher", {
            default: {
                name: "Trasher",
                description: "Accepts inputs from all sides and destroys them. Forever.",
            },

            pink: {
                name: "Trasher",
                description: "Accepts inputs from all sides and destroys them. Forever.",
            },
        });
        window["shapezAPI"].toolbars.buildings.primaryBuildings.push(MetaTrasherBuilding);

        window["shapezAPI"].ingame.components[TrasherComponent.getId()] = TrasherComponent;

        window["shapezAPI"].ingame.systems.splice(
            window["shapezAPI"].ingame.systems.indexOf(window["shapezAPI"].exports.ItemProcessorSystem),
            0,
            TrasherSystem
        );
        window["shapezAPI"].exports.ItemEjectorSystem.tryPassOverItemComponents["Trasher"] = (
            comp,
            item,
            receiver,
            slotIndex,
            itemEjector
        ) => {
            // Check for potential filters
            if (!itemEjector.root.systemMgr.systems.trasher.checkRequirements(receiver, item, slotIndex)) {
                return false;
            }

            // Its an item processor ..
            if (comp.tryTakeItem(item, slotIndex)) {
                return true;
            }
            // Item processor can have nothing else
            return false;
        };

        console.log(window["shapezAPI"]);
    },
});