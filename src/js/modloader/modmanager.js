import { ShapezAPI } from "./mod";

const Toposort = require("toposort-class");

const INFOType = {
    title: "",
    id: "",
    description: "",
    authors: [],
    version: "",
    gameVersion: 0,
    dependencies: [],
    incompatible: [],
    gameInitializedRootClasses: root => {},
    gameInitializedRootManagers: root => {},
    gameBeforeFirstUpdate: root => {},
    main: () => {},
};

export class ModManager {
    constructor() {
        /** @type {Map<String, import("./mod").ModInfo>} */
        this.mods = new Map();

        window["shapezAPI"] = new ShapezAPI();

        /**
         * Registers a mod
         * @param {import("./mod").ModInfo} mod
         */
        window["registerMod"] = mod => {
            this.registerMod(mod);
        };
    }

    registerMod(mod) {
        for (const key in INFOType) {
            if (!INFOType.hasOwnProperty(key)) continue;
            if (mod.hasOwnProperty(key)) continue;

            if (mod.id) console.warn("Mod with mod id: " + mod.id + " has no " + key + " specified");
            else console.warn("Unknown mod has no " + key + " specified");

            return;
        }

        if (!mod.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
            console.warn("Mod with mod id: " + mod.id + " has no uuid");
            return;
        }

        if (this.mods.has(mod.id)) {
            console.warn("Mod with mod id: " + mod.id + " already registerd");
            return;
        }

        this.mods.set(mod.id, mod);
    }

    /**
     * Adds a mod to the page
     * @param {String} url
     * @returns {Promise}
     */
    addMod(url) {
        return Promise.race([
                new Promise((resolve, reject) => {
                    setTimeout(reject, 60 * 1000);
                }),
                fetch(url, {
                    method: "GET",
                    cache: "no-cache",
                }),
            ])
            .then(res => res.text())
            .catch(err => {
                assert(this, "Failed to load mod:", err);
                return Promise.reject("Downloading from '" + url + "' timed out");
            })
            .then(modCode => {
                return Promise.race([
                    new Promise((resolve, reject) => {
                        setTimeout(reject, 60 * 1000);
                    }),
                    new Promise((resolve, reject) => {
                        this.nextModResolver = resolve;
                        this.nextModRejector = reject;

                        const modScript = document.createElement("script");
                        modScript.textContent = modCode;
                        modScript.type = "text/javascript";
                        try {
                            document.head.appendChild(modScript);
                            resolve();
                        } catch (ex) {
                            console.error("Failed to insert mod, bad js:", ex);
                            this.nextModResolver = null;
                            this.nextModRejector = null;
                            reject("Mod is invalid");
                        }
                    }),
                ]);
            })
            .catch(err => {
                assert(this, "Failed to initializing mod:", err);
                return Promise.reject("Initializing mod failed: " + err);
            });
    }

    /**
     * Adds a mod to the page
     * @param {Array<String>} urls
     */
    addMods(urls) {
        let promise = Promise.resolve(null);

        for (let i = 0; i < urls.length; ++i) {
            const url = urls[i];

            promise = promise.then(() => {
                return this.addMod(url);
            });
        }

        return promise;
    }

    /**
     * Loads all mods in the mods list
     */
    loadMods() {
        shapezAPI.mods = this.mods;

        var sorter = new Toposort();
        for (const [id, mod] of this.mods.entries()) {
            let isMissingDependecie = false;
            let missingDependecie = "";
            for (let i = 0; i < mod.dependencies.length; i++) {
                const dependencie = mod.dependencies[i];
                if (this.mods.has(dependencie)) continue;
                isMissingDependecie = true;
                missingDependecie = dependencie;
            }

            if (isMissingDependecie) {
                console.warn(
                    "Mod with mod id: " +
                    mod.id +
                    " is disabled because it's missings the dependecie " +
                    missingDependecie
                );
                continue;
            } else sorter.add(id, mod.dependencies);
        }

        shapezAPI.modOrder = sorter.sort().reverse();
        for (let i = 0; i < shapezAPI.modOrder.length; i++) {
            this.loadMod(shapezAPI.modOrder[i]);
        }
    }

    /**
     * Calls the main mod function
     * @param {String} id
     */
    loadMod(id) {
        var mod = this.mods.get(id);
        for (const [id, currentMod] of this.mods.entries()) {
            if (mod.incompatible.indexOf(id) >= 0) {
                console.warn(
                    "Mod with mod id: " + mod.id + " is disabled because it's incompatible with " + id
                );
                return;
            }
        }
        mod.main();
    }
}