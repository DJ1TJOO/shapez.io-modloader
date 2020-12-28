import { gMetaBuildingRegistry } from "../core/global_registries";
import { createLogger } from "../core/logging";
import { T } from "../translations";
import { MetaAnalyzerBuilding } from "./buildings/analyzer";
import { MetaBalancerBuilding } from "./buildings/balancer";
import { MetaBeltBuilding } from "./buildings/belt";
import { MetaComparatorBuilding } from "./buildings/comparator";
import { MetaConstantSignalBuilding } from "./buildings/constant_signal";
import { MetaCutterBuilding } from "./buildings/cutter";
import { MetaDisplayBuilding } from "./buildings/display";
import { MetaFilterBuilding } from "./buildings/filter";
import { MetaHubBuilding } from "./buildings/hub";
import { MetaItemProducerBuilding } from "./buildings/item_producer";
import { MetaLeverBuilding } from "./buildings/lever";
import { enumLogicGateVariants, MetaLogicGateBuilding } from "./buildings/logic_gate";
import { MetaMinerBuilding } from "./buildings/miner";
import { MetaMixerBuilding } from "./buildings/mixer";
import { enumPainterVariants, MetaPainterBuilding } from "./buildings/painter";
import { MetaReaderBuilding } from "./buildings/reader";
import { MetaRotaterBuilding } from "./buildings/rotater";
import { MetaStackerBuilding } from "./buildings/stacker";
import { MetaStorageBuilding } from "./buildings/storage";
import { enumTransistorVariants, MetaTransistorBuilding } from "./buildings/transistor";
import { MetaTrashBuilding } from "./buildings/trash";
import { enumUndergroundBeltVariants, MetaUndergroundBeltBuilding } from "./buildings/underground_belt";
import { enumVirtualProcessorVariants, MetaVirtualProcessorBuilding } from "./buildings/virtual_processor";
import { MetaWireBuilding } from "./buildings/wire";
import { MetaWireTunnelBuilding } from "./buildings/wire_tunnel";
import { gBuildingVariants, registerBuildingVariant } from "./building_codes";
import { enumWireVariant } from "./components/wire";
import { KEYMAPPINGS } from "./key_action_mapper";
import { defaultBuildingVariant } from "./meta_building";

const logger = createLogger("building_registry");

export function addVanillaBuildingsToAPI() {
    var vanillaBuildings = [
        MetaAnalyzerBuilding,
        MetaBalancerBuilding,
        MetaBeltBuilding,
        MetaMinerBuilding,
        MetaCutterBuilding,
        MetaRotaterBuilding,
    ];
    for (let i = 0; i < vanillaBuildings.length; i++) {
        shapezAPI.ingame.buildings[new vanillaBuildings[i]().getId()] = vanillaBuildings[i];
    }
}

export function initMetaBuildingRegistry() {
    for (const buildingClassKey in shapezAPI.ingame.buildings) {
        const buildingClass = shapezAPI.ingame.buildings[buildingClassKey];
        gMetaBuildingRegistry.register(buildingClass);

        if (buildingClass.rotationVariants) {
            for (const rotationVariant in buildingClass.rotationVariants) {
                if (!buildingClass.rotationVariants.hasOwnProperty(rotationVariant)) continue;
                registerBuildingVariant(
                    buildingClass,
                    defaultBuildingVariant,
                    buildingClass.rotationVariants[rotationVariant]
                );
            }
        } else {
            registerBuildingVariant(buildingClass, defaultBuildingVariant);
        }

        if (buildingClass.variants) {
            for (const variant in buildingClass.variants) {
                if (!buildingClass.variants.hasOwnProperty(variant)) continue;
                if (buildingClass.rotationVariants) {
                    for (const rotationVariant in buildingClass.rotationVariants) {
                        if (!buildingClass.rotationVariants.hasOwnProperty(rotationVariant)) continue;
                        registerBuildingVariant(
                            buildingClass,
                            buildingClass.variants[variant],
                            buildingClass.rotationVariants[rotationVariant]
                        );
                    }
                } else {
                    registerBuildingVariant(buildingClass, buildingClass.variants[variant]);
                }
            }
        }
    }

    gMetaBuildingRegistry.register(MetaStackerBuilding);
    gMetaBuildingRegistry.register(MetaMixerBuilding);
    gMetaBuildingRegistry.register(MetaPainterBuilding);
    gMetaBuildingRegistry.register(MetaTrashBuilding);
    gMetaBuildingRegistry.register(MetaStorageBuilding);
    gMetaBuildingRegistry.register(MetaUndergroundBeltBuilding);
    gMetaBuildingRegistry.register(MetaHubBuilding);
    gMetaBuildingRegistry.register(MetaWireBuilding);
    gMetaBuildingRegistry.register(MetaConstantSignalBuilding);
    gMetaBuildingRegistry.register(MetaLogicGateBuilding);
    gMetaBuildingRegistry.register(MetaLeverBuilding);
    gMetaBuildingRegistry.register(MetaFilterBuilding);
    gMetaBuildingRegistry.register(MetaWireTunnelBuilding);
    gMetaBuildingRegistry.register(MetaDisplayBuilding);
    gMetaBuildingRegistry.register(MetaVirtualProcessorBuilding);
    gMetaBuildingRegistry.register(MetaReaderBuilding);
    gMetaBuildingRegistry.register(MetaTransistorBuilding);
    gMetaBuildingRegistry.register(MetaComparatorBuilding);
    gMetaBuildingRegistry.register(MetaItemProducerBuilding);

    // Stacker
    registerBuildingVariant(MetaStackerBuilding);

    // Mixer
    registerBuildingVariant(MetaMixerBuilding);

    // Painter
    registerBuildingVariant(MetaPainterBuilding);
    registerBuildingVariant(MetaPainterBuilding, enumPainterVariants.mirrored);
    registerBuildingVariant(MetaPainterBuilding, enumPainterVariants.double);
    registerBuildingVariant(MetaPainterBuilding, enumPainterVariants.quad);

    // Trash
    registerBuildingVariant(MetaTrashBuilding);

    // Storage
    registerBuildingVariant(MetaStorageBuilding);

    // Underground belt
    registerBuildingVariant(MetaUndergroundBeltBuilding, defaultBuildingVariant, 0);
    registerBuildingVariant(MetaUndergroundBeltBuilding, defaultBuildingVariant, 1);
    registerBuildingVariant(MetaUndergroundBeltBuilding, enumUndergroundBeltVariants.tier2, 0);
    registerBuildingVariant(MetaUndergroundBeltBuilding, enumUndergroundBeltVariants.tier2, 1);

    // Hub
    registerBuildingVariant(MetaHubBuilding);

    // Wire
    registerBuildingVariant(MetaWireBuilding, defaultBuildingVariant, 0);
    registerBuildingVariant(MetaWireBuilding, defaultBuildingVariant, 1);
    registerBuildingVariant(MetaWireBuilding, defaultBuildingVariant, 2);
    registerBuildingVariant(MetaWireBuilding, defaultBuildingVariant, 3);

    registerBuildingVariant(MetaWireBuilding, enumWireVariant.second, 0);
    registerBuildingVariant(MetaWireBuilding, enumWireVariant.second, 1);
    registerBuildingVariant(MetaWireBuilding, enumWireVariant.second, 2);
    registerBuildingVariant(MetaWireBuilding, enumWireVariant.second, 3);

    // Constant signal
    registerBuildingVariant(MetaConstantSignalBuilding);

    // Logic gate
    registerBuildingVariant(MetaLogicGateBuilding);
    registerBuildingVariant(MetaLogicGateBuilding, enumLogicGateVariants.not);
    registerBuildingVariant(MetaLogicGateBuilding, enumLogicGateVariants.xor);
    registerBuildingVariant(MetaLogicGateBuilding, enumLogicGateVariants.or);

    // Transistor
    registerBuildingVariant(MetaTransistorBuilding);
    registerBuildingVariant(MetaTransistorBuilding, enumTransistorVariants.mirrored);

    // Lever
    registerBuildingVariant(MetaLeverBuilding);

    // Filter
    registerBuildingVariant(MetaFilterBuilding);

    // Wire tunnel
    registerBuildingVariant(MetaWireTunnelBuilding);

    // Display
    registerBuildingVariant(MetaDisplayBuilding);

    // Virtual Processor
    registerBuildingVariant(MetaVirtualProcessorBuilding);
    registerBuildingVariant(MetaVirtualProcessorBuilding, enumVirtualProcessorVariants.rotater);
    registerBuildingVariant(MetaVirtualProcessorBuilding, enumVirtualProcessorVariants.unstacker);
    registerBuildingVariant(MetaVirtualProcessorBuilding, enumVirtualProcessorVariants.stacker);
    registerBuildingVariant(MetaVirtualProcessorBuilding, enumVirtualProcessorVariants.painter);

    // Analyzer
    registerBuildingVariant(MetaComparatorBuilding);

    // Reader
    registerBuildingVariant(MetaReaderBuilding);

    // Item producer
    registerBuildingVariant(MetaItemProducerBuilding);

    // Propagate instances
    for (const key in gBuildingVariants) {
        gBuildingVariants[key].metaInstance = gMetaBuildingRegistry.findByClass(
            gBuildingVariants[key].metaClass
        );
    }

    for (const key in gBuildingVariants) {
        const variant = gBuildingVariants[key];
        assert(variant.metaClass, "Variant has no meta: " + key);

        if (typeof variant.rotationVariant === "undefined") {
            variant.rotationVariant = 0;
        }
        if (typeof variant.variant === "undefined") {
            variant.variant = defaultBuildingVariant;
        }
    }

    // Check for valid keycodes
    if (G_IS_DEV) {
        gMetaBuildingRegistry.entries.forEach(metaBuilding => {
            const id = metaBuilding.getId();
            if (!["hub"].includes(id)) {
                if (!KEYMAPPINGS.buildings[id]) {
                    assertAlways(
                        false,
                        "Building " + id + " has no keybinding assigned! Add it to key_action_mapper.js"
                    );
                }

                if (!T.buildings[id]) {
                    assertAlways(false, "Translation for building " + id + " missing!");
                }

                if (!T.buildings[id].default) {
                    assertAlways(false, "Translation for building " + id + " missing (default variant)!");
                }
            }
        });
    }

    logger.log("Registered", gMetaBuildingRegistry.getNumEntries(), "buildings");
    logger.log("Registered", Object.keys(gBuildingVariants).length, "building codes");
}

/**
 * Once all sprites are loaded, propagates the cache
 */
export function initBuildingCodesAfterResourcesLoaded() {
    logger.log("Propagating sprite cache");
    for (const key in gBuildingVariants) {
        const variant = gBuildingVariants[key];

        variant.sprite = variant.metaInstance.getSprite(variant.rotationVariant, variant.variant);
        variant.blueprintSprite = variant.metaInstance.getBlueprintSprite(
            variant.rotationVariant,
            variant.variant
        );
        variant.silhouetteColor = variant.metaInstance.getSilhouetteColor(
            variant.variant,
            variant.rotationVariant
        );
    }
}