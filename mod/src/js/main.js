import { MetaBeltCrossingBuilding } from "./buildings/belt_crossing";
import { MetaShapeCombinerBuilding } from "./buildings/shape_combiner";
import { BeltCrossingComponent } from "./components/belt_crossing";
import { SIGameMode } from "./modes/SI";
import { modId } from "./modId";
import { addShapes } from "./shapes";
import { BeltCrossingSystem } from "./systems/belt_crossing";
import { addHandlers, setupItemProcessor } from "./systems/item_processor";
const enumHubGoalRewards = shapezAPI.exports.enumHubGoalRewards;

registerMod({
    title: "What a title?",
    id: modId,
    description: "A miniscule description",
    authors: ["No authors here"],
    version: "1.0.0",
    gameVersion: "ML01",
    dependencies: [],
    incompatible: [],
    settings: {},
    translations: {
        en: {
            [modId]: {
                description: "A miniscule description",
            },
            buildings: {
                shape_combiner: {
                    default: {
                        name: "Shape Combiner",
                        description: "Merges two regular one layer shapes into one combined shape.",
                    },
                },
                belt_crossing: {
                    default: {
                        name: "Belt Crossing",
                        description: "Crosses two belts over each other with no interaction between them.",
                    },
                    corner: {
                        name: "Corner Crossing",
                        description: "Crosses two corner belts over each other with no interaction between them.",
                    },
                    switcher: {
                        name: "Line Crossing",
                        description: "Crosses the items on two adjacent belts.",
                    },
                },
            },
            storyRewards: {
                reward_shape_combiner: {
                    title: "Shape Combiner",
                    desc: `You unlocked the <strong>shape combiner</strong>! <br><br>
                            With the shape combiner, you can comine basic shapes to create new merged shapes! The shape combiner can only merge one layer shapes, but it accepts any mixture of the base shapes.<br>
                            A merged shape is a mixture of any two base shapes. <br><br>
                            While this might not seem like much, it will change <strong>everything</strong>!`,
                },
                reward_belt_crossing: {
                    title: "Belt Crossing",
                    desc: `You unlocked the <strong>Belt Crossing</strong>! <br><br>
                            The belt crossing passes two belts over each other <strong>with no interaction between them</strong>! <br><br>
                            Incredibly useful, the belt crossing can help you compact your factories down to a fraction of their previous size!`,
                },
                no_reward_upgrades: {
                    title: "Research",
                    desc: `
                        You can now research speed upgrades! <br><br>
                        Remember that to keep building ratios accurate you need to have all four kinds of research on the same tier!`,
                },
            },
            keybindings: {
                mappings: {
                    shape_combiner: "Shape Combiner",
                    belt_crossing: "Belt Crossing",
                },
            },
        },
    },
    updateStaticSettings: () => {},
    updateStaticTranslations: (id) => {},
    gameInitializedRootClasses: (root) => {},
    gameInitializedRootManagers: (root) => {
        addHandlers(root);
    },
    gameBeforeFirstUpdate: (root) => {},
    main: (config) => {
        //TODO:
        // Shapez Industries:
        // - Resources: add tutorials
        // - Remove default splitter and merger
        // - Add building speeds to config and add new underground belt tier (smart)
        // - Add smart merger and splitter
        // - Add hyperlink
        // - Add smart cutter (laser?)
        // - Add new miner variant deep
        // - Add smart stacker
        // - Add small storage
        // - Add tutorial goal mappings
        //DONE:
        // - Add belt crossing
        // - Add shape combiner
        // - Add SI gamemode
        // - Add new shapez

        shapezAPI.injectCss("**{css}**", modId);
        shapezAPI.registerAtlases("**{atlas_atlas0_hq}**", "**{atlas_atlas0_mq}**", "**{atlas_atlas0_lq}**");
        shapezAPI.ingame.gamemodes[SIGameMode.getId()] = SIGameMode;

        setupItemProcessor();
        addShapes();

        enumHubGoalRewards.reward_shape_combiner = "reward_shape_combiner";
        shapezAPI.registerBuilding(MetaShapeCombinerBuilding, "**{icons_building_icon_shape_combiner}**", "M");
        shapezAPI.toolbars.buildings.secondaryBuildings.push(MetaShapeCombinerBuilding);

        enumHubGoalRewards.reward_belt_crossing = "reward_belt_crossing";
        shapezAPI.ingame.components[BeltCrossingComponent.getId()] = BeltCrossingComponent;
        shapezAPI.ingame.systems.push(BeltCrossingSystem);
        shapezAPI.registerBuilding(MetaBeltCrossingBuilding, "**{icons_building_icon_belt_crossing}**", "K");
        shapezAPI.toolbars.buildings.primaryBuildings.splice(shapezAPI.toolbars.buildings.primaryBuildings.indexOf(shapezAPI.ingame.buildings.underground_belt) + 1, 0, MetaBeltCrossingBuilding);
    },
});