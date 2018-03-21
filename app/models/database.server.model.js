const db = require('../../config/db');
const fs = require('fs');
const resetFilename = __dirname + '/../../database/create_database.sql';
const resampleFilename = __dirname + '/../../database/load_data.sql';

exports.reset = function (done) {
    let queryString = fs.readFileSync(resetFilename, "utf8");

    db.get_pool().query(queryString, function (err, result) {
        if (err) return done(true, err);
        done(false, result);
    });

    //todo delete photos
};

exports.resample = function (done) {
    let queryString = fs.readFileSync(resampleFilename, "utf8");

    db.get_pool().query(queryString, function(err) {
        if (err) return done(true);
        done(false);
    });
};