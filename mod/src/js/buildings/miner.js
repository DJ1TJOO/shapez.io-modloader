import { MinerDeepComponent } from "../components/miner_deep";

const Vector = shapezAPI.exports.Vector;
const getBuildingDataFromCode = shapezAPI.exports.getBuildingDataFromCode;
const enumHubGoalRewards = shapezAPI.exports.enumHubGoalRewards;
const generateMatrixRotations = shapezAPI.exports.generateMatrixRotations;

export const addMinerVariant = () => {
    const name = "deep";
    const miner = shapezAPI.ingame.buildings.miner;
    if (!miner.variants) miner.variants = {};
    miner.variants[name] = name;
    miner.avaibleVariants[name] = (root) => root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_miner) && root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_deep_miner);
    miner.overlayMatrices[name] = () => generateMatrixRotations([1, 1, 1, 1, 0, 1, 1, 1, 1]);
    miner.dimensions[name] = () => new Vector(1, 1);
    miner.silhouetteColors[name] = () => "#b37dcd";
    miner.isRemovable[name] = () => true;
    miner.isRotateable[name] = () => true;
    miner.layerByVariant[name] = (root) => "regular";
    miner.setupEntityComponents.push((entity) => {
        if (getBuildingDataFromCode(entity.components.StaticMapEntity.code).variant !== name) return;
        if (entity.components.Miner) entity.removeComponent(shapezAPI.exports.MinerComponent);
        if (!entity.components.MinerDeep) entity.addComponent(new MinerDeepComponent());
    });
    miner.componentVariations[name] = () => {};
    miner.additionalStatistics[name] = (root) => {
        const speed = root.hubGoals.getMinerBaseSpeed() * 2.5;
        return [
            [shapezAPI.translations.ingame.buildingPlacement.infoTexts.speed, shapezAPI.exports.formatItemsPerSecond(speed)]
        ];
    };
};