export class SmartBalancerComponent extends shapezAPI.exports.Component {
    static getId() {
        return "SmartBalancer";
    }

    /**
     *
     * @param {object} param0
     * @param {string=} param0.variant The variant of the smart balancer
     * @param {number=} param0.rotationVariant The rotation variant of the smart balancer
     */
    constructor({ variant }) {
        super();

        this.variant = variant;
    }
}