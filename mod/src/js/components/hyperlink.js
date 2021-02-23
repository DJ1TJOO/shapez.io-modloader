export class HyperlinkComponent extends shapezAPI.exports.Component {
    static getId() {
        return "Hyperlink";
    }

    constructor({ direction = shapezAPI.exports.enumDirection.top }) {
        super();

        this.direction = direction;
    }
}