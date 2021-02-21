const formatBigNumber = shapezAPI.exports.formatBigNumber;

export const updateStorageSystem = () => {
    const storageSystem = shapezAPI.ingame.systems.find((x) => x.getId() === shapezAPI.exports.StorageSystem.getId());

    storageSystem.prototype.drawChunk_ForegroundStaticLayer = function(parameters, chunk) {
        const contents = chunk.containedEntitiesByLayer.regular;
        for (let i = 0; i < contents.length; ++i) {
            const entity = contents[i];
            const storageComp = entity.components.Storage;
            if (!storageComp) {
                continue;
            }

            const storedItem = storageComp.storedItem;
            if (!storedItem) {
                continue;
            }

            if (this.drawnUids.has(entity.uid)) {
                continue;
            }

            const scale = storageComp.maximumStorage == 500 ? 0.4 : 1;

            this.drawnUids.add(entity.uid);

            const staticComp = entity.components.StaticMapEntity;

            const context = parameters.context;
            context.globalAlpha = storageComp.overlayOpacity;
            const center = staticComp.getTileSpaceBounds().getCenter().toWorldSpace();
            storedItem.drawItemCenteredClipped(center.x, center.y, parameters, 30 * scale);

            this.storageOverlaySprite.drawCached(parameters, center.x - 15 * scale, center.y + 15 * scale, 30 * scale, 15 * scale);

            if (parameters.visibleRect.containsCircle(center.x, center.y + 25, 20)) {
                context.font = scale == 0.4 ? "bold 4px GameFont" : "bold 10px GameFont";
                context.textAlign = "center";
                context.fillStyle = "#64666e";
                context.fillText(formatBigNumber(storageComp.storedCount), center.x, center.y + 25.5 * scale);
                context.textAlign = "left";
            }
            context.globalAlpha = 1;
        }
    };
};