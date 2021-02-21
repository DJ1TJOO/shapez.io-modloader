export const enumMergedShape = {
    circlestar: "circlestar",
    rectcircle: "rectcircle",
    starrect: "starrect",
    circlewindmill: "circlewindmill",
    rectwindmill: "rectwindmill",
    starwindmill: "starwindmill",
};

const s = shapezAPI.exports.enumSubShape;
const m = enumMergedShape;
/** @enum {Object.<string, string>} */
export const enumShapeMergingResults = {
    [s.rect]: {
        [s.rect]: s.rect,

        [s.circle]: m.rectcircle,
        [s.star]: m.starrect,
        [s.windmill]: m.rectwindmill,
    },

    [s.circle]: {
        [s.circle]: s.circle,

        [s.rect]: m.rectcircle,
        [s.star]: m.circlestar,
        [s.windmill]: m.circlewindmill,
    },

    [s.star]: {
        [s.star]: s.star,

        [s.circle]: m.circlestar,
        [s.rect]: m.starrect,
        [s.windmill]: m.starwindmill,
    },

    [s.windmill]: {
        [s.windmill]: s.windmill,

        [s.circle]: m.circlewindmill,
        [s.star]: m.starwindmill,
        [s.rect]: m.rectwindmill,
    },
};

export function addShapes() {
    //Add new shapez
    shapezAPI.exports.enumSubShape[enumMergedShape.circlestar] = enumMergedShape.circlestar;
    shapezAPI.exports.enumSubShape[enumMergedShape.rectcircle] = enumMergedShape.rectcircle;
    shapezAPI.exports.enumSubShape[enumMergedShape.starrect] = enumMergedShape.starrect;
    shapezAPI.exports.enumSubShape[enumMergedShape.circlewindmill] = enumMergedShape.circlewindmill;
    shapezAPI.exports.enumSubShape[enumMergedShape.rectwindmill] = enumMergedShape.rectwindmill;
    shapezAPI.exports.enumSubShape[enumMergedShape.starwindmill] = enumMergedShape.starwindmill;

    shapezAPI.exports.enumSubShapeToShortcode[enumMergedShape.circlestar] = "1";
    shapezAPI.exports.enumSubShapeToShortcode[enumMergedShape.rectcircle] = "2";
    shapezAPI.exports.enumSubShapeToShortcode[enumMergedShape.starrect] = "3";
    shapezAPI.exports.enumSubShapeToShortcode[enumMergedShape.circlewindmill] = "4";
    shapezAPI.exports.enumSubShapeToShortcode[enumMergedShape.rectwindmill] = "5";
    shapezAPI.exports.enumSubShapeToShortcode[enumMergedShape.starwindmill] = "6";

    for (const key in shapezAPI.exports.enumSubShapeToShortcode) {
        shapezAPI.exports.enumShortcodeToSubShape[shapezAPI.exports.enumSubShapeToShortcode[key]] = key;
    }

    //Render new added shapez
    shapezAPI.exports.ShapeDefinition.renderQuad["circlestar"] = (context, quadrantSize, quadrantHalfSize, layerScale, insetPadding) => {
        context.beginPath();
        const dims = quadrantSize * layerScale;

        let originX = insetPadding - quadrantHalfSize;
        let originY = -insetPadding + quadrantHalfSize - dims;
        const moveInwards = dims * 0.1;
        const starPosition = dims * 0.55;

        context.moveTo(originX, originY);
        context.arc(originX, originY + dims, dims, -Math.PI * 0.5, -Math.PI * 0.35);
        context.lineTo(originX + dims, originY);

        context.lineTo(originX + dims - moveInwards, originY + starPosition);
        context.arc(originX, originY + dims, dims, -Math.PI * 0.13, 0);
        context.lineTo(originX, originY + dims);
        context.closePath();
    };
    shapezAPI.exports.ShapeDefinition.renderQuad["rectcircle"] = (context, quadrantSize, quadrantHalfSize, layerScale, insetPadding) => {
        context.beginPath();
        const dims = quadrantSize * layerScale;

        let originX = insetPadding - quadrantHalfSize;
        let originY = -insetPadding + quadrantHalfSize - dims;
        const moveInwards = dims * 0.3;
        const moveOutwards = dims * 0.7;

        context.moveTo(originX, originY);
        context.lineTo(originX + moveInwards, originY);
        context.arc(originX + moveInwards, originY + moveOutwards, moveOutwards, -Math.PI * 0.5, 0);
        context.lineTo(originX + dims, originY + dims);
        context.lineTo(originX, originY + dims);
        context.closePath();
    };
    shapezAPI.exports.ShapeDefinition.renderQuad["starrect"] = (context, quadrantSize, quadrantHalfSize, layerScale, insetPadding) => {
        context.beginPath();
        const dims = quadrantSize * layerScale;

        let originX = insetPadding - quadrantHalfSize;
        let originY = -insetPadding + quadrantHalfSize - dims;
        const moveInwards = dims * 0.1;
        const moveOutwards = dims * 0.9;
        const starStart = dims * 0.4;
        const starEnd = dims * 0.6;

        context.moveTo(originX, originY + moveInwards);
        context.lineTo(originX + starStart, originY + moveInwards);
        context.lineTo(originX + dims, originY);
        context.lineTo(originX + moveOutwards, originY + starEnd);
        context.lineTo(originX + moveOutwards, originY + dims);
        context.lineTo(originX, originY + dims);

        context.closePath();
    };
    shapezAPI.exports.ShapeDefinition.renderQuad["circlewindmill"] = (context, quadrantSize, quadrantHalfSize, layerScale, insetPadding) => {
        context.beginPath();
        const dims = quadrantSize * layerScale;

        let originX = insetPadding - quadrantHalfSize;
        let originY = -insetPadding + quadrantHalfSize - dims;
        const moveInwards = dims * 0.4;
        const circlePosition = dims * 0.5;
        context.moveTo(originX, originY + moveInwards);
        context.lineTo(originX + circlePosition, originY);
        context.arc(originX + circlePosition, originY + circlePosition, circlePosition, -Math.PI * 0.5, 0);
        context.lineTo(originX + dims, originY + dims);
        context.lineTo(originX, originY + dims);
        context.closePath();
    };
    shapezAPI.exports.ShapeDefinition.renderQuad["rectwindmill"] = (context, quadrantSize, quadrantHalfSize, layerScale, insetPadding) => {
        context.beginPath();
        const dims = quadrantSize * layerScale;

        let originX = insetPadding - quadrantHalfSize;
        let originY = -insetPadding + quadrantHalfSize - dims;
        const moveInwards = dims * 0.1;
        context.moveTo(originX, originY + moveInwards);
        context.lineTo(originX + dims, originY + moveInwards);
        context.lineTo(originX + dims, originY + dims);
        context.lineTo(originX, originY + dims);
        context.closePath();
    };
    shapezAPI.exports.ShapeDefinition.renderQuad["starwindmill"] = (context, quadrantSize, quadrantHalfSize, layerScale, insetPadding) => {
        context.beginPath();
        const dims = quadrantSize * layerScale;

        let originX = insetPadding - quadrantHalfSize;
        let originY = -insetPadding + quadrantHalfSize - dims;
        const moveInwards = dims * 0.4;
        const moveOutwards = dims * 0.8;
        context.moveTo(originX, originY + moveInwards);
        context.lineTo(originX + dims, originY);
        context.lineTo(originX + moveOutwards, originY + dims);
        context.lineTo(originX, originY + dims);
        context.closePath();
    };

    shapezAPI.exports.ShapeDefinition.prototype.cloneAndSmartStackWith = function(definition1, definition2, definition3) {
        assert(definition1 || definition2 || definition3, "Must have something to stack with.");
        if (definition3) {
            if (definition2) {
                definition2 = definition2.cloneAndStackWith(definition3);
            } else {
                definition2 = definition3;
            }
        }
        if (definition2) {
            if (definition1) {
                definition1 = definition1.cloneAndStackWith(definition2);
            } else {
                definition1 = definition2;
            }
        }
        return this.cloneAndStackWith(definition1);
    };

    shapezAPI.exports.ShapeDefinition.prototype.cloneAndMergeWith = function(definition) {
        assert(this.layers.length == 1 && definition.layers.length == 1, "Can only merge one layer shapes");
        const shape1 = this.layers[0];
        const shape2 = definition.layers[0];

        let outDefinition = [null, null, null, null];
        for (let quad = 0; quad < 4; ++quad) {
            if (!(shape1[quad] || shape2[quad])) {
                //nothing, leave it empty
            } else if (!(shape1[quad] && shape2[quad]) || shape1[quad].subShape == shape2[quad].subShape) {
                // it doesn't matter which shape goes in
                outDefinition[quad] = shape1[quad] ? shape1[quad] : shape2[quad];
            } else {
                const subShape1 = shape1[quad].subShape;
                const subShape2 = shape2[quad].subShape;

                let subShape = null;

                subShape = enumShapeMergingResults[subShape1][subShape2];

                const color1 = shape1[quad].color;
                const color2 = shape2[quad].color;
                //ok, now find the color
                let color = shapezAPI.exports.enumColors.uncolored;
                if (!(color1 == shapezAPI.exports.enumColors.uncolored || color2 == shapezAPI.exports.enumColors.uncolored)) {
                    //mix the colors!
                    color = shapezAPI.exports.enumColorMixingResults[color1][color2];
                } else if (!(color1 == shapezAPI.exports.enumColors.uncolored)) {
                    color = color1;
                } else if (!(color2 == shapezAPI.exports.enumColors.uncolored)) {
                    color = color2;
                }

                if (subShape != null) {
                    outDefinition[quad] = {
                        subShape: subShape,
                        color: color,
                    };
                }
            }
        }
        return new shapezAPI.exports.ShapeDefinition({ layers: [outDefinition] });
    };

    shapezAPI.exports.ShapeDefinitionManager.prototype.shapeActionCutLaser = function(definition, wantedCorners, unwantedCorners) {
        const wantedShape = definition.cloneFilteredByQuadrants(wantedCorners);
        const remainder = definition.cloneFilteredByQuadrants(unwantedCorners);
        return [wantedShape, remainder];
    };

    shapezAPI.exports.ShapeDefinitionManager.prototype.shapeActionSmartStack = function(mainDefinition, definition1, definition2, definition3) {
        const stacked = mainDefinition.cloneAndSmartStackWith(definition1, definition2, definition3);
        return stacked;
    };

    shapezAPI.exports.ShapeDefinitionManager.prototype.shapeActionMerge = function(definition1, definition2) {
        const key = "merge/" + definition1.getHash() + "/" + definition2.getHash();
        if (this.operationCache[key]) {
            return this.operationCache[key];
        }
        const merged = definition1.cloneAndMergeWith(definition2);
        return (this.operationCache[key] = this.registerOrReturnHandle(merged));
    };
}