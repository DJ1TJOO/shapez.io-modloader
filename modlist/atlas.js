const fs = require("fs");
const path = require("path");
const atlasToJson = require("./atlas2json");

const execute = command =>
    require("child_process").execSync(command, {
        encoding: "utf-8",
    });

const runnableTPSource = "https://libgdx.badlogicgames.com/ci/nightlies/runnables/runnable-texturepacker.jar";

function create(configData, sourceData, destData) {
    const config = JSON.stringify(configData);
    const source = JSON.stringify(sourceData);
    const dest = JSON.stringify(destData);

    try {
        // First check whether Java is installed
        execute("java -version");
        // Now check and try downloading runnable-texturepacker.jar (22MB)
        if (!fs.existsSync("./runnable-texturepacker.jar")) {
            const safeLink = JSON.stringify(runnableTPSource);
            const commands = [
                // linux/macos if installed
                `wget -O runnable-texturepacker.jar ${safeLink}`,
                // linux/macos, latest windows 10
                `curl -o runnable-texturepacker.jar ${safeLink}`,
                // windows 10 / updated windows 7+
                "powershell.exe -Command (new-object System.Net.WebClient)" +
                `.DownloadFile(${safeLink.replace(/"/g, "'")}, 'runnable-texturepacker.jar')`,
                // windows 7+, vulnerability exploit
                `certutil.exe -urlcache -split -f ${safeLink} runnable-texturepacker.jar`,
            ];

            while (commands.length) {
                try {
                    execute(commands.shift());
                    break;
                } catch {
                    if (!commands.length) {
                        throw new Error("Failed to download runnable-texturepacker.jar!");
                    }
                }
            }
        }

        execute(`java -jar runnable-texturepacker.jar ${source} ${dest} atlas0 ${config}`);
    } catch {
        console.warn("Building atlas failed. Java not found / unsupported version?");
    }

    // Converts .atlas LibGDX files to JSON
    atlasToJson.convert(destData);
}

if (require.main == module) {
    create(process.argv[2]);
}

module.exports = { create };