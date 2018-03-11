const Database = require('../models/database.server.model');

exports.reset = function (req, res) {
    Database.reset(function (result) {
        res.json(result)
    });
};

exports.resample = function (req, res) {
    Database.resample();
};