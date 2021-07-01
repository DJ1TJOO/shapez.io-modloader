const Vector = shapezAPI.exports.Vector;
const globalConfig = shapezAPI.exports.globalConfig;
const getBuildingDataFromCode = shapezAPI.exports.getBuildingDataFromCode;

export class MultiplayerBuilder {
    constructor(ingameState, peer) {
        this.ingameState = ingameState;
        this.peer = peer;
    }

    /**
     * Tries to delete the given building
     */
    tryDeleteBuilding(building) {
        if (!this.ingameState.core.root.logic.canDeleteBuilding(building)) {
            return false;
        }
        this.peer.multiplayerDestroy.push(building.uid);
        this.ingameState.core.root.map.removeStaticEntity(building);
        this.ingameState.core.root.entityMgr.destroyEntity(building);
        this.ingameState.core.root.entityMgr.processDestroyList();
        return true;
    }

    /**
     * Removes all entities with a RemovableMapEntityComponent which need to get
     * removed before placing this entity
     */
    freeEntityAreaBeforeBuild(entity) {
        const staticComp = entity.components.StaticMapEntity;
        const rect = staticComp.getTileSpaceBounds();
        // Remove any removeable colliding entities on the same layer
        for (let x = rect.x; x < rect.x + rect.w; ++x) {
            for (let y = rect.y; y < rect.y + rect.h; ++y) {
                const contents = this.ingameState.core.root.map.getLayerContentXY(x, y, entity.layer);
                if (contents) {
                    assertAlways(
                        contents.components.StaticMapEntity.getMetaBuilding().getIsReplaceable(
                            getBuildingDataFromCode(contents.components.StaticMapEntity.code).variant
                        ),
                        "Tried to replace non-repleaceable entity"
                    );
                    if (!this.tryDeleteBuilding(contents)) {
                        assertAlways(false, "Tried to replace non-repleaceable entity #2");
                    }
                }
            }
        }

        // Perform other callbacks
        this.ingameState.core.root.signals.freeEntityAreaBeforeBuild.dispatch(entity);
    }

    /**
     * Attempts to place the given building
     */
    tryPlaceBuilding({ origin, rotation, rotationVariant, originalRotation, variant, building }, uid) {
        const entity = building.createEntity({
            root: this.ingameState.core.root,
            origin,
            rotation,
            originalRotation,
            rotationVariant,
            variant,
        });
        if (entity.components.ConstantSignal) {
            const constantSignalComponent = entity.components.ConstantSignal;
            const constantSignalChange = this.ingameState.core.root.signals.constantSignalChange;

            let component = new Proxy(constantSignalComponent, {
                set: (target, key, value) => {
                    target[key] = value;
                    constantSignalChange.dispatch(entity, target);
                    return true;
                },
            });
            entity.components.ConstantSignal = component;
        }
        if (this.ingameState.core.root.logic.checkCanPlaceEntity(entity)) {
            this.freeEntityAreaBeforeBuild(entity);
            this.ingameState.core.root.map.placeStaticEntity(entity);
            this.ingameState.core.root.entityMgr.registerEntity(entity, uid);
            this.ingameState.core.root.entityMgr.nextUid = uid + 1;
            return entity;
        }
        return null;
    }

    /**
     * Tries to place the current building at the given tile
     * @param {Vector} tile
     */
    tryPlaceCurrentBuildingAt(tile, entityPayload, uid) {
        if (this.ingameState.core.root.camera.zoomLevel < globalConfig.mapChunkOverviewMinZoom) {
            // Dont allow placing in overview mode
            return;
        }

        if (this.ingameState.core.root.entityMgr.findByUid(uid)) return false;

        const metaBuilding = entityPayload.building;
        const entity = this.tryPlaceBuilding(
            {
                origin: tile,
                rotation: entityPayload.rotation,
                rotationVariant: entityPayload.rotationVariant,
                originalRotation: entityPayload.originalRotation,
                building: metaBuilding,
                variant: entityPayload.variant,
            },
            uid
        );

        if (entity) {
            return true;
        } else {
            return false;
        }
    }
}
