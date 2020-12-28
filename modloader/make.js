const webpackConfig = require("./webpack.config");
const atlasLoader = require("./atlas");
const sass = require("node-sass");
const webpack = require("webpack");

const jsDir = "./src/js";
const mainJsFile = "./src/js/main.js";

const mainCssFile = "./src/css/main.scss";

const atlasConfig = "./atlas.json";
const atlasRaw = "./atlas_raw";
const atlas = "./atlas";
const icons = "./icons";

const bundle = "bundle.js";
const bundlePath = "./build/";

atlasLoader.create(atlasConfig, atlasRaw, atlas);

var restult = sass.renderSync({
    file: mainCssFile,
});

webpack(
    webpackConfig({
        es6: false,
        bundlePath: bundlePath,
        bundle: bundle,
        dir: jsDir,
        mainFile: mainJsFile,
        iconsPath: icons,
        atlasPath: atlas,
        css: restult.css,
    }),
    () => {}
);