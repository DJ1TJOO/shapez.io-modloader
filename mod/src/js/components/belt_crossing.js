export class BeltCrossingComponent extends shapezAPI.exports.Component {
    constructor(inputsToProcess = 1) {
        super();
        this.inputSlots = [];
        this.inputsToProcess = inputsToProcess;
    }
    static getId() {
        return "BeltCrossing";
    }
    tryTakeItem(item, sourceSlot) {
        // Check that we only take one item per slot
        for (let i = 0; i < this.inputSlots.length; ++i) {
            const slot = this.inputSlots[i];
            if (slot.sourceSlot === sourceSlot) {
                return false;
            }
        }

        this.inputSlots.push({ item, sourceSlot });
        return true;
    }
}

shapezAPI.ingame.systems.find((x) => x.getId() === shapezAPI.exports.ItemEjectorSystem.getId()).tryPassOverItemComponents.BeltCrossing = (comp, item, receiver, slotIndex, itemEjector) => {
    // Its an item belt crossing ..
    if (comp.tryTakeItem(item, slotIndex)) {
        return true;
    }
    // Belt crossing can have nothing else
    return false;
};