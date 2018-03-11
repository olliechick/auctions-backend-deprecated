const db = require('../../config/db');
const fs = require('fs');
const resetFilename = __dirname + '/../../database/create_database.sql';

exports.reset = function (done) {
    let queryString = fs.readFileSync(resetFilename, "utf8");

    db.get_pool().query(queryString, function (err, result) {
        if (err) return done(err);
        done(result);
    });
};

exports.resample = function () {
    return null;
};