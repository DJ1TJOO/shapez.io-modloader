import { BaseSetting } from "./BaseSetting";

export class EnumSetting extends BaseSetting {
    constructor(id, value, options, textGetter, title, description, changeCb, enabledCb = undefined) {
        super(id, value, title, description, changeCb, enabledCb);
        this.options = options;
        this.textGetter = textGetter;
    }

    getTypeHtml() {
        return `
        <div class="value enum" data-mod-setting="${this.id}">${this.value}</div>
        `;
    }

    modify(dialogs) {
        const { optionSelected } = dialogs.showOptionChooser(this.title, {
            active: this.value,
            options: this.options.map(option => ({
                value: option,
                text: this.textGetter(option),
                desc: "",
                iconPrefix: null,
            })),
        });
        optionSelected.add(value => {
            let displayText = "???";
            const matchedInstance = this.options.indexOf(value);
            if (matchedInstance >= 0) {
                displayText = this.textGetter(value);
                this.value = value;
            } else {
                console.warn("Setting value", value, "not found for", this.id, "!");
            }
            this.getHtmlElement().innerHTML = displayText;
            //TODO:
            // if (this.restartRequired) {
            //     this.showRestartRequiredDialog();
            // }

            if (this.changeCb) {
                this.changeCb(this.value);
            }
        }, this);
    }
}