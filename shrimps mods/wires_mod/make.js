const webpackConfig = require("./webpack.config");
const atlasLoader = require("./atlas");
const sass = require("node-sass");
const fs = require("fs");
const webpack = require("webpack");

const jsDir = "./src/js";
const mainJsFile = "./src/js/main.js";

const mainCssFile = "./src/css/main.scss";

const atlasConfig = "./atlas.json";
const atlasRaw = "./atlas_raw";
const atlas = "./atlas";
const icons = "./icons";

const themes = "./themes";

const bundle = "bundle.js";
const bundlePath = "./build/";

var make = () => {
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
            themesPath: themes,
            css: restult.css,
        }),
        () => {
            console.log("Completed bundle.js");
        }
    );
};
make();

const cors = require("cors");
const express = require("express");
const chokidar = require("chokidar");

var server = express();
server.use(cors());
server.use("/mod", express.static(__dirname + "/build/bundle.js"));

server.listen(3011, () => {
    console.log("Listening on port 3011");
});

// chokidar.watch(dir).on("all", (event, path) => {
//     make();
//     console.log("Rebuild");
// });