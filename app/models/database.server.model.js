const db = require('../../config/db');
const fs = require('fs');
const resetFilename = __dirname + '/../../database/create_database.sql';
const resampleFilename = __dirname + '/../../database/load_data.sql';
const Photo = require('../models/photo.server.model');
const logic = require('../models/logic');

exports.reset = function (done) {
    let queryString = fs.readFileSync(resetFilename, "utf8");

    db.get_pool().query(queryString, function (err) {
        if (err) return done(true);
    });

    // Delete photos
    let folder = __dirname + "/../../uploads";
    let filenames = [];
    fs.readdirSync(folder).forEach(file => {
        filenames.push(file);
    });
    let index = filenames.indexOf("default.png");
    filenames.splice(index, 1);

    for (let i = 0; i < filenames.length; i++) {
        let filename = filenames[i];
        fs.unlink(folder + "/" + filename, function (err) {
            if (err) return done(true);
        });
    }

    // Log out user
    logic.token = null;
    logic.token_user_id = null;
    return done(false);
};

exports.resample = function (done) {
    let queryString = fs.readFileSync(resampleFilename, "utf8");

    db.get_pool().query(queryString, function (err) {
        if (err) return done(true);
        done(false);
    });
};