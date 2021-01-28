export class FluidItem extends shapezAPI.exports.BaseItem {
    static getId() {
        return "fluid";
    }

    static getSchema() {
        return shapezAPI.exports.types.enum(FluidItem.fluids);
    }

    serialize() {
        return this.fluid;
    }

    deserialize(data) {
        this.fluid = data;
    }

    /** @returns {"fluid"} **/
    getItemType() {
        return "fluid";
    }

    /**
     * @returns {string}
     */
    getAsCopyableKey() {
        return this.fluid;
    }

    /**
     * @param {any} other
     */
    equalsImpl(other) {
        return this.fluid === /** @type {FluidItem} */ (other).fluid;
    }

    /**
     * @param {FluidItem.fluids} fluid
     */
    constructor(fluid) {
        super();
        this.fluid = fluid;
    }

    getBackgroundColorAsResource() {
        return "#0000ff";
    }

    /**
     * Draws the item to a canvas
     * @param {CanvasRenderingContext2D} context
     * @param {number} size
     */
    drawFullSizeOnCanvas(context, size) {
        if (!this.cachedSprite) {
            this.cachedSprite = shapezAPI.getSprite("sprites/fluids/" + this.fluid + ".png");
        }
        this.cachedSprite.drawCentered(context, size / 2, size / 2, size);
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} diameter
     */
    drawItemCenteredClipped(x, y, parameters, diameter = 20) {
        const realDiameter = diameter * 0.6;
        if (!this.cachedSprite) {
            this.cachedSprite = shapezAPI.getSprite("sprites/fluids/" + this.fluid + ".png");
        }
        this.cachedSprite.drawCachedCentered(parameters, x, y, realDiameter);
    }
}

/** @enum {string} */
FluidItem.fluids = {
    water: "water",
};

FluidItem.resolveSingleton = (root, itemData) => {
    return FluidItem.ITEM_SINGLETONS[itemData];
};

FluidItem.ITEM_SINGLETONS = {};

for (const fluid in FluidItem.fluids) {
    FluidItem.ITEM_SINGLETONS[fluid] = new FluidItem(fluid);
}

shapezAPI.map.MapChunk.lowerLayers.push((self, rng, distanceToOriginInChunks) => {
    const clamp = shapezAPI.exports.clamp;
    const fluidPatchChance = 0.9 - clamp(distanceToOriginInChunks / 25, 0, 1) * 0.5;

    if (rng.next() < fluidPatchChance / 4) {
        const fluidPatchSize = Math.max(2, Math.round(1 + clamp(distanceToOriginInChunks / 8, 0, 4)));
        // First, determine available colors
        let avaibleFluids = [FluidItem.fluids.water];
        self.internalGeneratePatch(rng, fluidPatchSize, FluidItem.ITEM_SINGLETONS[rng.choice(avaibleFluids)]);
    }
});