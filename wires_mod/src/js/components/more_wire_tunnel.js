export const ConnectionDirections = {
    [shapezAPI.exports.defaultBuildingVariant]: Buildconnections([
        [new shapezAPI.exports.Vector(0, 1), new shapezAPI.exports.Vector(0, 1)],
        [new shapezAPI.exports.Vector(1, 0), new shapezAPI.exports.Vector(1, 0)],
    ]),
    double_elbow: Buildconnections([
        [new shapezAPI.exports.Vector(0, 1), new shapezAPI.exports.Vector(1, 0)],
        [new shapezAPI.exports.Vector(0, -1), new shapezAPI.exports.Vector(-1, 0)],
    ]),
    elbow: Buildconnections([
        [new shapezAPI.exports.Vector(0, 1), new shapezAPI.exports.Vector(1, 0)]
    ]),
    straight: Buildconnections([
        [new shapezAPI.exports.Vector(0, 1), new shapezAPI.exports.Vector(0, 1)]
    ]),
};

function Buildconnections(connections) {
    let res = {};
    for (let i = 0; i < connections.length; ++i) {
        assert(connections[i].length == 2, "Connection Wasn't Continuos");
        let [a, b] = connections[i];

        const ahash = a.toString();
        if (!res[ahash]) {
            res[ahash] = b;
        }
        let alta = a.rotateFastMultipleOf90(180);
        let altb = b.rotateFastMultipleOf90(180);
        const bhash = altb.toString();
        if (!res[bhash]) {
            res[bhash] = alta;
        }
    }
    return res;
}

export class WireTunnelComponent extends shapezAPI.exports.Component {
    static getId() {
        return "WireTunnel";
    }

    constructor({ connections = {} }) {
        super();

        this.connections = connections;

        /**
         * Linked network, only if its not multiple directions
         */
        this.linkedNetworks = [];
    }

    updateConnections(connections) {
        this.connections = connections;
    }

    /**
     * Returns if the Tunnel accepts inputs from the given direction
     * Local Space Vector into the Tunnel
     */
    canConnect(dir) {
        return !!this.connections[dir.toString()];
    }

    /**
     * Returns if the Tunnel accepts inputs from the given direction
     * World space Vector into the Tunnel
     */
    canConnectWorld(staticComp, dir) {
        const inputDir = staticComp.unapplyRotationToVector(dir);
        return !!this.connections[inputDir.toString()];
    }

    /**
     * Returns the Worldspace Vector out from the Tunnel or Null
     * Worldspace Direction into the Tunnel
     */
    getOutputDirection(staticComp, input) {
        const inputDir = staticComp.unapplyRotationToVector(input);
        if (this.canConnect(inputDir)) {
            let out = this.connections[inputDir.toString()];
            return staticComp.applyRotationToVector(out);
        }
        return null;
    }
}