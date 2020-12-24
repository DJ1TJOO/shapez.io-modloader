/* typehints:start */
import { MetaBuilding } from "./meta_building";
import { AtlasSprite } from "../core/sprites";
import { Vector } from "../core/vector";
/* typehints:end */

/**
 * @typedef {{
 *   metaClass: typeof MetaBuilding,
 *   metaInstance?: MetaBuilding,
 *   variant?: string,
 *   rotationVariant?: number,
 *   tileSize?: Vector,
 *   sprite?: AtlasSprite,
 *   blueprintSprite?: AtlasSprite,
 *   silhouetteColor?: string
 * }} BuildingVariantIdentifier
 */

/**
 * Stores a lookup table for all building variants (for better performance)
 * @type {Object<number, BuildingVariantIdentifier>}
 */
export const gBuildingVariants = {
    // Set later
};

/**
 * Mapping from 'metaBuildingId/variant/rotationVariant' to building code
 * @type {object}
 */
const variantsCache = {};

/**
 * Registers a new variant
 * @param {typeof MetaBuilding} meta
 * @param {string} variant
 * @param {number} rotationVariant
 */
export function registerBuildingVariant(
    meta,
    variant = "default" /* @TODO: Circular dependency, actually its defaultBuildingVariant */ ,
    rotationVariant = 0
) {
    const args_Meta = meta.name.match(/[A-Z][a-z]+/g);
    let code = args_Meta.slice(1).join("") + "/" + variant + "/" + rotationVariant.toString();
    assert(!gBuildingVariants[code], "Duplicate id: " + code);
    gBuildingVariants[code] = {
        metaClass: meta,
        variant,
        rotationVariant,
        // @ts-ignore
        tileSize: new meta().getDimensions(variant),
    };
}

/**
 *
 * @param {number} code
 * @returns {BuildingVariantIdentifier}
 */
export function getBuildingDataFromCode(code) {
    assert(gBuildingVariants[code], "Invalid building code: " + code);
    return gBuildingVariants[code];
}

/**
 * Builds the cache for the codes
 */
export function buildBuildingCodeCache() {
    for (const code in gBuildingVariants) {
        const data = gBuildingVariants[code];
        const hash = data.metaInstance.getId() + "/" + data.variant + "/" + data.rotationVariant;
        variantsCache[hash] = code;
    }
}

/**
 * Finds the code for a given variant
 * @param {MetaBuilding} metaBuilding
 * @param {string} variant
 * @param {number} rotationVariant
 * @returns {number}
 */
export function getCodeFromBuildingData(metaBuilding, variant, rotationVariant) {
    const hash = metaBuilding.getId() + "/" + variant + "/" + rotationVariant;
    const result = variantsCache[hash];
    if (G_IS_DEV) {
        if (!result) {
            assertAlways(false, "Building not found by data: " + hash);
        }
    }
    return result;
}