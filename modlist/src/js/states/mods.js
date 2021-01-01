import { AboutModsState } from "./aboutmods";
import { ModSettingsState } from "./modsettings";

export class ModsState extends shapezAPI.exports.TextualGameState {
    constructor() {
        super("ModsState");
    }

    getStateHeaderTitle() {
        return shapezAPI.translations.mods.title;
    }

    getMainContentHTML() {
        return `<div class="sidebar">
                    <button class="styledButton categoryButton" data-category-btn="installedMods">${
                        shapezAPI.translations.mods.categories.installedmods
                    }</button>
                    <button class="styledButton categoryButton" data-category-btn="exploreMods">${
                        shapezAPI.translations.mods.categories.exploreMods
                    }</button>
                    <button class="styledButton categoryButton" data-category-btn="exploreModpacks">${
                        shapezAPI.translations.mods.categories.exploreModpacks
                    }</button>
                    <div class="other">
                        <button class="styledButton aboutButton" data-category-btn="exploreModpacks">${
                            shapezAPI.translations.aboutMods.title
                        }</button>
                    </div>
                </div>

                <div class="categoryContainer">
                    <div class="category" data-category="installedMods">
                        ${this.getMods()}
                    </div>
                    <div class="category" data-category="exploreMods">
                    </div>
                    <div class="category" data-category="exploreModpacks">
                    </div>
                </div>
                `;
    }

    getMods() {
        let html = "";
        for (const [modId, mod] of shapezAPI.mods) {
            html += `<a class="setting cardbox enabled mod-settings-card-${modId}">
                <div class="row"><label>${mod.title}</label></div>
                <div class="desc">${mod.description}</div>
            </a>`;
        }
        return html;
    }

    onEnter() {
        const links = this.htmlElement.querySelectorAll("a[href]");
        links.forEach(link => {
            this.trackClicks(
                link,
                () => this.app.platformWrapper.openExternalLink(link.getAttribute("href")), { preventClick: true }
            );
        });

        this.initCategoryTrackClicks();

        this.htmlElement.querySelector(".category").classList.add("active");
        this.htmlElement.querySelector(".categoryButton").classList.add("active");
    }

    initCategoryTrackClicks() {
        const installedMods = this.htmlElement.querySelector("[data-category-btn='installedMods']");
        this.trackClicks(
            installedMods,
            () => {
                this.setActiveCategory("installedMods");
            }, { preventDefault: false }
        );

        const exploreMods = this.htmlElement.querySelector("[data-category-btn='exploreMods']");
        this.trackClicks(
            exploreMods,
            () => {
                this.setActiveCategory("exploreMods");
            }, { preventDefault: false }
        );

        const exploreModpacks = this.htmlElement.querySelector("[data-category-btn='exploreModpacks']");
        this.trackClicks(
            exploreModpacks,
            () => {
                this.setActiveCategory("exploreModpacks");
            }, { preventDefault: false }
        );

        const about = this.htmlElement.querySelector(".aboutButton");
        this.trackClicks(
            about,
            () => {
                this.moveToStateAddGoBack("AboutModsState");
            }, { preventDefault: false }
        );

        for (const [modId, mod] of shapezAPI.mods) {
            this.trackClicks(
                this.htmlElement.querySelector(`.mod-settings-card-${modId}`),
                () => {
                    ModSettingsState.modId = modId;
                    this.moveToStateAddGoBack("ModSettingsState");
                }, { preventClick: true }
            );
        }
    }

    setActiveCategory(category) {
        const previousCategory = this.htmlElement.querySelector(".category.active");
        const previousCategoryButton = this.htmlElement.querySelector(".categoryButton.active");

        if (previousCategory.getAttribute("data-category") == category) {
            return;
        }

        previousCategory.classList.remove("active");
        previousCategoryButton.classList.remove("active");

        const newCategory = this.htmlElement.querySelector("[data-category='" + category + "']");
        const newCategoryButton = this.htmlElement.querySelector("[data-category-btn='" + category + "']");

        newCategory.classList.add("active");
        newCategoryButton.classList.add("active");
    }
}

const createModButton = text => {
    return {
        htmlClass: "CreateModButton",
        text: text,
        action: mainMenuState => () => {
            mainMenuState.app.analytics.trackUiClick("create_mod");
            const data = "http://thomasbrants.nl:3000/mods/"; //change to pull current basic mods file and download
            const filename = "Basic_mod_layout.js";
            shapezAPI.exports.generateFileDownload(filename, data);
        },
    };
};

ModsState.setAPI = modId => {
    shapezAPI.exports.MainMenuState.extraTopButtons.push({
        htmlClass: "mods-list-button",
        htmlData: "data-icon='main_menu/mods.png'",
    });

    shapezAPI.exports.MainMenuState.extraTrackClicks.push({
        htmlElement: ".mods-list-button",
        action: mainMenuState => () => {
            mainMenuState.moveToState("ModsState");
        },
        options: {
            preventDefault: false,
        },
    });

    if (shapezAPI.mods.get(modId).settings.hasMakeModButton.value) {
        shapezAPI.exports.MainMenuState.extraSmallButtons.push(
            createModButton(shapezAPI.translations.mainMenu.createMod)
        );
    }
};

ModsState.updateStaticTranslations = (modId, id) => {
    if (shapezAPI.mods.get(modId).settings.hasMakeModButton.value)
        shapezAPI.exports.MainMenuState.extraSmallButtons.find(o => o.htmlClass === "CreateModButton").text =
        shapezAPI.translations.mainMenu.createMod;
};

ModsState.updateStaticSettings = modId => {
    if (shapezAPI.mods.get(modId).settings.hasMakeModButton.value) {
        shapezAPI.exports.MainMenuState.extraSmallButtons.push(
            createModButton(shapezAPI.translations.mainMenu.createMod)
        );
    } else {
        shapezAPI.exports.MainMenuState.extraSmallButtons.splice(
            shapezAPI.exports.MainMenuState.extraSmallButtons.findIndex(
                o => o.htmlClass === "CreateModButton"
            ),
            1
        );
    }
};