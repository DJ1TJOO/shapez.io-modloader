import { addBalancerVariants } from "./buildings/balancer";
import { MetaBeltCrossingBuilding } from "./buildings/belt_crossing";
import { addCutterVariant } from "./buildings/cutter";
import { MetaHyperlinkBuilding } from "./buildings/hyperlink";
import { addMinerVariant } from "./buildings/miner";
import { MetaShapeCombinerBuilding } from "./buildings/shape_combiner";
import { addStackerVariant } from "./buildings/stacker";
import { addStorageVariant } from "./buildings/storage";
import { addUndergroundBeltVariant } from "./buildings/underground_belt";
import { BeltCrossingComponent } from "./components/belt_crossing";
import { HyperlinkComponent } from "./components/hyperlink";
import { HyperlinkAcceptorComponent } from "./components/hyperlink_acceptor";
import { HyperlinkEjectorComponent } from "./components/hyperlink_ejector";
import { MinerDeepComponent } from "./components/miner_deep";
import { SmartBalancerComponent } from "./components/smart_balancer";
import { SIGameMode } from "./modes/SI";
import { modId } from "./modId";
import { addShapes } from "./shapes";
import { BeltCrossingSystem } from "./systems/belt_crossing";
import { HyperlinkSystem } from "./systems/hyperlink";
import { HyperlinkAcceptorSystem } from "./systems/hyperlink_acceptor";
import { HyperlinkEjectorSystem } from "./systems/hyperlink_ejector";
import { addHandlers, setupItemProcessor } from "./systems/item_processor";
import { MinerDeepSystem } from "./systems/miner_deep";
import { SmartBalancerSystem } from "./systems/smart_balancer";
import { updateStorageSystem } from "./systems/storage";
const enumHubGoalRewards = shapezAPI.exports.enumHubGoalRewards;
const gMetaBuildingRegistry = shapezAPI.exports.gMetaBuildingRegistry;
const Vector = shapezAPI.exports.Vector;
const getCodeFromBuildingData = shapezAPI.exports.getCodeFromBuildingData;
const MetaUndergroundBeltBuilding = shapezAPI.ingame.buildings.underground_belt;
let orginalTranslations = {};

function matchOverwriteRecursive(dest, src) {
    if (typeof dest !== "object" || typeof src !== "object") {
        return;
    }

    for (const key in src) {
        //console.log("copy", key);
        const data = src[key];
        if (typeof data === "object") {
            if (!dest[key]) dest[key] = {};
            matchOverwriteRecursive(dest[key], src[key]);
        } else if (typeof data === "string" || typeof data === "number") {
            // console.log("match string", key);
            dest[key] = src[key];
        }
    }
}

function copy(source, deep) {
    var o, prop, type;

    if (typeof source != "object" || source === null) {
        // What do to with functions, throw an error?
        o = source;
        return o;
    }

    o = new source.constructor();

    for (prop in source) {
        if (source.hasOwnProperty(prop)) {
            type = typeof source[prop];

            if (deep && type == "object" && source[prop] !== null) {
                o[prop] = copy(source[prop]);
            } else {
                o[prop] = source[prop];
            }
        }
    }
    return o;
}

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
                    hyperlink: "Hyperlink",
                },
            },
        },
    },
    updateStaticSettings: () => {},
    updateStaticTranslations: (id) => {},
    gameInitializedRootClasses: (root) => {
        if (root.gameMode.constructor.getId() === SIGameMode.getId()) {
            orginalTranslations = {
                dialogs: {
                    buttons: {
                        showUpgrades: shapezAPI.translations.dialogs.buttons.showUpgrades,
                    },

                    upgradesIntroduction: {
                        title: shapezAPI.translations.dialogs.upgradesIntroduction.title,
                        desc: shapezAPI.translations.dialogs.upgradesIntroduction.desc,
                    },

                    blueprintsNotUnlocked: { desc: shapezAPI.translations.dialogs.blueprintsNotUnlocked },
                },
                ingame: {
                    keybindingsOverlay: {
                        pasteLastBlueprint: shapezAPI.translations.ingame.keybindingsOverlay.pasteLastBlueprint,
                    },
                    notifications: {
                        researchComplete: shapezAPI.translations.ingame.notifications.researchComplete,
                    },
                    shop: {
                        title: shapezAPI.translations.ingame.shop.title,
                        buttonUnlock: shapezAPI.translations.ingame.shop.buttonUnlock,
                        maximumLevel: shapezAPI.translations.ingame.shop.maximumLevel,
                    },
                },
                keybindings: {
                    mappings: {
                        pasteLastBlueprint: shapezAPI.translations.keybindings.mappings.pasteLastBlueprint,
                    },
                },
                storyRewards: {
                    reward_blueprints: {
                        title: shapezAPI.translations.storyRewards.reward_blueprints.title,
                        desc: shapezAPI.translations.storyRewards.reward_blueprints.desc,
                    },
                },
            };
            orginalTranslations = copy(orginalTranslations, true);
            matchOverwriteRecursive(shapezAPI.translations, {
                dialogs: {
                    buttons: {
                        showUpgrades: "Show Research",
                    },

                    upgradesIntroduction: {
                        title: "Research Upgrades",
                        desc: `
                        All shapes you produce can be used to unlock upgrades - <strong>don't destroy your old factories!</strong>
                        The upgrades tab can be found on the top right corner of the screen.
                        All shapes you produce can be used to research upgrades - <strong>don't destroy your old factories!</strong>
                        The research tab can be found on the top right corner of the screen. <br><br>
                        Deliver shapes to the hub to unlock new tiers of research.`,
                    },

                    blueprintsNotUnlocked: { desc: "Complete level 20 to unlock Bugprints!" },
                },
                ingame: {
                    keybindingsOverlay: {
                        pasteLastBlueprint: "Paste last bugprint",
                    },
                    notifications: {
                        researchComplete: "You can now research tier <level> upgrades!",
                    },
                    shop: {
                        title: "Research",
                        buttonUnlock: "Research",
                        maximumLevel: "MAX LEVEL (Speed x<currentMult>)",
                    },
                },
                keybindings: {
                    mappings: {
                        pasteLastBlueprint: "Paste last bugprint",
                    },
                },
                storyRewards: {
                    reward_blueprints: {
                        title: "Bugprints",
                        desc: `
            You can now <strong>copy and paste</strong> parts of your factory! Select an area (Hold CTRL, then drag with your mouse), and press 'C' to copy it.<br><br>Pasting it is
            <strong>not free</strong>, you need to produce <strong>blueprint shapes</strong> to afford it! (Those you just delivered).
            <strong>not free</strong>, you need to produce <strong>bugprint shapes</strong> to afford it! (Those you just delivered).<br><br>
            I had to do this, for the memes.`,
                    },
                },
            });
        } else {
            matchOverwriteRecursive(shapezAPI.translations, orginalTranslations);
        }
    },
    gameInitializedRootManagers: (root) => {
        addHandlers(root);
        if (root.gameMode.constructor.getId() === SIGameMode.getId()) {
            /**
             * @this {any}
             */
            root.hubGoals.computeNextGoal = function() {
                const storyIndex = this.level - 1;
                const levels = this.root.gameMode.getLevelDefinitions();
                if (storyIndex < levels.length) {
                    const { shape, required, reward, throughputOnly } = levels[storyIndex];
                    this.currentGoal = {
                        definition: this.root.shapeDefinitionMgr.getShapeFromShortKey(shape),
                        required,
                        reward,
                        throughputOnly,
                    };
                    return;
                }

                //Floor Required amount to remove confusion
                const required = Math.min(200, Math.floor(4 + (this.level - 40) * 0.25));
                this.currentGoal = {
                    definition: this.computeFreeplayShape(this.level),
                    required,
                    reward: this.level % 5 == 0 ? enumHubGoalRewards.reward_research_level : enumHubGoalRewards.no_reward,
                    throughputOnly: true,
                };
            };

            root.hubGoals.canUnlockUpgrade = function(upgradeId) {
                const tiers = this.root.gameMode.getUpgrades()[upgradeId];
                const currentLevel = this.getUpgradeLevel(upgradeId);
                //6 + ((this.level - 40)/5) = research level
                if (currentLevel >= tiers.length && currentLevel >= 6 + (this.level - 40) / 5) {
                    // Max level
                    return false;
                }

                const tierData = tiers[currentLevel];

                for (let i = 0; i < tierData.required.length; ++i) {
                    const requirement = tierData.required[i];
                    if ((this.storedShapes[requirement.shape] || 0) < requirement.amount) {
                        return false;
                    }
                }
                return true;
            };
        }
    },
    gameBeforeFirstUpdate: (root) => {
        root.signals.entityDestroyed.add(updateSmartUndergroundBeltVariant, root);

        // Notice: These must come *after* the entity destroyed signals
        root.signals.entityAdded.add(updateSmartUndergroundBeltVariant, root);

        if (root.gameMode.constructor.getId() === SIGameMode.getId()) {
            var changeIcon = setInterval(function() {
                const shop = document.getElementById("ingame_HUD_GameMenu").getElementsByClassName("shop")[0];
                if (shop) {
                    shop.classList.remove("shop");
                    shop.classList.add("research");
                    clearInterval(changeIcon);
                }
            }, 100);
        }
    },
    main: (config) => {
        //TODO:
        // Shapez Industries:
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
        // - Add hyperlink
        shapezAPI.injectCss("**{css}**", modId);
        shapezAPI.registerAtlases("**{atlas_atlas0_hq}**", "**{atlas_atlas0_mq}**", "**{atlas_atlas0_lq}**");

        setupItemProcessor();
        addShapes();

        shapezAPI.registerBuilding(MetaShapeCombinerBuilding, "**{icons_building_icon_shape_combiner}**", "M");
        shapezAPI.toolbars.buildings.secondaryBuildings.push(MetaShapeCombinerBuilding);

        shapezAPI.ingame.components[BeltCrossingComponent.getId()] = BeltCrossingComponent;
        shapezAPI.ingame.systems.push(BeltCrossingSystem);
        shapezAPI.registerBuilding(MetaBeltCrossingBuilding, "**{icons_building_icon_belt_crossing}**", "K");
        shapezAPI.toolbars.buildings.primaryBuildings.splice(shapezAPI.toolbars.buildings.primaryBuildings.indexOf(shapezAPI.ingame.buildings.underground_belt) + 1, 0, MetaBeltCrossingBuilding);

        shapezAPI.ingame.components[HyperlinkAcceptorComponent.getId()] = HyperlinkAcceptorComponent;
        shapezAPI.ingame.components[HyperlinkComponent.getId()] = HyperlinkComponent;
        shapezAPI.ingame.components[HyperlinkEjectorComponent.getId()] = HyperlinkEjectorComponent;
        shapezAPI.ingame.systems.push(HyperlinkAcceptorSystem);
        shapezAPI.ingame.systems.push(HyperlinkEjectorSystem);
        shapezAPI.ingame.systems.push(HyperlinkSystem);
        shapezAPI.registerBuilding(MetaHyperlinkBuilding, "**{icons_building_icon_hyperlink}**", "H");
        shapezAPI.toolbars.buildings.secondaryBuildings.unshift(MetaHyperlinkBuilding);

        addStorageVariant();
        updateStorageSystem();

        shapezAPI.ingame.components[MinerDeepComponent.getId()] = MinerDeepComponent;
        shapezAPI.ingame.systems.push(MinerDeepSystem);
        shapezAPI.ingame["systemsRenderOrderDynamic"].push(MinerDeepSystem);
        addMinerVariant();

        addStackerVariant();

        addCutterVariant();

        addUndergroundBeltVariant();

        shapezAPI.ingame.components[SmartBalancerComponent.getId()] = SmartBalancerComponent;
        shapezAPI.ingame.systems.push(SmartBalancerSystem);
        addBalancerVariants();

        shapezAPI.ingame.buildings.display.avaibleVariants[shapezAPI.exports.defaultBuildingVariant] = (root) => root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_virtual_processing);

        const typed = (x) => x;
        shapezAPI.exports.enumHubGoalRewardsToContentUnlocked[enumHubGoalRewards.reward_belt_crossing] = typed([
            [MetaBeltCrossingBuilding, shapezAPI.exports.defaultBuildingVariant]
        ]);
        shapezAPI.exports.enumHubGoalRewardsToContentUnlocked[enumHubGoalRewards.reward_shape_combiner] = typed([
            [MetaShapeCombinerBuilding, shapezAPI.exports.defaultBuildingVariant]
        ]);
        shapezAPI.exports.enumHubGoalRewardsToContentUnlocked[enumHubGoalRewards.reward_deep_miner] = typed([
            [shapezAPI.ingame.buildings.miner, shapezAPI.ingame.buildings.miner.variants.deep]
        ]);
        shapezAPI.exports.enumHubGoalRewardsToContentUnlocked[enumHubGoalRewards.reward_smart_stacker] = typed([
            [shapezAPI.ingame.buildings.stacker, shapezAPI.ingame.buildings.stacker.variants.smart]
        ]);
        shapezAPI.exports.enumHubGoalRewardsToContentUnlocked[enumHubGoalRewards.no_reward_upgrades] = null;
        shapezAPI.exports.enumHubGoalRewardsToContentUnlocked[enumHubGoalRewards.reward_research_level] = null;
        shapezAPI.exports.enumHubGoalRewardsToContentUnlocked[enumHubGoalRewards.reward_hyperlink] = typed([
            [MetaHyperlinkBuilding, shapezAPI.exports.defaultBuildingVariant]
        ]);
        shapezAPI.exports.enumHubGoalRewardsToContentUnlocked[enumHubGoalRewards.reward_underground_belt_tier_3] = typed([
            [shapezAPI.ingame.buildings.underground_belt, shapezAPI.ingame.buildings.underground_belt.variants.smart]
        ]);
        shapezAPI.exports.enumHubGoalRewardsToContentUnlocked[enumHubGoalRewards.reward_smart_cutter] = typed([
            [shapezAPI.ingame.buildings.cutter, shapezAPI.ingame.buildings.cutter.variants.laser]
        ]);
        shapezAPI.exports.enumHubGoalRewardsToContentUnlocked[enumHubGoalRewards.reward_splitter] = typed([
            [shapezAPI.ingame.buildings.balancer, shapezAPI.ingame.buildings.balancer.variants.splitterTriple]
        ]);
        shapezAPI.exports.enumHubGoalRewardsToContentUnlocked[enumHubGoalRewards.reward_merger] = typed([
            [shapezAPI.ingame.buildings.balancer, shapezAPI.ingame.buildings.balancer.variants.mergerTriple]
        ]);

        shapezAPI.ingame.gamemodes[SIGameMode.getId()] = SIGameMode;
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