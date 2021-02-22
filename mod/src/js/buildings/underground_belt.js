const Vector = shapezAPI.exports.Vector;
const formatItemsPerSecond = shapezAPI.exports.formatItemsPerSecond;
const enumDirection = shapezAPI.exports.enumDirection;
const enumHubGoalRewards = shapezAPI.exports.enumHubGoalRewards;
const defaultBuildingVariant = shapezAPI.exports.defaultBuildingVariant;
const generateMatrixRotations = shapezAPI.exports.generateMatrixRotations;
const enumAngleToDirection = shapezAPI.exports.enumAngleToDirection;
const enumDirectionToVector = shapezAPI.exports.enumDirectionToVector;
const globalConfig = shapezAPI.exports.globalConfig;
const enumPinSlotType = {
    logicalEjector: "logicalEjector",
    logicalAcceptor: "logicalAcceptor",
};
const enumUndergroundBeltMode = {
    sender: "sender",
    receiver: "receiver",
};
export const addUndergroundBeltVariant = () => {
    const undergroundBelt = shapezAPI.ingame.buildings.underground_belt;

    globalConfig.undergroundBeltMaxTilesByTier.push(7);

    //Add overlay matrices
    undergroundBelt.overlayMatricesByRotation.push(
        // Left Sender
        () => generateMatrixRotations([1, 1, 1, 1, 1, 0, 0, 0, 0])
    );
    undergroundBelt.overlayMatricesByRotation.push(
        // Left Receiver
        () => generateMatrixRotations([0, 0, 0, 1, 1, 0, 1, 1, 1])
    );
    undergroundBelt.overlayMatricesByRotation.push(
        // Right Sender
        () => generateMatrixRotations([1, 1, 1, 0, 1, 1, 0, 0, 0])
    );
    undergroundBelt.overlayMatricesByRotation.push(
        // Right Receiver
        () => generateMatrixRotations([0, 0, 0, 0, 1, 1, 1, 1, 1])
    );

    //Add rotation to mode
    undergroundBelt.rotationVariantToMode.push(enumUndergroundBeltMode.sender);
    undergroundBelt.rotationVariantToMode.push(enumUndergroundBeltMode.receiver);
    undergroundBelt.rotationVariantToMode.push(enumUndergroundBeltMode.sender);
    undergroundBelt.rotationVariantToMode.push(enumUndergroundBeltMode.receiver);

    //Add rotation colors
    undergroundBelt.silhouetteColorsByRotation.push(() => "#6d9dff");
    undergroundBelt.silhouetteColorsByRotation.push(() => "#71ff9c");
    undergroundBelt.silhouetteColorsByRotation.push(() => "#6d9dff");
    undergroundBelt.silhouetteColorsByRotation.push(() => "#71ff9c");

    //Add rotation variants
    undergroundBelt.rotationVariants.push(2, 3, 4, 5);

    undergroundBelt.prototype.getPreviewSprite = function(rotationVariant, variant) {
        let suffix = "";
        if (variant !== defaultBuildingVariant) {
            suffix = "-" + variant;
            if (variant === undergroundBelt.variants.smart) suffix += "_" + rotationVariant;
        }
        switch (undergroundBelt.rotationVariantToMode[rotationVariant]) {
            case enumUndergroundBeltMode.sender:
                return shapezAPI.exports.Loader.getSprite("sprites/buildings/underground_belt_entry" + suffix + ".png");
            case enumUndergroundBeltMode.receiver:
                return shapezAPI.exports.Loader.getSprite("sprites/buildings/underground_belt_exit" + suffix + ".png");
            default:
                assert(false, "Invalid rotation variant");
        }
    };

    undergroundBelt.prototype.getBlueprintSprite = function(rotationVariant, variant) {
        let suffix = "";
        if (variant !== defaultBuildingVariant) {
            suffix = "-" + variant;
            if (variant === undergroundBelt.variants.smart) suffix += "_" + rotationVariant;
        }

        switch (undergroundBelt.rotationVariantToMode[rotationVariant]) {
            case enumUndergroundBeltMode.sender:
                return shapezAPI.exports.Loader.getSprite("sprites/blueprints/underground_belt_entry" + suffix + ".png");
            case enumUndergroundBeltMode.receiver:
                return shapezAPI.exports.Loader.getSprite("sprites/blueprints/underground_belt_exit" + suffix + ".png");
            default:
                assertAlways(false, "Invalid rotation variant");
        }
    };

    undergroundBelt.prototype.computeOptimalDirectionAndRotationVariantAtTile = function({ root, tile, rotation, variant, layer, entity }) {
        const searchDirection = enumAngleToDirection[rotation];
        const searchVector = enumDirectionToVector[searchDirection];
        const tier = undergroundBelt.variantToTier[variant];

        const targetRotation = (rotation + 180) % 360;
        const targetSenderRotation = rotation;
        const originalTile = tile;
        for (let searchOffset = 1; searchOffset <= globalConfig.undergroundBeltMaxTilesByTier[tier]; ++searchOffset) {
            tile = tile.addScalars(searchVector.x, searchVector.y);

            const contents = root.map.getTileContent(tile, "regular");
            if (contents) {
                const undergroundComp = contents.components.UndergroundBelt;
                if (undergroundComp && undergroundComp.tier === tier) {
                    const staticComp = contents.components.StaticMapEntity;
                    if (staticComp.rotation === targetRotation) {
                        if (undergroundComp.mode !== enumUndergroundBeltMode.sender) {
                            // If we encounter an underground receiver on our way which is also faced in our direction, we don't accept that
                            break;
                        }
                        if (tier == 2) {
                            return this.computeBestVariantForSmart(root, originalTile, targetRotation, enumUndergroundBeltMode.receiver, entity, contents);
                        } else {
                            return {
                                rotation: targetRotation,
                                rotationVariant: 1,
                                connectedEntities: [contents],
                            };
                        }
                    } else if (staticComp.rotation === targetSenderRotation) {
                        // Draw connections to receivers
                        if (undergroundComp.mode === enumUndergroundBeltMode.receiver) {
                            if (tier == 2) {
                                return this.computeBestVariantForSmart(root, originalTile, rotation, enumUndergroundBeltMode.sender, entity, contents);
                            } else {
                                return {
                                    rotation: rotation,
                                    rotationVariant: 0,
                                    connectedEntities: [contents],
                                };
                            }
                        } else {
                            break;
                        }
                    }
                }
            }
        }
        if (tier == 2) {
            return this.computeBestVariantForSmart(root, originalTile, rotation, enumUndergroundBeltMode.sender, entity, null);
        } else {
            return {
                rotation,
                rotationVariant: 0,
            };
        }
    };

    undergroundBelt.prototype.computeBestVariantForSmart = function(root, tile, rotation, mode, entity, contents) {
        const isSender = mode == enumUndergroundBeltMode.sender;
        const oldRotationVariant = entity ? (entity.components.UndergroundBelt.rotationVariant ? entity.components.UndergroundBelt.rotationVariant : null) : null;
        const topDirection = enumAngleToDirection[rotation];
        const rightDirection = enumAngleToDirection[(rotation + 90) % 360];
        const bottomDirection = enumAngleToDirection[(rotation + 180) % 360];
        const leftDirection = enumAngleToDirection[(rotation + 270) % 360];

        const { ejectors, acceptors } = root.logic.getEjectorsAndAcceptorsAtTile(tile, false);

        let hasCenterConnector = false;
        let hasRightConnector = false;
        let hasLeftConnector = false;
        if (mode !== enumUndergroundBeltMode.receiver) {
            for (let i = 0; i < ejectors.length; ++i) {
                const ejector = ejectors[i];

                if (ejector.toDirection === leftDirection) {
                    hasRightConnector = true;
                } else if (ejector.toDirection === rightDirection) {
                    hasLeftConnector = true;
                } else if (ejector.toDirection === topDirection) {
                    hasCenterConnector = true;
                }
            }
            if (oldRotationVariant == 0 && hasCenterConnector) {
                return { rotation: rotation, rotationVariant: 0, connectedEntities: contents ? [contents] : [] };
            } else if (oldRotationVariant == 2 && hasLeftConnector) {
                return { rotation: rotation, rotationVariant: 2, connectedEntities: contents ? [contents] : [] };
            } else if (oldRotationVariant == 4 && hasRightConnector) {
                return { rotation: rotation, rotationVariant: 4, connectedEntities: contents ? [contents] : [] };
            }
        } else {
            for (let i = 0; i < acceptors.length; ++i) {
                const acceptor = acceptors[i];
                if (acceptor.fromDirection === rightDirection) {
                    hasLeftConnector = true;
                } else if (acceptor.fromDirection === leftDirection) {
                    hasRightConnector = true;
                } else if (acceptor.fromDirection === bottomDirection) {
                    hasCenterConnector = true;
                }
            }
            if (oldRotationVariant == 1 && hasCenterConnector) {
                return { rotation: rotation, rotationVariant: 1, connectedEntities: contents ? [contents] : [] };
            } else if (oldRotationVariant == 3 && hasLeftConnector) {
                return { rotation: rotation, rotationVariant: 3, connectedEntities: contents ? [contents] : [] };
            } else if (oldRotationVariant == 5 && hasRightConnector) {
                return { rotation: rotation, rotationVariant: 5, connectedEntities: contents ? [contents] : [] };
            }
        }
        const connections = [hasCenterConnector, hasLeftConnector, hasRightConnector];
        let totalConnections = 0;
        for (let i = 0; i < 3; ++i) {
            if (connections[i]) {
                totalConnections++;
            }
        }
        let rotationVariant = isSender ? 0 : 1;
        if (totalConnections !== 1) {
            //keep old rotation variant
            rotationVariant = oldRotationVariant && totalConnections > 0 ? oldRotationVariant : isSender ? 0 : 1;
        } else if (hasCenterConnector) {
            rotationVariant = 0;
            if (!isSender) {
                rotationVariant = 1;
            }
        } else if (hasLeftConnector) {
            rotationVariant = 2;
            if (!isSender) {
                rotationVariant = 3;
            }
        } else {
            rotationVariant = 4;
            if (!isSender) {
                rotationVariant = 5;
            }
        }
        return {
            rotation: rotation,
            rotationVariant: rotationVariant,
            connectedEntities: contents ? [contents] : [],
        };
    };

    undergroundBelt.componentVariationsByRotation[enumUndergroundBeltMode.sender] = (entity, rotationVariant) => {
        entity.components.UndergroundBelt.mode = enumUndergroundBeltMode.sender;
        entity.components.ItemEjector.setSlots([]);
        entity.components.ItemAcceptor.setSlots([{
            pos: new Vector(0, 0),
            directions: rotationVariant == 0 ? [enumDirection.bottom] : rotationVariant == 2 ? [enumDirection.left] : [enumDirection.right],
        }, ]);
    };
    undergroundBelt.componentVariationsByRotation[enumUndergroundBeltMode.receiver] = (entity, rotationVariant) => {
        entity.components.UndergroundBelt.mode = enumUndergroundBeltMode.receiver;
        entity.components.ItemAcceptor.setSlots([]);
        entity.components.ItemEjector.setSlots([{
            pos: new Vector(0, 0),
            direction: rotationVariant == 1 ? enumDirection.top : rotationVariant == 3 ? enumDirection.left : enumDirection.right,
        }, ]);
    };

    const name = "smart";
    if (!undergroundBelt.variants) undergroundBelt.variants = {};
    undergroundBelt.variants[name] = name;
    undergroundBelt.avaibleVariants[name] = (root) => root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_underground_belt_tier_3);
    undergroundBelt.dimensions[name] = () => new Vector(1, 1);
    undergroundBelt.isRemovable[name] = () => true;
    undergroundBelt.isRotateable[name] = () => true;
    undergroundBelt.renderPins[name] = () => null;
    undergroundBelt.layerPreview[name] = () => null;
    undergroundBelt.layerByVariant[name] = (root) => "regular";
    //undergroundBelt.setupEntityComponents.push((entity) => {});
    undergroundBelt.additionalStatistics[name] = (root) => {
        const rangeTiles = shapezAPI.exports.globalConfig.undergroundBeltMaxTilesByTier[1];

        const beltSpeed = root.hubGoals.getUndergroundBeltBaseSpeed();
        return [
            [shapezAPI.translations.ingame.buildingPlacement.infoTexts.range, shapezAPI.translations.ingame.buildingPlacement.infoTexts.tiles.replace("<x>", "" + rangeTiles)],
            [shapezAPI.translations.ingame.buildingPlacement.infoTexts.speed, formatItemsPerSecond(beltSpeed)],
        ];
    };
    undergroundBelt.variantToTier[name] = 2;
};