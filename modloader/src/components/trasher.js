export class TrasherComponent extends window["shapezAPI"].exports.Component {
    static getId() {
        return "Trasher";
    }

    static getSchema() {
        return {
            nextOutputSlot: window["shapezAPI"].exports.types.uint,
        };
    }

    constructor({ inputsPerCharge = 1 }) {
        super();

        this.nextOutputSlot = 0;

        this.inputsPerCharge = inputsPerCharge;

        this.inputSlots = [];

        this.ongoingCharges = [];

        this.bonusTime = 0;
    }

    tryTakeItem(item, sourceSlot) {
        this.inputSlots.push({ item, sourceSlot });
        return true;
    }
}