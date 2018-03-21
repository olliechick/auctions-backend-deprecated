const db = require('../../config/db');
const fs = require('fs');
const resetFilename = __dirname + '/../../database/create_database.sql';
const resampleFilename = __dirname + '/../../database/load_data.sql';
const Photo = require('../models/photo.server.model');

exports.reset = function (done) {
    let queryString = fs.readFileSync(resetFilename, "utf8");

    db.get_pool().query(queryString, function (err, result) {
        if (err) return done(true, err);
        done(false, result);
    });

    //todo Delete photos
    //exec("mv ../../uploads/default.png ../../default.png; rm ../../uploads/*; mv ../../default.png ../../uploads/default.png")
};

exports.resample = function (done) {
    let queryString = fs.readFileSync(resampleFilename, "utf8");

    db.get_pool().query(queryString, function(err) {
        if (err) return done(true);
        done(false);
    });
};