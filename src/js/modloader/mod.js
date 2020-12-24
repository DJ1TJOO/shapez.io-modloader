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
/* typehints:start */
import { Application } from "../application";
/* typehints:end */

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

        if (this.mods.has(mod.id)) {
            console.log("Mod with mod id: " + mod.id + " already registerd");
            return;
        }

        this.mods.set(mod.id, mod);
    }

    /**
     * Adds a mod to the page
     * @param {String} url
     */
    addMod(url) {
        return new Promise((resolve, reject) => {
            var mod = document.createElement("script");
            mod.setAttribute("src", url);
            mod.setAttribute("crossorigin", "anonymous");
            mod.addEventListener("load", ev => resolve());
            document.body.appendChild(mod);
        });
    }

    /**
     * Adds a mod to the page
     * @param {Array<String>} urls
     * @param {any} callback
     */
    async addMods(urls, callback) {
        var calls = [];
        for (let i = 0; i < urls.length; i++) {
            const url = urls[i];
            calls.push(this.addMod(url));
        }
        await Promise.all(calls).then(() => callback());
    }

    /**
     * Loads all mods in the mods list
     */
    loadMods() {
        window["shapezAPI"].mods = this.mods;
        for (const [id, mod] of this.mods.entries()) {
            this.loadMod(id);
        }
    }

    /**
     * Calls the main mod function
     * @param {String} id
     */
    loadMod(id) {
        this.mods.get(id).main();
    }
}

export class ShapezAPI {
    constructor() {
        this.exports = {
            //class name: import
        };

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