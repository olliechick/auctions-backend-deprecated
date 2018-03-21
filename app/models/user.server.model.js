const db = require('../../config/db');
const errors = require('./errors');
const logic = require('./logic');

exports.addUser = function (values, done) {

    let numberOfValues = 5;
    let queryString = "INSERT INTO auction_user (user_username, user_givenname, user_familyname, user_email, user_password)" +
        "VALUES (?" + ", ?".repeat(numberOfValues - 1) + ")";

    console.log(queryString, values);
    db.get_pool().query(queryString, values, function (err, result) {
        if (err) return done({"ERROR": errors.ERROR_SELECTING});
        return done(result);
    });

};


exports.login = function (values, done) {

    // First, check if there is a user already logged in. If there is, then send a server error.
    // This system does not currently allow multiple logins at the same time.
    if (logic.token_user_id !== null) {
        return done({"ERROR": errors.ERROR_ON_SERVER})
    }


    let username, email, password;
    [username, email, password] = values;
    console.log("username, password, email", username, password, email);

    new Promise(function (resolve, reject) {
        if (username === undefined) {
            // using email
            let credentials = [email, password];
            let queryString = "SELECT * from auction_user where user_email = ? AND user_password = ?";
            db.get_pool().query(queryString, credentials, function (err, rows) {
                console.log(queryString, credentials);
                if (err) reject(errors.ERROR_SELECTING);
                if (rows.length === 1) {
                    logic.token = crypto.randomBytes(32).toString("base64"); //shoutout to jack steel
                    logic.token_user_id = rows[0]["user_id"];
                    resolve();
                } else {
                    // no user with those credentials (or multiple! but there shouldn't be)
                    reject(errors.ERROR_BAD_REQUEST);
                }
            });

        } else {
            // using username
            //todo implement
        }
    }).then(function () {
        return done();
    }).catch(function (err) {
        return done({"ERROR": err});
    });
};


exports.logout = function (token, done) {

    if (logic.token === null) {
        return done({"ERROR": errors.ERROR_UNAUTHORISED})
    } else if (token.toString() === logic.token.toString()) {
        logic.token_user_id = null;
        logic.token = null;
        return done(1);
    } else {
        return done({"ERROR": errors.ERROR_UNAUTHORISED})
    }
};


/*
    new Promise(function (resolve, reject) {
        //async code block
    }).then(function () {

        return new Promise(function (resolve, reject) {
            //async code block
        }).catch(function (err) {
            throw err;
        });
    }).then(function(result) {
        return done(result);
    }).catch(function (err) {
        return done({"ERROR": err});
    });
*/


/*

exports.NAME = function (values, done) {
};
*/

