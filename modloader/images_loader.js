const fs = require("fs");
const path = require("path");
const atlas = require("./atlas.js");

function escapeRegExp(string) {
    return string.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(escapeRegExp(find), "g"), replace);
}
async function load(bundle, configData, sourceData, destData, iconsData) {
    atlas.create(configData, sourceData, destData);

    var data = fs.readFileSync(bundle, "utf8");

    var icons = new Map();
    var iconFiles = fs.readdirSync(iconsData);
    for (let i = 0; i < iconFiles.length; i++) {
        const filename = iconFiles[i];
        icons.set(
            path.basename(filename, path.extname(filename)),
            "data:image/png;base64," +
            Buffer.from(fs.readFileSync(path.join(iconsData, filename))).toString("base64")
        );
    }
    const iconMatches = [...data.matchAll(/\`\*\*\{icons_(.{0,})\}\*\*\`/g)];
    for (let i = 0; i < iconMatches.length; i++) {
        const match = iconMatches[i];
        data = replaceAll(data, match[0], "`" + icons.get(match[1]) + "`");
    }

    var atlases = new Map();
    var atlasJsons = new Map();
    var atlasFiles = fs.readdirSync(destData);
    for (let i = 0; i < atlasFiles.length; i++) {
        const filename = atlasFiles[i];
        const ext = path.extname(filename);
        const name = path.basename(filename, ext);
        const readPath = path.join(destData, filename);

        if (ext === ".png") {
            atlases.set(
                name,
                "data:image/png;base64," + Buffer.from(fs.readFileSync(readPath)).toString("base64")
            );
        } else if (ext === ".json") {
            atlasJsons.set(name, JSON.parse(fs.readFileSync(readPath, "utf8")));
        }
    }
    const atlasMatches = [...data.matchAll(/\`\*\*\{atlas_(.{0,})\}\*\*\`/g)];
    for (let i = 0; i < atlasMatches.length; i++) {
        const match = atlasMatches[i];
        const atlas = {
            src: atlases.get(match[1]),
            atlasData: atlasJsons.get(match[1]),
        };
        data = replaceAll(data, match[0], "`" + JSON.stringify(atlas) + "`");
    }

    fs.writeFileSync(bundle, data);
}

if (require.main == module) {
    load(process.argv[2]);
}

module.exports = { load };