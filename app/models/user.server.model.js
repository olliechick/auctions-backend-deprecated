const db = require('../../config/db');
const errors = require('./errors');
const logic = require('./logic');

exports.addUser = function (values, done) {
    let username, givenName, familyName, email, password;
    [username, givenName, familyName, email, password] = values;

    new Promise(function (resolve, reject) {
        //maintain db integrity
        db.get_pool().query("select * from auction_user where user_username = ? or user_email = ?", [username, email], function (err, rows) {
            if (err) reject(errors.ERROR_SELECTING);
            if (rows.length > 0) {
                reject(errors.ERROR_BAD_REQUEST);
            } else resolve();
        });
    }).then(function () {

        return new Promise(function (resolve, reject) {

            let numberOfValues = 5;
            let queryString = "INSERT INTO auction_user (user_username, user_givenname, user_familyname, user_email, user_password)" +
                " VALUES (?" + ", ?".repeat(numberOfValues - 1) + ")";

            db.get_pool().query(queryString, values, function (err, result) {
                if (err) reject(errors.ERROR_SELECTING);
                resolve(result);
            });

        }).catch(function (err) {
            throw err;
        });
    }).then(function (result) {
        return done(result);
    }).catch(function (err) {
        return done({"ERROR": err});
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

    new Promise(function (resolve, reject) {
        if (username === undefined) {
            // using email
            let credentials = [email, password];
            let queryString = "SELECT * from auction_user where user_email = ? AND user_password = ?";
            db.get_pool().query(queryString, credentials, function (err, rows) {
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
            let credentials = [username, password];
            let queryString = "SELECT * from auction_user where user_username = ? AND user_password = ?";
            db.get_pool().query(queryString, credentials, function (err, rows) {
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

exports.viewUser = function (values, done) {
    let user_id, token;
    [user_id, token] = values;
    let user_json = {};

    let queryString = "SELECT * from auction_user where user_id = ?";
    db.get_pool().query(queryString, user_id, function (err, rows) {
        if (err) return done({"ERROR": errors.ERROR_SELECTING});
        if (rows.length === 0) return done({"ERROR": errors.ERROR_NOT_FOUND});
        let user = rows[0];
        user_json.username = user["user_username"];
        user_json.givenName = user["user_givenname"];
        user_json.familyName = user["user_familyname"];
        if (user_id === logic.token_user_id && token === logic.token) {
            //authorised
            user_json.email = user["user_email"];
            user_json.accountBalance = user["user_accountbalance"];
        }
        return (done(user_json));
    });
};


/**
 * Adds "SET " to the query string if it is the first SET substatement, or ", " if it isn't.
 * @param firstSet true if this is the first set statement
 * @param queryString the current query
 * @returns {*[]} firstSet, queryString
 */
function setSeparator(firstSet, queryString) {
    if (firstSet) {
        queryString += "SET ";
        firstSet = false;
    } else {
        queryString += ", ";
    }
    return [firstSet, queryString];
}


exports.editUser = function (values, done) {
    let nonNullValues = [];
    let firstSet = true;
    let user_id, token, username, givenName, familyName, email, password;
    [user_id, token, username, givenName, familyName, email, password] = values;
    let queryString = "UPDATE auction_user ";

    if (username != null) {
        [firstSet, queryString] = setSeparator(firstSet, queryString);
        queryString += "user_username = ?";
        nonNullValues.push(username);
    }
    if (givenName != null) {
        [firstSet, queryString] = setSeparator(firstSet, queryString);
        queryString += "user_givenname = ?";
        nonNullValues.push(givenName);
    }
    if (familyName != null) {
        [firstSet, queryString] = setSeparator(firstSet, queryString);
        queryString += "user_familyname = ?";
        nonNullValues.push(familyName);
    }
    if (email != null) {
        [firstSet, queryString] = setSeparator(firstSet, queryString);
        queryString += "user_email = ?";
        nonNullValues.push(email);
    }
    if (password != null) {
        [firstSet, queryString] = setSeparator(firstSet, queryString);
        queryString += "user_password = ?";
        nonNullValues.push(password);
    }

    queryString += " WHERE user_id = ?";
    nonNullValues.push(user_id);

    // Check that user exists
    new Promise(function (resolve, reject) {
        db.get_pool().query("SELECT * FROM auction_user WHERE user_id = ?", user_id, function (err, rows) {
            if (err) reject(errors.ERROR_SELECTING);
            else if(rows.length !== 1) reject(errors.ERROR_UNAUTHORISED);
            else {
                // Check they are authorised
                if (user_id === logic.token_user_id && token === logic.token) resolve();
                else reject(errors.ERROR_UNAUTHORISED);
            }
        });

        // Check that username and email aren't taken
    }).then(function () {
        return new Promise(function (resolve, reject) {
            //maintain db integrity
            db.get_pool().query("select * from auction_user where user_username = ? or user_email = ?", [username, email], function (err, rows) {
                if (err) reject(errors.ERROR_SELECTING);
                if (rows.length > 0) {
                    reject(errors.ERROR_BAD_REQUEST);
                } else resolve();
            });
        }).catch(function (err) {
            throw err;
        });

        // Perform the update
    }).then(function () {
        return new Promise(function (resolve, reject) {
            //maintain db integrity
            db.get_pool().query(queryString, nonNullValues, function (err, rows) {
                if (err) reject(errors.ERROR_SELECTING);
                resolve();
            });
        }).catch(function (err) {
            throw err;
        });

    }).then(function () {
        return done(1);
    }).catch(function (err) {
        return done({"ERROR": err});
    });
};