import { AboutModsState } from "./aboutmods";

export class ModsState extends shapezAPI.exports.TextualGameState {
    constructor() {
        super("ModsState");
    }

    getStateHeaderTitle() {
        return shapezAPI.translations.mods.title;
    }

    getMainContentHTML() {
        return `<div class="sidebar">
                    <button class="styledButton categoryButton" data-category-btn="installedMods">${shapezAPI.translations.mods.categories.installedmods}</button>
                    <button class="styledButton categoryButton" data-category-btn="exploreMods">${shapezAPI.translations.mods.categories.exploreMods}</button>
                    <button class="styledButton categoryButton" data-category-btn="exploreModpacks">${shapezAPI.translations.mods.categories.exploreModpacks}</button>
                    <div class="other">
                        <button class="styledButton aboutButton" data-category-btn="exploreModpacks">${shapezAPI.translations.aboutMods.title}</button>
                    </div>
                </div>

                <div class="categoryContainer">
                    <div class="category" data-category="installedMods">
                    </div>
                    <div class="category" data-category="exploreMods">
                    </div>
                    <div class="category" data-category="exploreModpacks">
                    </div>
                </div>
                `;
    }

    onEnter() {
        const links = this.htmlElement.querySelectorAll("a[href]");
        links.forEach(link => {
            this.trackClicks(
                link,
                () => this.app.platformWrapper.openExternalLink(link.getAttribute("href")), { preventClick: true }
            );
        });

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

        this.htmlElement.querySelector(".category").classList.add("active");
        this.htmlElement.querySelector(".categoryButton").classList.add("active");
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

ModsState.setAPI = () => {
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

    shapezAPI.exports.MainMenuState.extraSmallButtons.push({
        htmlClass: "CreateModButton",
        text: shapezAPI.translations.mainMenu.createMod,
        action: mainMenuState => () => {
            mainMenuState.app.analytics.trackUiClick("create_mod");
            const data = "http://thomasbrants.nl:3000/mods/"; //change to pull current basic mods file and download
            const filename = "Basic_mod_layout.js";
            shapezAPI.exports.generateFileDownload(filename, data);
        },
    });
};