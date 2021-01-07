import { BoolSetting } from "../settings/BoolSetting";
import { EnumSetting } from "../settings/EnumSettings";
import { RangeSetting } from "../settings/RangeSetting";

export class ModSettingsState extends shapezAPI.exports.TextualGameState {
    constructor() {
        super("ModSettingsState");
        this.settings = {};
    }

    getStateHeaderTitle() {
        return shapezAPI.mods.get(ModSettingsState.modId).title + " " + shapezAPI.translations.settings.title;
    }

    getMainContentHTML() {
        return `
            ${this.getSettings()}
        `;
    }

    getSettings() {
        let html = "";
        const settings = shapezAPI.mods.get(ModSettingsState.modId).settings;
        for (const setting in settings) {
            if (!settings.hasOwnProperty(setting)) continue;
            if (settings[setting].type === "bool") {
                const bool = new BoolSetting(
                    setting,
                    settings[setting].value,
                    settings[setting].title,
                    settings[setting].description,
                    value => {
                        settings[setting].value = value;
                        shapezAPI.mods.get(ModSettingsState.modId).updateStaticSettings();
                    },
                    () => {
                        return settings[setting].enabled();
                    }
                );
                html += bool.getHtml();
                this.settings[setting] = bool;
            } else if (settings[setting].type === "enum") {
                const enumSetting = new EnumSetting(
                    setting,
                    settings[setting].value,
                    settings[setting].options,
                    settings[setting].textGetter,
                    settings[setting].title,
                    settings[setting].description,
                    value => {
                        settings[setting].value = value;
                        shapezAPI.mods.get(ModSettingsState.modId).updateStaticSettings();
                    },
                    () => {
                        return settings[setting].enabled();
                    }
                );
                html += enumSetting.getHtml();
                this.settings[setting] = enumSetting;
            } else if (settings[setting].type === "range") {
                const range = new RangeSetting(
                    setting,
                    settings[setting].value,
                    settings[setting].min,
                    settings[setting].max,
                    settings[setting].stepSize,
                    settings[setting].title,
                    settings[setting].description,
                    value => {
                        settings[setting].value = value;
                        shapezAPI.mods.get(ModSettingsState.modId).updateStaticSettings();
                    },
                    () => {
                        return settings[setting].enabled();
                    }
                );
                html += range.getHtml();
                this.settings[setting] = range;
            }
        }
        return html;
    }

    onEnter() {
        for (const setting in this.settings) {
            if (!this.settings.hasOwnProperty(setting)) continue;
            this.settings[setting].setup();
            this.trackClicks(
                this.settings[setting].getHtmlElement(),
                () => {
                    this.settings[setting].modify(this.dialogs);
                }, { preventDefault: false }
            );
        }
    }
}

ModSettingsState.modId = undefined;