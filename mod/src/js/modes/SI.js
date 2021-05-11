const enumHubGoalRewards = shapezAPI.exports.enumHubGoalRewards;
enumHubGoalRewards.reward_research_level = "reward_research_level";
enumHubGoalRewards.no_reward_upgrades = "no_reward_upgrades";
enumHubGoalRewards.reward_shape_combiner = "reward_shape_combiner";
enumHubGoalRewards.reward_belt_crossing = "reward_belt_crossing";
enumHubGoalRewards.reward_hyperlink = "reward_hyperlink";
enumHubGoalRewards.reward_deep_miner = "reward_deep_miner";
enumHubGoalRewards.reward_smart_stacker = "reward_smart_stacker";
enumHubGoalRewards.reward_smart_cutter = "reward_smart_cutter";
enumHubGoalRewards.reward_underground_belt_tier_3 =
    "reward_underground_belt_tier_3";

const findNiceIntegerValue = shapezAPI.exports.findNiceIntegerValue;
const GameMode = shapezAPI.exports.GameMode;

const rocketShape = "Sb------:--Cb--Cb:3u------:----3r--";
const finalGameShape = "Ru1w--1w:--1w--1w:----Ru--";
const preparementShape = "CyCy--Cy:1g1g1g--:5w5w5w5w";
const blueprintShape = "Sb----Sb:CbCbCbCb:--CwCw--";

// Tiers need % of the previous tier as requirement too
const tierGrowth = 3.5;

/**
 * Generates all upgrades*/
function generateUpgrades(limitedVersion = false) {
    const fixedImprovements = [0.5, 0.5, 0.5, 1, 1.5, 1.5, 1.5];
    const numEndgameUpgrades = limitedVersion
        ? 0
        : 1000 - fixedImprovements.length - 1;

    function generateInfiniteUnlocks() {
        return new Array(numEndgameUpgrades).fill(null).map((_, i) => ({
            required: [
                { shape: preparementShape, amount: 20000 + i * 5000 },
                { shape: finalGameShape, amount: 10000 + i * 2500 },
                { shape: rocketShape, amount: 10000 + i * 2500 },
            ],
            excludePrevious: true,
        }));
    }

    // Fill in endgame upgrades
    for (let i = 0; i < numEndgameUpgrades; ++i) {
        if (i < 20) {
            fixedImprovements.push(0.1);
        } else if (i < 100) {
            fixedImprovements.push(0.05); //lvl15
        } else {
            fixedImprovements.push(0.025);
        }
    }

    const upgrades = {
        belt: [
            {
                required: [{ shape: "CuCuCuCu", amount: 150 }],
            },
            {
                required: [{ shape: "Cu----Cu", amount: 500 }],
            },
            {
                required: [{ shape: "CrCrCrCr", amount: 1500 }],
            },
            {
                required: [{ shape: "CgCgCwCg:Cw------", amount: 5000 }],
            },
            {
                required: [
                    { shape: "CwCcCwCc:--Cw--Cw:--Cc--Cc", amount: 10000 },
                ],
            },
            {
                required: [{ shape: preparementShape, amount: 15000 }],
                excludePrevious: true,
            },
            {
                required: [
                    { shape: preparementShape, amount: 20000 },
                    { shape: finalGameShape, amount: 30000 },
                ],
                excludePrevious: true,
            },
            ...generateInfiniteUnlocks(),
        ],

        miner: [
            {
                required: [{ shape: "RuRuRuRu", amount: 150 }],
            },
            {
                required: [{ shape: "------Ru", amount: 500 }],
            },
            {
                required: [{ shape: "RpRpRpRp", amount: 1500 }],
            },
            {
                required: [
                    { shape: "RpRbRpRb:RbRpRbRp:RpRbRpRb", amount: 5000 },
                ],
            },
            {
                required: [
                    {
                        shape: "RpRbRpRb:RrRwRrRw:RpRbRpRb:RrRwRrRw",
                        amount: 10000,
                    },
                ],
            },
            {
                required: [{ shape: preparementShape, amount: 15000 }],
                excludePrevious: true,
            },
            {
                required: [
                    { shape: preparementShape, amount: 20000 },
                    { shape: finalGameShape, amount: 30000 },
                ],
                excludePrevious: true,
            },
            ...generateInfiniteUnlocks(),
        ],

        processors: [
            {
                required: [{ shape: "SuSuSuSu", amount: 150 }],
            },
            {
                required: [{ shape: "----Su--", amount: 500 }],
            },
            {
                required: [{ shape: "SwSwSwSw", amount: 1500 }],
            },
            {
                required: [{ shape: "----Sw--:--SpSwSp", amount: 5000 }],
            },
            {
                required: [
                    { shape: "Sg----Sg:----SbSb:SuSuSu--", amount: 10000 },
                ],
            },
            {
                required: [{ shape: preparementShape, amount: 15000 }],
                excludePrevious: true,
            },
            {
                required: [
                    { shape: preparementShape, amount: 20000 },
                    { shape: finalGameShape, amount: 30000 },
                ],
                excludePrevious: true,
            },
            ...generateInfiniteUnlocks(),
        ],

        painting: [
            {
                required: [{ shape: "RbRb----", amount: 150 }],
            },
            {
                required: [{ shape: "----Cg--", amount: 500 }],
            },
            {
                required: [{ shape: "WyRrWyRr", amount: 1500 }],
            },
            {
                required: [{ shape: "WrWgWbWw:WbWwWrWg", amount: 5000 }],
            },
            {
                required: [
                    { shape: "----WwWy:Wp--Ww--:--WcWw--", amount: 10000 },
                ],
            },
            {
                required: [{ shape: preparementShape, amount: 15000 }],
                excludePrevious: true,
            },
            {
                required: [
                    { shape: preparementShape, amount: 20000 },
                    { shape: finalGameShape, amount: 30000 },
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
        {
            //1
            shape: "CuCuCuCu", //belt t1
            required: 20,
            reward: enumHubGoalRewards.reward_cutter_and_trash,
        },
        {
            //2
            shape: "----CuCu",
            required: 30,
            reward: enumHubGoalRewards.no_reward_upgrades,
        },
        {
            //3
            shape: "RuRuRuRu", // miner t1
            required: 50,
            reward: enumHubGoalRewards.no_reward,
        },
        {
            //4
            shape: "RuRu----",
            required: 70,
            reward: enumHubGoalRewards.reward_rotater,
        },
        {
            //5
            shape: "Cu----Cu", //belt t2
            required: 80,
            reward: enumHubGoalRewards.reward_balancer,
        },
        //now we can ramp up numbers
        {
            //6
            shape: "SuSuSuSu", //cutting t1
            required: 100,
            reward: enumHubGoalRewards.no_reward,
        },
        {
            //7
            shape: "--SuSu--",
            required: 120,
            reward: enumHubGoalRewards.reward_tunnel,
        },
        {
            //8
            shape: "----Su--", //cutting t2
            required: 150,
            reward: enumHubGoalRewards.reward_research_level, //t2
        },
        {
            //9
            shape: "------Ru", // miner t2
            required: 200,
            reward: enumHubGoalRewards.reward_painter,
        },
        //ok, now paint fun
        {
            //10
            shape: "CrCrCrCr", // belt t3
            required: 100,
            reward: enumHubGoalRewards.reward_rotater_ccw,
        },
        {
            //11
            shape: "RbRb----", //paint t1
            required: 150,
            reward: enumHubGoalRewards.reward_miner_chainable,
        },
        {
            //12
            shape: "----Cg--", // paint t2
            required: 200,
            reward: enumHubGoalRewards.reward_mixer,
        },
        //now color mixing, 3 more levels including white to unlock stacking
        {
            //13
            shape: "RpRpRpRp", // miner t3
            required: 300,
            reward: enumHubGoalRewards.reward_research_level, //t3
        },
        {
            //14
            shape: "----CcCc",
            required: 400,
            reward: enumHubGoalRewards.reward_rotater_180,
        },
        {
            //15
            shape: "SwSwSwSw", //cutting t3
            required: 500,
            reward: enumHubGoalRewards.reward_stacker,
        },
        //20 MUST be blueprints, we get 5 stacker levels
        {
            shape: "CgScScCg",
            required: 600,
            reward: enumHubGoalRewards.reward_merger,
        },
        {
            shape: "WyRrWyRr", //paint t3
            required: 700,
            reward: enumHubGoalRewards.reward_belt_reader,
        },
        {
            shape: "SpSpSpSp:CwCwCwCw",
            required: 800,
            reward: enumHubGoalRewards.reward_research_level,
        },
        {
            shape: "RyCgRyCg:SrCrSrCr",
            required: 900,
            reward: enumHubGoalRewards.reward_deep_miner,
        },
        {
            shape: "Sb----Sb:CbCbCbCb:--CwCw--",
            required: 1000,
            reward: enumHubGoalRewards.reward_blueprints,
        },
        //5 more standard shapes
        {
            shape: "RbWwRbWw:CbWwCbWw",
            required: 1200,
            reward: enumHubGoalRewards.reward_storage,
        },
        {
            shape: "RpCpRpCp:Sb--Sb--:CcCcCcCc",
            required: 1400,
            reward: enumHubGoalRewards.reward_cutter_quad,
        },
        {
            shape: "WyWgWgWy:SrSrSrSr:CyCgCgCy",
            required: 1600,
            reward: enumHubGoalRewards.reward_underground_belt_tier_2,
        },
        {
            shape: "--SrSr--:SuCwCwSu:WrWrWrWr",
            required: 1800,
            reward: enumHubGoalRewards.reward_research_level, //t5-merged shapes included
        },
        {
            shape: "--Rw--Rw:SgRgSgRg:--Rw--Rw:CcCcCcCc",
            required: 2000,
            reward: enumHubGoalRewards.reward_shape_combiner,
        },
        //now merging.............
        {
            shape: "1c1c1y1y",
            required: 2400,
            reward: enumHubGoalRewards.reward_painter_double,
        },
        {
            shape: "2wCg2wCg:2wCg2wCg",
            required: 2800,
            reward: enumHubGoalRewards.reward_splitter,
        },
        {
            shape: "--3b3b3b:--1r1r1r:--6w6w6w",
            required: 3200,
            reward: enumHubGoalRewards.reward_smart_stacker,
        },
        {
            shape: "CyCy--Cy:1g1g1g--:5w5w5w5w",
            required: 3600,
            reward: enumHubGoalRewards.reward_research_level,
        },
        {
            shape: "Ru1w--1w:--1w--1w:----Ru--",
            required: 4000,
            reward: enumHubGoalRewards.reward_belt_crossing,
        },
        //now the last 10 levels
        {
            shape: "4rRg4rRg:1w1r1w1r:SgSgSgSg",
            required: 4500,
            reward: enumHubGoalRewards.reward_wires_painter_and_levers,
        },
        {
            shape: "Cb2bCb2b:--Sy----:CwSrCw3c",
            required: 5000,
            reward: enumHubGoalRewards.reward_smart_cutter,
        },
        {
            shape: "1r2r2r1r:Cw2r2rCw:Cg----Cg",
            required: 5500,
            reward: enumHubGoalRewards.reward_underground_belt_tier_3,
        },
        {
            shape: "2b2u2b2u:3rCr--Cr:----Rr--:CwCwCwCw",
            required: 6000,
            reward: enumHubGoalRewards.reward_filter,
        },
        {
            shape: "Rg----Rg:--RgRg--:1w1r1w1r:SgSgSgSg",
            required: 6500,
            reward: enumHubGoalRewards.reward_constant_signal,
        },
        {
            shape: "3g3g--3g:----Sc--:2c2c--2c",
            required: 7000,
            reward: enumHubGoalRewards.reward_research_level,
        },
        {
            shape: "2rRrRr2r:CrCrCrCr:4g4w4g4w:6g6w6g6w",
            required: 7500,
            reward: enumHubGoalRewards.reward_logic_gates,
        },
        {
            shape: "--Sw--Sw:--Sc--Sc:Cc--Cc--:--Sw--Sw",
            required: 8000,
            reward: enumHubGoalRewards.reward_hyperlink,
        },
        {
            shape: "2b2b2b2b:CwSySyCw:--3w3w--:2c----2c",
            required: 9000,
            reward: enumHubGoalRewards.reward_virtual_processing,
        },
        {
            shape: "Sb------:--Cb--Cb:3u------:----3r--",
            required: 10000,
            reward: enumHubGoalRewards.reward_freeplay,
        },
        /*
3u3u--3u:----Su--:2u2u--2u stingray
1u2u2u1u
*/
    ];

    return levelDefinitions;
}

const fullVersionUpgrades = generateUpgrades(false);
const demoVersionUpgrades = generateUpgrades(true);

const fullVersionLevels = generateLevelDefinitions(false);
const demoVersionLevels = generateLevelDefinitions(true);

export class SIGameMode extends GameMode {
    constructor(root) {
        super(root);
    }

    static getId() {
        return "ShapezIndustries";
    }

    static getType() {
        return "defaultModeType";
    }

    getUpgrades() {
        return this.root.app.restrictionMgr.getHasExtendedUpgrades()
            ? fullVersionUpgrades
            : demoVersionUpgrades;
    }

    getIsFreeplayAvailable() {
        return this.root.app.restrictionMgr.getHasExtendedLevelsAndFreeplay();
    }

    getBlueprintShapeKey() {
        return blueprintShape;
    }

    getLevelDefinitions() {
        return this.root.app.restrictionMgr.getHasExtendedLevelsAndFreeplay()
            ? fullVersionLevels
            : demoVersionLevels;
    }
}
