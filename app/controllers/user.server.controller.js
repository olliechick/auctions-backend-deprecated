const User = require('../models/user.server.model');
const errors = require('../models/errors');
const logic = require('../models/logic');


exports.addUser = function (req, res) {
    let values = [
        req.body.username,
        req.body.givenName,
        req.body.familyName,
        req.body.email,
        req.body.password
    ];

    for (let i = 0; i < values.length; i++) {
        if (values[i] === undefined) {
            res.statusCode = 400;
            res.statusMessage = "Malformed request";
            res.send();
        }
    }

    User.addUser(values, function (result) {
        if (result["ERROR"] === errors.ERROR_SELECTING) {
            res.statusCode = 500;
            res.statusMessage = "Internal server error";
            res.send();
        } else {
            res.statusCode = 201;
            res.statusMessage = "OK";
            res.json({"id": result.insertId});
        }
    });
};


exports.login = function (req, res) {
    let username = req.query["username"];
    let email = req.query["email"];
    let password = req.query["password"];
    values = [username, email, password];

    if ((username === undefined && email === undefined) || password === undefined) {
        res.statusCode = 400;
        res.statusMessage = "No username/email and/or password supplied";
        res.send();
    }

    User.login(values, function (result) {
        console.log('3');
        if (result["ERROR"] === errors.ERROR_SELECTING || result["ERROR"] === errors.ERROR_ON_SERVER) {
            res.statusCode = 500;
            res.statusMessage = "Internal server error";
            res.send();
        } else if (result["ERROR"] === errors.ERROR_BAD_REQUEST) {
            res.statusCode = 400;
            res.statusMessage = "Invalid username/email/password supplied";
            res.send();
        } else {
            res.statusCode = 201;
            res.statusMessage = "OK";
            let jsonfile = {"id": logic.token_user_id, "token": logic.token};
            res.json(jsonfile);
        }
    });
};

exports.logout = function (req, res) {
    User.logout(req.headers["x-api-key"], function (result) {
        console.log('3');
        if (result["ERROR"] === errors.ERROR_UNAUTHORISED) {
            res.statusCode = 401;
            res.statusMessage = "Unauthorised";
            res.send();
        } else {
            res.statusCode = 200;
            res.statusMessage = "OK";
            res.send();
        }
    });
};


/*

exports.NAME = function (req, res) {
    return null;
};
*/