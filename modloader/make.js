const webpackConfig = require("./webpack.config");
const path = require("path");
const atlasLoader = require("./atlas");
const webpack = require("webpack");

const srcDir = "./src";
const mainFile = "./src/main.js";
const bundle = "bundle.js";
const bundlePath = "./build/";
const atlasConfig = "./atlas.json";
const atlasRaw = "./atlas_raw";
const atlas = "./atlas";
const icons = "./icons";

atlasLoader.create(atlasConfig, atlasRaw, atlas);
webpack(
    webpackConfig({
        es6: false,
        bundlePath: bundlePath,
        bundle: bundle,
        dir: srcDir,
        mainFile: mainFile,
        iconsPath: icons,
        atlasPath: atlas,
    }),
    () => {}
);