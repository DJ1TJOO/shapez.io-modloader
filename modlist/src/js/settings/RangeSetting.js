import { BaseSetting } from "./BaseSetting";

export class RangeSetting extends BaseSetting {
    constructor(id, value, min, max, stepSize, title, description, changeCb, enabledCb = undefined) {
        super(id, value, title, description, changeCb, enabledCb);
        this.min = min;
        this.max = max;
        this.stepSize = stepSize;
    }

    getTypeHtml() {
        return `
        <div class="value rangeInputContainer noPressEffect" data-mod-setting="${this.id}">
            <label>${this.value}</label>
            <input class="rangeInput" type="range" value="${this.value}" min="${this.min}" max="${this.max}" step="${this.stepSize}">
        </div>
        `;
    }

    updateLabels() {
        const value =
            // @ts-ignore
            Math.round(Number(this.getHtmlElement().querySelector(`input.rangeInput`).value * 100) / 100);
        this.getHtmlElement().querySelector(`label`).innerText = value.toString();
    }

    setup() {
        this.getHtmlElement()
            .querySelector(`input.rangeInput`)
            .addEventListener("input", () => {
                this.updateLabels();
            });

        this.getHtmlElement()
            .querySelector(`input.rangeInput`)
            .addEventListener("change", () => {
                this.modify();
            });
    }

    modify() {
        this.value =
            // @ts-ignore
            Math.round(Number(this.getHtmlElement().querySelector(`input.rangeInput`).value * 100) / 100);

        if (this.changeCb) {
            this.changeCb(this.value);
        }
    }
}