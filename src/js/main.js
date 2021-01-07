import "./core/polyfills";
import "./core/assert";
import "./core/error_handler";

import { createLogger, logSection } from "./core/logging";
import { Application } from "./application";
import { IS_DEBUG } from "./core/config";
import { addVanillaComponentsToAPI, initComponentRegistry } from "./game/component_registry";
import { initDrawUtils } from "./core/draw_utils";
import { addVanillaItemsToAPI, initItemRegistry } from "./game/item_registry";
import { addVanillaBuildingsToAPI, initMetaBuildingRegistry } from "./game/meta_building_registry";
import { addVanillaGameSpeedToAPI, initGameSpeedRegistry } from "./game/game_speed_registry";
import { ModManager } from "./modloader/modmanager";
import { addVanillaSystemsToAPI } from "./game/game_system_manager";
import { addVanillaGameModesToAPI } from "./game/game_mode_registry";
const logger = createLogger("main");
(async() => {
    if (window.coreThreadLoadedCb) {
        logger.log("Javascript parsed, calling html thread");
        window.coreThreadLoadedCb();
    }

    // Logrocket
    // if (!G_IS_DEV && !G_IS_STANDALONE) {
    //     const monthlyUsers = 300; // thousand
    //     const logrocketLimit = 10; // thousand
    //     const percentageOfUsers = logrocketLimit / monthlyUsers;

    //     if (Math.random() <= percentageOfUsers) {
    //         logger.log("Analyzing this session with logrocket");
    //         const logrocket = require("logrocket");
    //         logrocket.init("p1x9zh/shapezio");

    //         try {
    //             logrocket.getSessionURL(function (sessionURL) {
    //                 logger.log("Connected lockrocket to GA");
    //                 // @ts-ignore
    //                 try {
    //                     window.ga("send", {
    //                         hitType: "event",
    //                         eventCategory: "LogRocket",
    //                         eventAction: sessionURL,
    //                     });
    //                 } catch (ex) {
    //                     logger.warn("Logrocket connection to analytics failed:", ex);
    //                 }
    //             });
    //         } catch (ex) {
    //             logger.warn("Logrocket connection to analytics failed:", ex);
    //         }
    //     }
    // }

    console.log(
        `%cshapez.io ️%c\n© 2020 Tobias Springer IT Solutions\nCommit %c${G_BUILD_COMMIT_HASH}%c on %c${new Date(
            G_BUILD_TIME
        ).toLocaleString()}\n`,
        "font-size: 35px; font-family: Arial;font-weight: bold; padding: 10px 0;",
        "color: #aaa",
        "color: #7f7",
        "color: #aaa",
        "color: #7f7"
    );

    console.log("Environment: %c" + G_APP_ENVIRONMENT, "color: #fff");

    if (G_IS_DEV && IS_DEBUG) {
        console.log("\n%c🛑 DEBUG ENVIRONMENT 🛑\n", "color: #f77");
    }

    /* typehints:start */
    // @ts-ignore
    assert(false, "typehints built in, this should never be the case!");
    /* typehints:end */

    /* dev:start */
    console.log("%cDEVCODE BUILT IN", "color: #f77");
    /* dev:end */

    logSection("Boot Process", "#f9a825");

    var modpack = {
        mods: [{
                url: "http://localhost:3006/mod",
                id: "a18121cf-fc7c-4f23-906d-b7ab0512bbc8",
                config: {},
                settings: {
                    hasMakeModButton: {
                        value: true,
                    },
                    // enum: {
                    //     value: "new test",
                    // },
                    // range: {
                    //     value: 10,
                    // },
                },
            },
            // {
            //     url: "http://localhost:3010/mod",
            //     id: "cbae38a0-7ac5-4a0a-9985-da3110b1a6e8",
            //     config: {},
            //     settings: {
            //         hasHubPlacement: { value: true },
            //     },
            // },
            // {
            //     url: "http://localhost:3011/mod",
            //     id: "cba4229f-851b-4f01-807f-2a0c86c3aed7",
            //     config: {},
            //     settings: {},
            // },
            {
                url: "http://localhost:3012/mod",
                id: "b6eaf06b-a0f7-48ac-b219-4e97fd275beb",
                config: {},
                settings: {},
            },
            // {
            //     url: "http://localhost:3013/mod",
            //     id: "ca2fb74a-3827-4805-b5fe-8a23bf913c65",
            //     config: {},
            //     settings: {},
            // },
            // {
            //     url: "http://localhost:3014/mod",
            //     id: "3ae3751d-6dfb-4504-92dc-99a38a3d8c06",
            //     config: {},
            //     settings: {},
            // },
        ],
    };

    let discordId = "324523",
        username = "username",
        tag = "3214";

    // @ts-ignore
    var modMgr = new ModManager(discordId, username, tag, modpack);
    addVanillaBuildingsToAPI();
    addVanillaComponentsToAPI();
    addVanillaSystemsToAPI();
    addVanillaItemsToAPI();
    addVanillaGameModesToAPI();
    addVanillaGameSpeedToAPI();
    // await modMgr.addMods([
    //     // "http://thomasbrants.nl:3000/mods/test_mods/mod1/bundle.js",
    //     // "http://thomasbrants.nl:3000/mods/test_mods/test_mod2.js",
    //     // "http://thomasbrants.nl:3000/mods/test_mods/test_mod3.js",
    //     "http://localhost:3006/mod",
    // ]);
    await modMgr.addModPackMods();
    modMgr.loadMods();

    initDrawUtils();
    initComponentRegistry();
    initItemRegistry();
    initMetaBuildingRegistry();
    initGameSpeedRegistry();

    let app = null;

    function bootApp() {
        logger.log("Page Loaded");
        app = new Application();
        app.boot();
    }
    bootApp();
})();