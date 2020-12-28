const webpackConfig = require("./make/webpack.config");
const atlasLoader = require("./make/atlas");
const sass = require("node-sass");
const webpack = require("webpack");

const dir = "./src";
const jsDir = "./src/js";
const mainJsFile = "./src/js/main.js";

const mainCssFile = "./src/css/main.scss";

const atlasConfig = "./make/atlas.json";
const atlasRaw = "./atlas_raw";
const atlas = "./atlas";
const icons = "./icons";

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
            css: restult.css,
        }),
        () => {}
    );
};
make();

const cors = require("cors");
const express = require("express");
const fs = require("fs");
const chokidar = require("chokidar");

var server = express();
server.use(cors());
server.use("/mod", express.static(__dirname + "/build/bundle.js"));

server.listen(3006, () => {
    console.log("Listening on port 3006");
});

chokidar.watch(dir).on("all", (event, path) => {
    make();
    console.log("Rebuild");
});