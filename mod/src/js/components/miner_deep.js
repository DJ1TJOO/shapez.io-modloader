export class MinerDeepComponent extends shapezAPI.exports.Component {
    constructor(inputsToProcess = 1) {
        super();
        this.lastMiningTime = 0;

        this.cachedMinedItem = null;
    }
    static getId() {
        return "MinerDeep";
    }
}