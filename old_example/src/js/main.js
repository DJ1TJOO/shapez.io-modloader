import { MetaTrasherBuilding } from "./buildings/trasher";
import { TrasherComponent } from "./components/trasher";
import { WeirdStartGameMode } from "./gamemodes/weirdstart";
import { FastestForwardGameSpeed } from "./gamespeed/fastest_forward_game_speed";
import { FluidItem } from "./items/fluid";
import { AboutModloaderState } from "./states/about";
import { TrasherSystem } from "./systems/trasher";
import { HUDTestToolbar } from "./toolbars/test_toolbar";

const modId = "7079f8cb-b943-4b09-b263-a32b9ed63d36";
registerMod({
    title: "test",
    id: modId,
    description: "Test mod",
    authors: ["DJ1TJOO", "Shrimp", "SHADOW"],
    version: "1.0.0",
    gameVersion: 1007,
    dependencies: [],
    incompatible: [],
    gameInitializedRootClasses: root => {
        root.gameMode = new WeirdStartGameMode(root);
    },
    gameInitializedRootManagers: root => {},
    gameBeforeFirstUpdate: root => {
        root.time.setSpeed(new FastestForwardGameSpeed(root));
    },
    main: () => {
        console.log("main test 1");

        shapezAPI.injectCss("**{css}**", modId);
        shapezAPI.toolbars["test"] = HUDTestToolbar;
        shapezAPI.ingame.layers.push("test");
        shapezAPI.ingame.gamespeed[FastestForwardGameSpeed.getId()] = FastestForwardGameSpeed;
        shapezAPI.ingame.gamemodes[WeirdStartGameMode.getId()] = WeirdStartGameMode;
        shapezAPI.states["AboutModloaderState"] = AboutModloaderState;
        shapezAPI.themes["blue"] = "**{theme_blue}**";
        shapezAPI.translations.settings.labels.theme.themes["blue"] = "Blue";

        shapezAPI.registerAtlases("**{atlas_atlas0_hq}**", "**{atlas_atlas0_mq}**", "**{atlas_atlas0_lq}**");

        shapezAPI.ingame.items[FluidItem.getId()] = FluidItem;

        shapezAPI.registerBuilding(MetaTrasherBuilding, "**{icons_trasher}**", "K", "Trasher", {
            default: {
                name: "Trasher",
                description: "Accepts inputs from all sides and destroys them. Forever.",
            },

            pink: {
                name: "Trasher",
                description: "Accepts inputs from all sides and destroys them. Forever.",
            },
        });
        shapezAPI.toolbars.buildings.primaryBuildings.push(MetaTrasherBuilding);

        shapezAPI.ingame.components[TrasherComponent.getId()] = TrasherComponent;

        shapezAPI.ingame.systems.splice(
            shapezAPI.ingame.systems.indexOf(shapezAPI.exports.ItemProcessorSystem),
            0,
            TrasherSystem
        );
        shapezAPI.exports.ItemEjectorSystem.tryPassOverItemComponents["Trasher"] = (
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

        console.log(shapezAPI);
    },
});