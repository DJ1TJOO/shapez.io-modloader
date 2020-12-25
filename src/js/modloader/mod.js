/**
 * @typedef {{
 * title: String,
 * id: String,
 * description: String,
 * authors: Array<String>,
 * version: String,
 * gameVersion: number,
 * dependencies: Array<String>,
 * incompatible: Array<String>,
 * main: Function,
 * }} ModInfo
 */

const INFOType = {
    title: "",
    id: "",
    description: "",
    authors: [],
    version: "",
    gameVersion: 0,
    dependencies: [],
    incompatible: [],
    main: () => {},
};
import { Vector } from "../core/vector";
import { MetaBuilding } from "../game/meta_building";

const Toposort = require("toposort-class");

export class ModManager {
    constructor() {
        /** @type {Map<String, ModInfo>} */
        this.mods = new Map();

        window["shapezAPI"] = new ShapezAPI();

        /**
         * Registers a mod
         * @param {ModInfo} mod
         */
        window.registerMod = mod => {
            this.registerMod(mod);
        };
    }

    registerMod(mod) {
        //TODO: add more checks like is id a uuid and check dependecies and incompatiablile
        for (const key in INFOType) {
            if (!INFOType.hasOwnProperty(key)) continue;
            if (mod.hasOwnProperty(key)) continue;

            if (mod.id) console.log("Mod with mod id: " + mod.id + " has no " + key + " specified");
            else console.log("Unknown mod has no " + key + " specified");

            return;
        }

        if (!mod.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
            console.log("Mod with mod id: " + mod.id + " has no uuid");
            return;
        }

        if (this.mods.has(mod.id)) {
            console.log("Mod with mod id: " + mod.id + " already registerd");
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
                err(this, "Failed to load mod:", err);
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
                err(this, "Failed to initializing mod:", err);
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
        window["shapezAPI"].mods = this.mods;

        var sorter = new Toposort();
        for (const [id, mod] of this.mods.entries()) {
            sorter.add(id, mod.dependencies);
        }

        var sortedKeys = sorter.sort().reverse();
        for (let i = 0; i < sortedKeys.length; i++) {
            this.loadMod(sortedKeys[i]);
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
                console.log(
                    "Mod with mod id: " + mod.id + " is disabled because it's incompatible with " + id
                );
                return;
            }
        }
        mod.main();
    }
}

export class ShapezAPI {
    constructor() {
        this.exports = { MetaBuilding, Vector };

        this.mods = new Map();

        this.ingame = {
            buildings: {},
            components: {},
            systems: {},
            items: {},
            levels: {},
            themes: {},
            hub_goals: {},
        };
    }
}