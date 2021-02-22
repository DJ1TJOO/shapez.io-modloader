import { addBalancerVariants } from "./buildings/balancer";
import { MetaBeltCrossingBuilding } from "./buildings/belt_crossing";
import { addCutterVariant } from "./buildings/cutter";
import { addMinerVariant } from "./buildings/miner";
import { MetaShapeCombinerBuilding } from "./buildings/shape_combiner";
import { addStackerVariant } from "./buildings/stacker";
import { addStorageVariant } from "./buildings/storage";
import { addUndergroundBeltVariant } from "./buildings/underground_belt";
import { BeltCrossingComponent } from "./components/belt_crossing";
import { MinerDeepComponent } from "./components/miner_deep";
import { SmartBalancerComponent } from "./components/smart_balancer";
import { SIGameMode } from "./modes/SI";
import { modId } from "./modId";
import { addShapes } from "./shapes";
import { BeltCrossingSystem } from "./systems/belt_crossing";
import { addHandlers, setupItemProcessor } from "./systems/item_processor";
import { MinerDeepSystem } from "./systems/miner_deep";
import { SmartBalancerSystem } from "./systems/smart_balancer";
import { updateStorageSystem } from "./systems/storage";
const enumHubGoalRewards = shapezAPI.exports.enumHubGoalRewards;
const gMetaBuildingRegistry = shapezAPI.exports.gMetaBuildingRegistry;
const Vector = shapezAPI.exports.Vector;
const getCodeFromBuildingData = shapezAPI.exports.getCodeFromBuildingData;
const MetaUndergroundBeltBuilding = shapezAPI.ingame.buildings.underground_belt;

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
                storage: {
                    mini: {
                        name: "Storage (Mini)",
                        description: "Stores excess items, up to a given capacity. Prioritizes the top output and can be used as an overflow gate.",
                    },
                },
                miner: {
                    deep: {
                        name: "Extractor (Deep)",
                        description: "Place over a shape or color to extract it. Extracts more than a normal extractor.",
                    },
                },

                stacker: {
                    smart: {
                        name: "Smart Stacker",
                        description: "Combines its inputs, stacking the 3 bottom inputs onto the primary left input.",
                    },
                },
                cutter: {
                    laser: {
                        name: "Smart Cutter",
                        description: "Cuts a shape, removing the corners indicated on the wires layer.",
                    },
                },
                balancer: {
                    "splitter-triple": {
                        name: "Smart Splitter",
                        description: "Splits one conveyor belt into up to three outputs.",
                    },

                    "merger-triple": {
                        name: "Smart Merger",
                        description: "Merges up to three conveyor belts into one.",
                    },
                },
                underground_belt: {
                    smart: {
                        name: "Smart Tunnel",
                        description: "Allows you to tunnel resources under buildings and belts, and can also have inputs and outputs from the sides.",
                    },
                },
                hyperlink: {
                    default: {
                        name: "Hyperlink",
                        description: "Transports up to five belts of items at superfast speed, hold and drag to place multiple.",
                    },

                    hyperlink_entrance: {
                        name: "Hyperlink Entry",
                        description: "Inputs three belts of items onto a hyperlink.",
                    },
                    hyperlink_exit: {
                        name: "Hyperlink Exit",
                        description: "Recieves items from a hyperlink and outputs them onto three belts.",
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
                    desc: `You can now research speed upgrades! <br><br>
                        Remember that to keep building ratios accurate you need to have all four kinds of research on the same tier!`,
                },
                reward_research_level: {
                    title: "Research Tier <x>",
                    desc: `New research Level Unlocked!`,
                },
                reward_hyperlink: {
                    title: "Hyperlink",
                    desc: `You unlocked the <strong> Hyperlink </strong>! <br><br>
                            The hyperlink transport up to 3 belts of items at superfast speed! < br > < br >
                            You can use the hyperlink entrance and exit to move items around via the hyperlink.`,
                },
                reward_underground_belt_tier_3: {
                    title: "Smart Tunnel",
                    desc: `You unlocked the <strong> Smart Tunnel </strong>! <br><br>
                            The smart tunnel does not connect to the other variants,
                            and can also have inputs and outputs from the sides
                            for EXTREME compactness.`,
                },
                reward_smart_cutter: {
                    title: "Smart Cutter",
                    desc: `You unlocked the <strong> Smart Cutter </strong>! <br><br>
                            It accepts wire inputs
                            for each corner and cuts off the indicated corners.`,
                },
                reward_deep_miner: {
                    title: "Deep Miner",
                    desc: `You unlocked the <strong> Deep Miner </strong>! <br><br>
                    Yes, you can 't chain it, BUT it outputs much more than a normal miner, making it possible to get more than before out of a deposit.`,
                },
                reward_smart_stacker: {
                    title: "Smart Stacker",
                    desc: `You unlocked the <strong> Smart Stacker </strong>! <br><br>
                            It accepts four inputs to be stacked,
                            but it does not need all four to

                            function. <br> <br>
                            So long as you have the primary left input,
                            it will stack all the other inputs on top. <br>
                            Be sure to use the right ratios,
                            otherwise some stcakers will not recieve part of the shapes you want them to stack!`,
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
    gameBeforeFirstUpdate: (root) => {
        root.signals.entityDestroyed.add(updateSmartUndergroundBeltVariant, root);

        // Notice: These must come *after* the entity destroyed signals
        root.signals.entityAdded.add(updateSmartUndergroundBeltVariant, root);
    },
    main: (config) => {
        //TODO:
        // Shapez Industries:
        // - Add hyperlink
        //DONE:
        // - Add building speeds to config and
        // - Add new miner variant deep
        // - Add belt crossing
        // - Add shape combiner
        // - Add SI gamemode
        // - Add new shapez
        // - Add small storage
        // - Add smart stacker
        // - Resources: add tutorials
        // - Add tutorial goal mappings
        // - Add new underground belt tier (smart)
        // - Add smart cutter (laser?)
        // - Remove default splitter and merger
        // - Add smart merger and splitter
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

        addStorageVariant();
        updateStorageSystem();

        enumHubGoalRewards.reward_deep_miner = "reward_deep_miner";
        shapezAPI.ingame.components[MinerDeepComponent.getId()] = MinerDeepComponent;
        shapezAPI.ingame.systems.push(MinerDeepSystem);
        shapezAPI.ingame["systemsRenderOrderDynamic"].push(MinerDeepSystem);
        addMinerVariant();

        enumHubGoalRewards.reward_smart_stacker = "reward_smart_stacker";
        addStackerVariant();

        enumHubGoalRewards.reward_smart_cutter = "reward_smart_cutter";
        addCutterVariant();

        enumHubGoalRewards.reward_underground_belt_tier_3 = "reward_underground_belt_tier_3";
        addUndergroundBeltVariant();

        shapezAPI.ingame.components[SmartBalancerComponent.getId()] = SmartBalancerComponent;
        shapezAPI.ingame.systems.push(SmartBalancerSystem);
        addBalancerVariants();

        const typed = (x) => x;
        shapezAPI.exports.enumHubGoalRewardsToContentUnlocked[enumHubGoalRewards.reward_belt_crossing] = typed([
            [MetaBeltCrossingBuilding, shapezAPI.exports.defaultBuildingVariant]
        ]);
        shapezAPI.exports.enumHubGoalRewardsToContentUnlocked[enumHubGoalRewards.reward_shape_combiner] = typed([
            [MetaShapeCombinerBuilding, shapezAPI.exports.defaultBuildingVariant]
        ]);
        shapezAPI.exports.enumHubGoalRewardsToContentUnlocked[enumHubGoalRewards.reward_deep_miner] = typed([
            [shapezAPI.exports.MetaMinerBuilding, shapezAPI.ingame.buildings.miner.variants.deep]
        ]);
        shapezAPI.exports.enumHubGoalRewardsToContentUnlocked[enumHubGoalRewards.reward_smart_stacker] = typed([
            [shapezAPI.exports.MetaStackerBuilding, shapezAPI.ingame.buildings.stacker.variants.smart]
        ]);
        shapezAPI.exports.enumHubGoalRewardsToContentUnlocked[enumHubGoalRewards.no_reward_upgrades] = null;
        shapezAPI.exports.enumHubGoalRewardsToContentUnlocked[enumHubGoalRewards.reward_research_level] = null;
        // shapezAPI.exports.enumHubGoalRewardsToContentUnlocked[enumHubGoalRewards.reward_hyperlink]= typed([[MetaHyperlinkBuilding, defaultBuildingVariant]]);
        shapezAPI.exports.enumHubGoalRewardsToContentUnlocked[enumHubGoalRewards.reward_underground_belt_tier_3] = typed([
            [shapezAPI.exports.MetaUndergroundBeltBuilding, shapezAPI.ingame.buildings.underground_belt.variants.smart]
        ]);
        shapezAPI.exports.enumHubGoalRewardsToContentUnlocked[enumHubGoalRewards.reward_smart_cutter] = typed([
            [shapezAPI.exports.MetaCutterBuilding, shapezAPI.ingame.buildings.cutter.variants.laser]
        ]);
        // shapezAPI.exports.enumHubGoalRewardsToContentUnlocked[enumHubGoalRewards.reward_splitter]= typed([[shapezAPI.exports.MetaBalancerBuilding, shapezAPI.ingame.buildings.balancer.variants.splitterTriple]]);
        // shapezAPI.exports.enumHubGoalRewardsToContentUnlocked[enumHubGoalRewards.reward_merger]= typed([[shapezAPI.exports.MetaBalancerBuilding, shapezAPI.ingame.buildings.balancer.variants.mergerTriple]]);
    },
});

/**
 * @this {any}
 */
function updateSmartUndergroundBeltVariant(entity) {
    if (!this.gameInitialized) {
        return;
    }

    const staticComp = entity.components.StaticMapEntity;
    if (!staticComp) {
        return;
    }

    const metaUndergroundBelt = gMetaBuildingRegistry.findByClass(MetaUndergroundBeltBuilding);
    // Compute affected area
    const originalRect = staticComp.getTileSpaceBounds();
    const affectedArea = originalRect.expandedInAllDirections(1);

    for (let x = affectedArea.x; x < affectedArea.right(); ++x) {
        for (let y = affectedArea.y; y < affectedArea.bottom(); ++y) {
            if (originalRect.containsPoint(x, y)) {
                // Make sure we don't update the original entity
                continue;
            }

            const targetEntities = this.map.getLayersContentsMultipleXY(x, y);
            for (let i = 0; i < targetEntities.length; ++i) {
                const targetEntity = targetEntities[i];

                const targetUndergroundBeltComp = targetEntity.components.UndergroundBelt;
                const targetStaticComp = targetEntity.components.StaticMapEntity;

                if (!targetUndergroundBeltComp || !(targetUndergroundBeltComp.tier == 2)) {
                    // Not a smart tunnel
                    continue;
                }

                const { rotation, rotationVariant } = metaUndergroundBelt.computeOptimalDirectionAndRotationVariantAtTile({
                    root: this,
                    tile: new Vector(x, y),
                    rotation: targetStaticComp.originalRotation,
                    variant: MetaUndergroundBeltBuilding.variants.smart,
                    layer: targetEntity.layer,
                    entity: targetEntity,
                });
                // Change stuff
                metaUndergroundBelt.updateVariants(targetEntity, rotationVariant, MetaUndergroundBeltBuilding.variants.smart);

                // Update code as well
                targetStaticComp.code = getCodeFromBuildingData(metaUndergroundBelt, MetaUndergroundBeltBuilding.variants.smart, rotationVariant);

                // Make sure the chunks know about the update
                this.signals.entityChanged.dispatch(targetEntity);
            }
        }
    }
}