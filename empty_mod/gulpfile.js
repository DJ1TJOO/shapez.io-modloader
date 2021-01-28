const gulp = require("gulp");
const make = require("./make");
const log = require("fancy-log");

let server = cb => {
    const cors = require("cors");
    const express = require("express");

    var server = express();
    server.use(cors());
    server.use("/mod", express.static(__dirname + "/build/bundle.js"));

    server.listen(3010, () => {
        log("Listening on port 3010");
        return cb();
    });
};

exports.default = () => {
    gulp.series(make, server)();
    gulp.watch("./src", make);
    gulp.watch("./themes", make);
    gulp.watch("./icons", make);
    gulp.watch("./atlas_raw", make);
};