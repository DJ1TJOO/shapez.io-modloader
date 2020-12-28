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
        return "#bfdaff";
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

shapezAPI.exports.MapChunk.lowerLayers.push((MapChunk, rng, distanceToOriginInChunks) => {
    // Determine how likely it is that there is a fluid patch
    const fluidPatchChance = 0.9 - shapezAPI.exports.clamp(distanceToOriginInChunks / 25, 0, 1) * 0.5;

    if (rng.next() < fluidPatchChance / 4) {
        const fluidPatchSize = Math.max(
            2,
            Math.round(1 + shapezAPI.exports.clamp(distanceToOriginInChunks / 8, 0, 4))
        );

        // First, determine available fluids
        let availablefluids = [FluidItem.fluids.water];
        let item = FluidItem.ITEM_SINGLETONS[rng.choice(availablefluids)];
        MapChunk.internalGeneratePatch(rng, fluidPatchSize, item);
    }
});