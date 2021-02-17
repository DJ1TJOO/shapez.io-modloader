const findNiceIntegerValue = shapezAPI.exports.findNiceIntegerValue;
const GameMode = shapezAPI.exports.GameMode;
const ShapeDefinition = shapezAPI.exports.ShapeDefinition;
const enumHubGoalRewards = shapezAPI.exports.enumHubGoalRewards;

const rocketShape = "Sr------:--CgSrCg:CwCrCwCr:SgSgSgSg";
const finalGameShape = "RrCw--Cw:----Rr--:SgSgSgSg";
const bestShape = "WrRgWrRg:CwCrCwCr:SgSgSgSg";
const preparementShape = /*"CpRpCp--:SwSwSwSw"*/ bestShape;
const blueprintShape = "CrCrCrRr:CwCwCwCw";
const upgradeEnchancementShape = "Rr--Rr--:--Rg--Rg:Rw--Rw--";

// Tiers need % of the previous tier as requirement too
const tierGrowth = 2.5;

/**
 * Generates all upgrades*/
function generateUpgrades(limitedVersion = false) {
    const fixedImprovements = [0.5, 0.5, 1, 1, 2, 1, 1];
    const numEndgameUpgrades = limitedVersion ? 0 : 1000 - fixedImprovements.length - 1;

    function generateInfiniteUnlocks() {
        return new Array(numEndgameUpgrades).fill(null).map((_, i) => ({
            required: [
                { shape: preparementShape, amount: 75000 + i * 10000 },
                { shape: finalGameShape, amount: 50000 + i * 7500 },
                { shape: upgradeEnchancementShape, amount: 25000 + i * 5000 },
                { shape: rocketShape, amount: 25000 + i * 5000 },
            ],
            excludePrevious: true,
        }));
    }

    // Fill in endgame upgrades
    for (let i = 0; i < numEndgameUpgrades; ++i) {
        if (i < 20) {
            fixedImprovements.push(0.1);
        } else if (i < 50) {
            fixedImprovements.push(0.05);
        } else {
            fixedImprovements.push(0.025);
        }
    }

    const upgrades = {
        belt: [{
                required: [{ shape: "CuCuCuCu", amount: 30 }],
            },
            {
                required: [{ shape: "--CuCu--", amount: 500 }],
            },
            {
                required: [{ shape: "CyCyCyCy", amount: 1000 }],
            },
            {
                required: [{ shape: "SgSgSgSg:CwCrCwCr", amount: 6000 }],
            },
            {
                required: [{ shape: "SgSgSgSg:CwCrCwCr:SgSgSgSg", amount: 25000 }],
            },
            {
                required: [{ shape: preparementShape, amount: 25000 }],
                excludePrevious: true,
            },
            {
                required: [
                    { shape: preparementShape, amount: 25000 },
                    { shape: finalGameShape, amount: 12500 },
                ],
                excludePrevious: true,
            },
            {
                required: [
                    { shape: upgradeEnchancementShape, amount: 12500 },
                    { shape: preparementShape, amount: 25000 },
                    { shape: finalGameShape, amount: 50000 },
                ],
                excludePrevious: true,
            },
            {
                required: [
                    { shape: upgradeEnchancementShape, amount: 25000 },
                    { shape: preparementShape, amount: 75000 },
                    { shape: finalGameShape, amount: 50000 },
                    { shape: rocketShape, amount: 25000 },
                ],
                excludePrevious: true,
            },
            ...generateInfiniteUnlocks(),
        ],

        miner: [{
                required: [{ shape: "RuRuRuRu", amount: 300 }],
            },
            {
                required: [{ shape: "Cu------", amount: 800 }],
            },
            {
                required: [{ shape: "SwSwSwSw", amount: 3500 }],
            },
            {
                required: [{ shape: "CwCrCwCr:WgWgWgWg", amount: 23000 }],
            },
            {
                required: [{ shape: "CrRgRrCg:CwCrCwCr:WgWgWgWg", amount: 50000 }],
            },
            {
                required: [{ shape: preparementShape, amount: 12500 }],
                excludePrevious: true,
            },
            {
                required: [
                    { shape: preparementShape, amount: 25000 },
                    { shape: finalGameShape, amount: 12500 },
                ],
                excludePrevious: true,
            },
            {
                required: [
                    { shape: upgradeEnchancementShape, amount: 50000 },
                    { shape: preparementShape, amount: 25000 },
                    { shape: finalGameShape, amount: 12500 },
                ],
                excludePrevious: true,
            },
            {
                required: [
                    { shape: upgradeEnchancementShape, amount: 75000 },
                    { shape: preparementShape, amount: 50000 },
                    { shape: finalGameShape, amount: 25000 },
                    { shape: rocketShape, amount: 25000 },
                ],
                excludePrevious: true,
            },
            ...generateInfiniteUnlocks(),
        ],

        processors: [{
                required: [{ shape: "SuSuSuSu", amount: 500 }],
            },
            {
                required: [{ shape: "RuRu----", amount: 600 }],
            },
            {
                required: [{ shape: "CrSgSgCr", amount: 3500 }],
            },
            {
                required: [{ shape: "CwCrCwCr:SgSgSgSg", amount: 25000 }],
            },
            {
                required: [{ shape: bestShape, amount: 69420 }],
            },
            {
                required: [{ shape: preparementShape, amount: 12500 }],
                excludePrevious: true,
            },
            {
                required: [
                    { shape: preparementShape, amount: 25000 },
                    { shape: finalGameShape, amount: 12500 },
                ],
                excludePrevious: true,
            },
            {
                required: [
                    { shape: upgradeEnchancementShape, amount: 50000 },
                    { shape: preparementShape, amount: 25000 },
                    { shape: finalGameShape, amount: 12500 },
                ],
                excludePrevious: true,
            },
            {
                required: [
                    { shape: upgradeEnchancementShape, amount: 75000 },
                    { shape: preparementShape, amount: 50000 },
                    { shape: finalGameShape, amount: 25000 },
                    { shape: rocketShape, amount: 25000 },
                ],
                excludePrevious: true,
            },
            ...generateInfiniteUnlocks(),
        ],

        painting: [{
                required: [{ shape: "RgRg----", amount: 600 }],
            },
            {
                required: [{ shape: "WrWrWrWr", amount: 3800 }],
            },
            {
                required: [{ shape: "RrRgRgRr:CwCwCwCw", amount: 6500 }],
            },
            {
                required: [{ shape: "WrWgWgWr:CwCwCwCw:WgWrWrWg", amount: 25000 }],
            },
            {
                required: [{ shape: "WrWgWgWr:CgCwCgCw:CwCrCwCr:WgWrWrWg", amount: 50000 }],
            },
            {
                required: [{ shape: preparementShape, amount: 12500 }],
                excludePrevious: true,
            },
            {
                required: [
                    { shape: preparementShape, amount: 25000 },
                    { shape: finalGameShape, amount: 12500 },
                ],
                excludePrevious: true,
            },
            {
                required: [
                    { shape: upgradeEnchancementShape, amount: 50000 },
                    { shape: preparementShape, amount: 25000 },
                    { shape: finalGameShape, amount: 12500 },
                ],
                excludePrevious: true,
            },
            {
                required: [
                    { shape: upgradeEnchancementShape, amount: 75000 },
                    { shape: preparementShape, amount: 50000 },
                    { shape: finalGameShape, amount: 25000 },
                    { shape: rocketShape, amount: 25000 },
                ],
                excludePrevious: true,
            },
            ...generateInfiniteUnlocks(),
        ],
    };

    // Automatically generate tier levels
    for (const upgradeId in upgrades) {
        const upgradeTiers = upgrades[upgradeId];

        let currentTierRequirements = [];
        for (let i = 0; i < upgradeTiers.length; ++i) {
            const tierHandle = upgradeTiers[i];
            tierHandle.improvement = fixedImprovements[i];
            const originalRequired = tierHandle.required.slice();

            for (let k = currentTierRequirements.length - 1; k >= 0; --k) {
                const oldTierRequirement = currentTierRequirements[k];
                if (!tierHandle.excludePrevious) {
                    tierHandle.required.unshift({
                        shape: oldTierRequirement.shape,
                        amount: oldTierRequirement.amount,
                    });
                }
            }
            currentTierRequirements.push(
                ...originalRequired.map((req) => ({
                    amount: req.amount,
                    shape: req.shape,
                }))
            );
            currentTierRequirements.forEach((tier) => {
                tier.amount = findNiceIntegerValue(tier.amount * tierGrowth);
            });
        }
    }

    return upgrades;
}

/**
 * Generates the level definitions
 * @param {boolean} limitedVersion
 */
export function generateLevelDefinitions(limitedVersion = false) {
    const levelDefinitions = [
        // 1
        // Circle
        {
            shape: "CuCuCuCu", // belts t1
            required: 30,
            reward: enumHubGoalRewards.reward_cutter_and_trash,
        },

        // 2
        // Cutter
        {
            shape: "----CuCu", //
            required: 40,
            reward: enumHubGoalRewards.no_reward,
        },

        // 3
        // Rectangle
        {
            shape: "RuRuRuRu", // miners t1
            required: 70,
            reward: enumHubGoalRewards.reward_balancer,
        },

        // 4
        {
            shape: "RuRu----", // processors t2
            required: 4,
            reward: enumHubGoalRewards.reward_rotater,
            throughputOnly: true,
        },

        // 5
        // Rotater
        {
            shape: "Cu----Cu", // belts t2
            required: 170,
            reward: enumHubGoalRewards.reward_tunnel,
        },

        // 6
        {
            shape: "Cu------", // miners t2
            required: 270,
            reward: enumHubGoalRewards.reward_painter,
        },

        // 7
        // Painter
        {
            shape: "CrCrCrCr", // unused
            required: 300,
            reward: enumHubGoalRewards.reward_rotater_ccw,
        },

        // 8
        {
            shape: "RgRg----", // painter t2
            required: 480,
            reward: enumHubGoalRewards.reward_mixer,
        },

        // 9
        // Mixing (yellow)
        {
            shape: "CyCyCyCy", // belts t3
            required: 600,
            reward: enumHubGoalRewards.reward_merger,
        },

        // 10
        // STACKER: Star shape + white
        {
            shape: "SwSwSwSw", // miners t3
            required: 800,
            reward: enumHubGoalRewards.reward_stacker,
        },

        // 11
        // Chainable miner
        {
            shape: "CrSgSgCr", // processors t3
            required: 1000,
            reward: enumHubGoalRewards.reward_miner_chainable,
        },

        // 12
        // REDprints
        {
            shape: "CrCrCrRr:CwCwCwCw",
            required: 1000,
            reward: enumHubGoalRewards.reward_blueprints,
        },

        // 13
        // Tunnel Tier 2
        {
            shape: "RrRgRgRr:CwCwCwCw", // painting t3
            required: 3800,
            reward: enumHubGoalRewards.reward_underground_belt_tier_2,
        },

        // DEMO STOPS HERE-LOL not on my watch

        // 14
        // Belt reader
        {
            shape: "Cg--CgCg:Cr--CrCr", // unused
            required: 8, // Per second!
            reward: enumHubGoalRewards.reward_belt_reader,
            throughputOnly: true,
        },

        // 15
        // Storage
        {
            shape: "SgSgSgSg:CwCrCwCr", // unused
            required: 10000,
            reward: enumHubGoalRewards.reward_storage,
        },

        // 16
        // Quad Cutter
        {
            shape: "SgSgSgSg:CwCrCwCr:SgSgSgSg", // belts t4 (two variants)
            required: 6000,
            reward: enumHubGoalRewards.reward_cutter_quad,
        },

        // 17 BEST SHAPE IN GAME, WOULD RECOMMEND, 11/10 -IGN, probably
        // Double painter
        {
            shape: bestShape, // miner t4 (two variants)
            required: 20000,
            reward: enumHubGoalRewards.reward_painter_double,
        },

        // 18
        // Rotater (180deg)
        {
            shape: "CrRgRrCg:CwCrCwCr:WgWgWgWg",
            required: 20000,
            reward: enumHubGoalRewards.reward_rotater_180,
        },

        // 19
        // Compact splitter
        {
            shape: "RwCr--Cr:Cg--Cg--",
            required: 25000,
            reward: enumHubGoalRewards.reward_splitter,
        },

        // 20
        // WIRES
        {
            shape: finalGameShape,
            required: 25000,
            reward: enumHubGoalRewards.reward_wires_painter_and_levers,
        },

        // 21
        // Filter
        {
            shape: "CrCgCrCg:CwCrCwCr:SgSgSgSg:CwCrCwCr",
            required: 25000,
            reward: enumHubGoalRewards.reward_filter,
        },

        // 22
        // Constant signal
        {
            shape: "Cr----Cg:Cw----Cw:Sg------:Cg------",
            required: 8,
            reward: enumHubGoalRewards.reward_constant_signal,
            throughputOnly: true,
        },

        // 23
        // Display
        {
            shape: "CrSgCrSg:SwCrSwCr:CgSgCgSg:CwCrCwCr",
            required: 25000,
            reward: enumHubGoalRewards.reward_display,
        },

        // 24 Logic gates
        {
            shape: "CrRgCrRg:CwCrCwCr:Sg--Sg--:--Cg--Cg",
            required: 25000,
            reward: enumHubGoalRewards.reward_logic_gates,
        },

        // 25 Virtual Processing
        {
            shape: "Rr--Rr--:--Rg--Rg:Rw--Rw--",
            required: 25000,
            reward: enumHubGoalRewards.reward_virtual_processing,
        },

        // 26 Freeplay
        {
            shape: "Sr------:--CgSrCg:CwCrCwCr:SgSgSgSg",
            required: 50000,
            reward: enumHubGoalRewards.reward_freeplay,
        },
    ];

    return levelDefinitions;
}

const fullVersionUpgrades = generateUpgrades(false);
const demoVersionUpgrades = generateUpgrades(true);

const fullVersionLevels = generateLevelDefinitions(false);
const demoVersionLevels = generateLevelDefinitions(true);

export class JFL17GameMode extends GameMode {
    constructor(root) {
        super(root);
    }

    static getId() {
        return "JFL17";
    }

    getUpgrades() {
        return this.root.app.restrictionMgr.getHasExtendedUpgrades() ? fullVersionUpgrades : demoVersionUpgrades;
    }

    getIsFreeplayAvailable() {
        return this.root.app.restrictionMgr.getHasExtendedLevelsAndFreeplay();
    }

    getBlueprintShapeKey() {
        return blueprintShape;
    }

    getLevelDefinitions() {
        return this.root.app.restrictionMgr.getHasExtendedLevelsAndFreeplay() ? fullVersionLevels : demoVersionLevels;
    }
}