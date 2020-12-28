export class AboutModloaderState extends window["shapezAPI"].exports.TextualGameState {
    constructor() {
        super("AboutModloaderState");
        /* typehist:start */
        this.htmlElement = "";
        /* typehints:end */
    }

    getStateHeaderTitle() {
        return "About modloader";
    }

    getMainContentHTML() {
        return `
            <div class="head">
                <img src="${window["shapezAPI"].exports.cachebust("res/logo.png")}" alt="shapez.io Logo">
            </div>
            <div class="text">
            This is the about page for the modloader
            </div>
        `;
    }

    onEnter() {}

    getDefaultPreviousState() {
        return "SettingsState";
    }
}