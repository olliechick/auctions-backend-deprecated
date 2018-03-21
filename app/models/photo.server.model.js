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
        });/*
    }).then(function () {

        return new Promise(function (resolve, reject) {

        }).catch(function (err) {
            throw err;
        });
*/
    }).then(function() {
        console.log(2);
        // All checks are complete, get the file.
        return new Promise(function (resolve, reject) {
            fs.readFile(filepath + ".png", function (err, data) {
                console.log(data);
                if (err) {
                    if (err.code === 'ENOENT') {
                        fs.readFile(filepath + ".jpeg", function(err, data) {
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
    }).then(function(result) {
        return done(result);
    }).catch(function (err) {
        return done({"ERROR": err});
    });


};

exports.addPhoto = function (id, done) {

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
    }).then(function () {
        console.log(2);

        return new Promise(function (resolve, reject) {

            //todo auth
            /*
                if (!authorised) {
                    reject(errors.ERROR_UNAUTHORISED)
                } else {*/
            resolve();

        }).catch(function (err) {
            throw err;
        });
    }).then(function () {
        console.log(3);

        return new Promise(function (resolve, reject) {

            db.get_pool().query("SELECT * FROM bid WHERE bid_auctionid = ?", [id], function (err, rows) {
                console.log("R: " + rows);
                if (err) reject(errors.ERROR_SELECTING);
                else if (rows.length >= 1) {
                    reject(errors.ERROR_BIDDING);
                } else {
                    resolve(1);
                }
            });

        }).catch(function (err) {
            console.log("ERR: " + err);
            throw err;
        });/*
    }).then(function () {

        return new Promise(function (resolve, reject) {

        }).catch(function (err) {
            throw err;
        });
*/
    }).then(function(result) {
        console.log(4);
        return done(result);
    }).catch(function (err) {
        console.log(5, err);
        return done({"ERROR": err});
    });


};

exports.deletePhoto = function (id, done) {
    return null;

};


/*

exports.NAME = function (values, done) {
};
*/

