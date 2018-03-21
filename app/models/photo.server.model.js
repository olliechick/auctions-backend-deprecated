const db = require('../../config/db');
const errors = require('./errors');
const logic = require('./logic');


exports.showPhoto = function (id, done) {

    if (!logic.isPositiveInteger(id)) {
        return done({"ERROR": errors.ERROR_BAD_REQUEST});
    }

    let filepath = __dirname + "/../../uploads/" + id;
    //TODO check if png or jpg (or jpeg?)


    // Check the auction exists
    new Promise(function (resolve, reject) {
        console.log(1);
        db.get_pool().query("SELECT * from auction where auction_id = ?", [id], function (err, rows) {
            if (err) reject(errors.ERROR_SELECTING);
            else if (rows.length === 0) {
                reject(errors.ERROR_AUCTION_DOES_NOT_EXIST);
            } else if (rows.length > 1) {
                reject(errors.ERROR_SELECTING); // multiple auctions with same id - panic!
            } else {
                resolve();
            }
        });
        /*
            }).then(function () {

                return new Promise(function (resolve, reject) {

                }).catch(function (err) {
                    throw err;
                });
        */
    }).then(function () {
        console.log(2);
        // All checks are complete, get the file.
        return new Promise(function (resolve, reject) {
            fs.readFile(filepath + ".png", function (err, data) {
                console.log(data);
                if (err) {
                    if (err.code === 'ENOENT') {
                        fs.readFile(filepath + ".jpeg", function (err, data) {
                            console.log(data);
                            if (err) {
                                if (err.code === 'ENOENT') {
                                    fs.readFile(__dirname + "/../../uploads/default.png", function (err, data) {
                                        if (err) reject(errors.ERROR_ON_SERVER);
                                        else resolve({"filetype": "png", "data": data});
                                    });
                                } else {
                                    reject(errors.ERROR_ON_SERVER);
                                }
                            } else {
                                resolve({"filetype": "jpeg", "data": data});
                            }
                        });
                    } else {
                        reject(errors.ERROR_ON_SERVER);
                    }
                } else {
                    resolve({"filetype": "png", "data": data});
                }
            });
        }).then(function (result) {
            return result;
        }).catch(function (err) {
            throw err;
        });
    }).then(function (result) {
        return done(result);
    }).catch(function (err) {
        return done({"ERROR": err});
    });


};

/**
 * Checks if the user can manipulate the auction. Criteria:
 *      auction_id must represent a valid auction
 *      buyer_id must be authorised to edit it
 *      the auction must not have started
 * Returns a promise that will be rejected if any of these criteria are not met.
 * Throws:
 *      errors.ERROR_SELECTING if there is a generic server error
 *      errors.ERROR_AUCTION_DOES_NOT_EXIST if the auction doesn't exist
 *      errors.ERROR_UNAUTHORISED if the user isn't authorised
 *      errors.ERROR_AUCTION_STARTED if the auction has started
 *
 */
function checkIfUserCanManipulateAuction(auction_id, token) {
    console.log(0);
    return new Promise(function (resolve, reject) {
        console.log(1);
        // Check the auction exists
        db.get_pool().query("SELECT * from auction where auction_id = ?", [auction_id], function (err, rows) {
            console.log(1 + ": " + err, rows);
            if (err) reject(errors.ERROR_SELECTING);
            else if (rows.length === 0) {
                console.log('doesnt esxit');
                reject(errors.ERROR_AUCTION_DOES_NOT_EXIST);
            } else if (rows.length > 1) {
                reject(errors.ERROR_SELECTING); // multiple auctions with same id - panic!
            } else {
                // Authorise
                user_id = rows[0]["auction_userid"];
                if (!(user_id === logic.token_user_id && token === logic.token)) {
                    console.log('unathd:', user_id, logic.token_user_id, token, logic.token);
                    reject(errors.ERROR_UNAUTHORISED);
                } else resolve();
            }
        });
    }).then(function () {
        console.log(3);

        return new Promise(function (resolve, reject) {

            queryString = "SELECT * FROM auction WHERE auction_id = ? AND auction_startingdate > '" +
                logic.getCurrentDate() + "'";
            db.get_pool().query(queryString, [auction_id], function (err, rows) {
                console.log("R: " + rows);
                if (err) reject(errors.ERROR_SELECTING);
                else if (rows.length === 0) {
                    reject(errors.ERROR_AUCTION_STARTED);
                } else {
                    resolve(1);
                }
            });

        }).catch(function (err) {
            console.log("ERR: " + err);
            throw err;
        });
    });
}

exports.addPhoto = function (values, done) {
    let auction_id, token;
    [auction_id, token] = values;

    checkIfUserCanManipulateAuction(auction_id, token).then(function (result) {
        console.log(900, result);
        return done(result);
    }).catch(function (err) {
        console.log(800, err);
        return done({"ERROR": err});
    });
};

exports.deletePhoto = function (values, done) {
    let auction_id, token;
    [auction_id, token] = values;

    let filepath = __dirname + "/../../uploads/" + auction_id;
    checkIfUserCanManipulateAuction(auction_id, token).then(function () {

        return new Promise(function (resolve, reject) {
            fs.unlink(filepath + ".jpeg", function (err) {
                if (err) {
                    if (err.code === 'ENOENT') {
                        fs.unlink(filepath + ".png", function (err) {
                            if (err) {
                                if (err.code === 'ENOENT') {
                                    resolve(1);
                                } else {
                                    reject(errors.ERROR_ON_SERVER);
                                }
                            } else {
                                resolve(1);
                            }
                        });
                    } else {
                        reject(errors.ERROR_ON_SERVER);
                    }
                } else {
                    resolve(1);
                }
            });
        }).catch(function (err) {
            throw err;
        });

    }).then(function (result) {
        return done(result);
    }).catch(function (err) {
        console.log(err);
        return done({"ERROR": err});
    });


};


/*
    new Promise(function (resolve, reject) {

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

