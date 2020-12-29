export class FastestForwardGameSpeed extends shapezAPI.exports.BaseGameSpeed {
    constructor(root) {
        super(root);
    }

    static getId() {
        return "fastest-forward";
    }

    getTimeMultiplier() {
        return 10;
    }

    getMaxLogicStepsInQueue() {
        return 3 * 10;
    }
}