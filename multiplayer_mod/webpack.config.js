const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const { getRevision, getVersion, getAllResourceImages } = require("./buildutils");
const lzString = require("lz-string");
const CircularDependencyPlugin = require("circular-dependency-plugin");
const StringReplacePlugin = require("string-replace-webpack-plugin");
const FriendlyErrorsWebpackPlugin = require("friendly-errors-webpack-plugin");

module.exports = ({ es6 = false, bundlePath = "./build", bundle = "bundle.js", dir = "./src/js", mainFile = "./src/js/main.js", iconsPath = "./icons", atlasPath = "./atlas", themesPath = "./themes", css = "", standalone = false }) => {
    var icons = new Map();
    var iconFiles = fs.readdirSync(iconsPath);
    for (let i = 0; i < iconFiles.length; i++) {
        const filename = iconFiles[i];
        icons.set(path.basename(filename, path.extname(filename)), "data:image/png;base64," + Buffer.from(fs.readFileSync(path.join(iconsPath, filename))).toString("base64"));
    }

    var themes = new Map();
    var themeFiles = fs.readdirSync(themesPath);
    for (let i = 0; i < themeFiles.length; i++) {
        const filename = themeFiles[i];
        themes.set(path.basename(filename, path.extname(filename)), fs.readFileSync(path.join(themesPath, filename), "utf8"));
    }

    var atlases = new Map();
    var atlasJsons = new Map();
    var atlasFiles = fs.readdirSync(atlasPath);
    for (let i = 0; i < atlasFiles.length; i++) {
        const filename = atlasFiles[i];
        const ext = path.extname(filename);
        const name = path.basename(filename, ext);
        const readPath = path.join(atlasPath, filename);

        if (ext === ".png") {
            atlases.set(name, "data:image/png;base64," + Buffer.from(fs.readFileSync(readPath)).toString("base64"));
        } else if (ext === ".json") {
            atlasJsons.set(name, JSON.parse(fs.readFileSync(readPath, "utf8")));
        }
    }
    css = css.toString("utf8");
    return {
        entry: path.resolve(__dirname, mainFile),
        context: path.resolve(__dirname, dir),
        plugins: [
            new FriendlyErrorsWebpackPlugin(),
            new webpack.ProvidePlugin({
                process: "process/browser",
            }),
            new webpack.DefinePlugin({
                assert: "window.assert",
                assertAlways: "window.assert",
                abstract: "window.assert(false, 'abstract method called of: ' + (this.name || (this.constructor && this.constructor.name)));",
                G_HAVE_ASSERT: "true",
                G_APP_ENVIRONMENT: JSON.stringify("dev"),
                G_TRACKING_ENDPOINT: JSON.stringify(lzString.compressToEncodedURIComponent("http://localhost:10005/v1")),
                G_IS_DEV: "true",
                G_IS_RELEASE: "false",
                G_IS_MOBILE_APP: "false",
                G_IS_BROWSER: "true",
                G_IS_STANDALONE: standalone ? "true" : "false",
                G_BUILD_TIME: "" + new Date().getTime(),
                G_BUILD_COMMIT_HASH: JSON.stringify(getRevision()),
                G_BUILD_VERSION: JSON.stringify(getVersion()),
                G_ALL_UI_IMAGES: JSON.stringify(getAllResourceImages()),
            }),
            new StringReplacePlugin(),
            new CircularDependencyPlugin({
                // exclude detection of files based on a RegExp
                exclude: /node_modules/,

                // add errors to webpack instead of warnings
                failOnError: true,

                // allow import cycles that include an asyncronous import,
                // e.g. via import(/* webpackMode: "weak" */ './file.js')
                allowAsyncCycles: false,

                // set the current working directory for displaying module paths
                cwd: path.join(__dirname, dir),
            }),
        ],
        resolve: {
            alias: {
                // Ensure compatibility to original bootstrap
                debug$: path.join(__dirname, "node_modules", "debug", "src", "browser.js"),
            },
        },
        module: {
            rules: [{
                    test: /\.js$/,
                    enforce: "pre",
                    exclude: /node_modules/,
                    use: [{
                        loader: "webpack-strip-block",
                        options: {
                            start: "typehints:start",
                            end: "typehints:end",
                        },
                    }, ],
                },
                {
                    test: /\.js$/,
                    use: [
                        // "thread-loader",
                        {
                            loader: "babel-loader?cacheDirectory",
                            options: {
                                configFile: require.resolve(es6 ? "./babel-es6.config.js" : "./babel.config.js"),
                            },
                        },
                        "uglify-template-string-loader", // Finally found this plugin
                        StringReplacePlugin.replace({
                            replacements: [{
                                    pattern: /"\*\*\{css\}\*\*"/g,
                                    replacement: (match, p1) => {
                                        return "`" + css + "`";
                                    },
                                },
                                {
                                    pattern: /\*\*\{icons_([A-Za-z0-9_]{0,})\}\*\*/g,
                                    replacement: (match, p1) => {
                                        return icons.get(p1);
                                    },
                                },
                                {
                                    pattern: /"\*\*\{atlas_([A-Za-z0-9_]{0,})\}\*\*"/g,
                                    replacement: (match, p1) => {
                                        const atlas = {
                                            src: atlases.get(p1),
                                            atlasData: atlasJsons.get(p1),
                                        };
                                        return "`" + JSON.stringify(atlas) + "`";
                                    },
                                },
                                {
                                    pattern: /"\*\*\{theme_([A-Za-z0-9_]{0,})\}\*\*"/g,
                                    replacement: (match, p1) => {
                                        return themes.get(p1);
                                    },
                                },
                            ],
                        }),
                    ],
                },
            ],
        },
        output: {
            filename: bundle,
            path: path.resolve(__dirname, bundlePath),
        },
    };
};