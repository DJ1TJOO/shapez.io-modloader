export class AboutModloaderState extends shapezAPI.exports.TextualGameState {
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
                <img src="${shapezAPI.exports.cachebust("res/logo.png")}" alt="shapez.io Logo">
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

shapezAPI.exports.SettingsState.trackClicks.push({
    htmlElement: ".aboutModloader",
    state: "AboutModloaderState",
    options: {
        preventDefault: false,
    },
});

shapezAPI.exports.SettingsState.extraSideBarButtons.push(`
    <button class="styledButton aboutModloader">About modloader</button>`);