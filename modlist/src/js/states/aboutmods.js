export class AboutModsState extends shapezAPI.exports.TextualGameState {
    constructor() {
        super("AboutModsState");
    }

    getStateHeaderTitle() {
        return shapezAPI.translations.aboutMods.title;
    }

    getMainContentHTML() {
        return `
            <div class="head">
                <div class="logo">
                    <img src="${shapezAPI.exports.cachebust("res/logo.png")}" alt="shapez.io Logo">
                    <span class="updateLabel">Mods</span>
                </div>
            </div>
            <div class="text">
            ${shapezAPI.translations.aboutMods.text}
            </div>
        `;
    }

    onEnter() {}
}