import { JFL17GameMode } from "./modes/JFL17";

const modId = "b89404ac-7cbc-45bf-81b7-7d4d8108faf0";
registerMod({
    title: "JFL17 Classic",
    id: modId,
    description: "The shape and mod you never asked for but always wanted. Hard facts",
    authors: ["DJ1TJOO", "SargeanTravis"],
    version: "1.0.0",
    gameVersion: "ML01",
    dependencies: [],
    incompatible: [],
    settings: {},
    translations: {
        en: {
            [modId]: {
                description: "The shape and mod you never asked for but always wanted. Hard facts",
            },
            dialogs: {
                blueprintsNotUnlocked: {
                    desc: "Complete level 12 to unlock Redprints!",
                },
            },
            ingame: {
                keybindingsOverlay: {
                    pasteLastBlueprint: "Paste last redprint",
                },
                pasteLastBlueprint: "Paste last redprint",
            },
            storyRewards: {
                reward_blueprints: {
                    title: "Redprints",
                    desc: "You can now <strong>copy and paste</strong> parts of your factory! Select an area (Hold CTRL, then drag with your mouse), and press 'C' to copy it.<br><br>Pasting it is <strong>not free</strong>, you need to produce <strong>redprint shapes</strong> to afford it! (Those you just delivered).",
                },
            },
            keybindings: {
                mappings: {
                    pasteLastBlueprint: "Paste last redprint",
                },
            },
        },
    },
    updateStaticSettings: () => {},
    updateStaticTranslations: (id) => {},
    gameInitializedRootClasses: (root) => {
        root.gameMode = new JFL17GameMode(root);
    },
    gameInitializedRootManagers: (root) => {},
    gameBeforeFirstUpdate: (root) => {},
    main: (config) => {
        //JFL17:
        // - Trigger gameOver when itemprocessor detects new lvl 17 shape
        // - Added gameOver:
        //     * Back to level 1
        //     * Clear rewards
        //     * Clear upgrades
        //     * Rerender pinned shapes
        //     * Gameover notification
        //     * Delete random entities
        // - Change level shapes
        // - Changed rocket-/finalGame-/Blueprintshape
        // - Added bestShape (old lvl 17) and preparementShape (same as best shape)
        // - Removed second dairy colors random colorset
        // - Changed some translation stuff (Without hints)

        //Remove second dairy colors and blue random colorset
        shapezAPI.ingame.hub_goals.prototype.generateRandomColorSet = function(rng, allowUncolored = false) {
            const colorWheel = [shapezAPI.exports.enumColors.red, shapezAPI.exports.enumColors.green, shapezAPI.exports.enumColors.red];

            const universalColors = [shapezAPI.exports.enumColors.white];
            if (allowUncolored) {
                universalColors.push(shapezAPI.exports.enumColors.uncolored);
            }
            const index = rng.nextIntRange(0, colorWheel.length - 2);
            const pickedColors = colorWheel.slice(index, index + 3);
            pickedColors.push(rng.choice(universalColors));
            return pickedColors;
        };

        shapezAPI.ingame.hub_goals.prototype.gameOverTriggered = false;

        /**
         * Triggers game over for this savegame.
         * In normal game mode, you can lose infinitely.
         */
        shapezAPI.ingame.hub_goals.prototype.gameOver = function() {
            if (this.gameOverTriggered) {
                return;
            }

            this.gameOverTriggered = true;
            this.level = 1;
            this.computeNextGoal();

            // Clear all rewards (prevents bugs from appearing)
            for (const reward in this.gainedRewards) {
                this.gainedRewards[reward] = 0;
            }

            // Clear all stored shapes in the hub
            for (const hash in this.storedShapes) {
                this.storedShapes[hash] = 0;
            }

            // Clear all upgrades
            for (const upgrade in this.upgradeLevels) {
                this.upgradeLevels[upgrade] = 0;
            }

            // Reset pinned shapes appearance
            this.root.hud.parts.pinnedShapes.rerenderFull();

            this.root.hud.signals.notification.dispatch("Why did you have to do that? Enjoy your game!", shapezAPI.exports.enumNotificationType.upgrade);

            let current = 5000;
            const randomEntities = [...this.root.entityMgr.entities].sort(() => {
                return Math.round(Math.random() * 2) - 1;
            });
            for (const entity of randomEntities) {
                current = Math.pow(current, 0.99);
                if (entity.components.StaticMapEntity) {
                    setTimeout(() => {
                        // Creating a function for every entity is slow
                        // but this is just for evil shape, so it's
                        // acceptable
                        this.root.logic.tryDeleteBuilding(entity);
                    }, current);
                }
            }

            setTimeout(() => {
                this.root.hud.parts.dialogs.showWarning("Game Over!", "Evil shape is never the solution.", ["ok:good"]);
            }, 5e3);
        };

        shapezAPI.exports.ItemProcessorSystem.prototype.process_HUB = function(payload) {
            const hubComponent = payload.entity.components.Hub;
            assert(hubComponent, "Hub item processor has no hub component");

            for (let i = 0; i < payload.items.length; ++i) {
                const item = payload.items[i].item;

                if (item.definition.getHash() === "Sg----Sg:CgCgCgCg:--CyCy--") {
                    // Delivering the evil shape makes you lose.
                    this.root.hubGoals.gameOver();
                    return;
                }
                this.root.hubGoals.handleDefinitionDelivered(item.definition);
            }
        };

        shapezAPI.ingame.gamemodes[JFL17GameMode.getId()] = JFL17GameMode;
    },
});