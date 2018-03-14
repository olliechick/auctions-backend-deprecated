const Database = require('../models/database.server.model');

exports.reset = function (req, res) {
    Database.reset(function (err, result) {
        if (err) {
            res.statusCode = 500;
            res.statusMessage = "Internal server error";
        } else {
            res.statusCode = 200;
            res.statusMessage = "OK";
        }
        res.send();
    });
};

exports.resample = function (req, res) {
    Database.resample(function (err) {
        if (err) {
            res.statusCode = 500;
            res.statusMessage = "Internal server error";
        } else {
            res.statusCode = 201;
            res.statusMessage = "Sample of data has been reloaded.";
        }
        res.send();
    });
};