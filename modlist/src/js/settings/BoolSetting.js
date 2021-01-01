import { BaseSetting } from "./BaseSetting";

export class BoolSetting extends BaseSetting {
    constructor(id, value, title, description, changeCb, enabledCb = undefined) {
        super(id, value, title, description, changeCb, enabledCb);
    }

    getTypeHtml() {
        return `
                <div class="value checkbox ${this.value ? "checked" : ""}" data-mod-setting="${this.id}">
                <span class="knob"></span></div>
        `;
    }

    modify() {
        this.value = !this.value;
        this.getHtmlElement().classList.toggle("checked");
        if (this.changeCb) {
            this.changeCb(this.value);
        }
    }
}