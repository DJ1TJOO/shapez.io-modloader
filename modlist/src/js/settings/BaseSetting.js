export class BaseSetting {
    constructor(id, value, title, description, changeCb, enabledCb = undefined) {
        this.id = id;
        this.changeCb = changeCb;
        this.enabledCb = enabledCb;
        this.value = value;
        this.title = title;
        this.description = description;
    }

    /**
     * @returns {HTMLElement}
     */
    getHtmlElement() {
        return document.querySelector("[data-mod-setting='" + this.id + "']");
    }

    setup() {}

    getHtml() {
        const available = this.getIsAvailable();
        return `
        <div class="setting cardbox ${available ? "enabled" : "disabled"}">
            <div class="row">
                <label>${this.title}</label>
                ${this.getTypeHtml()}
            </div>
            <div class="desc">
                ${this.description}
            </div>
        </div>`;
    }

    getTypeHtml() {
        return "";
    }

    getIsAvailable() {
        return this.enabledCb ? this.enabledCb() : true;
    }
}