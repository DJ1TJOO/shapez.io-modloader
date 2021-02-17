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
        },
    },
    updateStaticSettings: () => {},
    updateStaticTranslations: (id) => {},
    gameInitializedRootClasses: (root) => {},
    gameInitializedRootManagers: (root) => {},
    gameBeforeFirstUpdate: (root) => {},
    main: (config) => {
        // - Added gameOver:
        //     * Back to level 1
        //     * Clear rewards
        //     * Clear upgrades
        //     * Rerender pinned shapes
        //     * Gameover notification
        //     * Delete random entities
        // - Removed second dairy colors random colorset
        // - Changed rocket-/finalGame-/Blueprintshape
        // - Added bestShape (old lvl 17) and preparementShape (same as best shape)
        // - Changed some translation stuff
        // - Trigger gameOver when itemprocessor detects new lvl 17 shape
        // - Change level shapes
        shapezAPI.injectCss("**{css}**", modId);
    },
});