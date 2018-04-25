const Photo = require('../models/photo.server.model');
const errors = require('../models/errors');
const logic = require('../models/logic');

exports.showPhoto = function (req, res) {
    let auction_id = parseInt(req.params.id);

    Photo.showPhoto(auction_id, function (result) {
        if (result["ERROR"] === errors.ERROR_ON_SERVER || result["ERROR"] === errors.ERROR_SELECTING) {
            res.statusCode = 500;
            res.statusMessage = "Internal server error";
            res.send();
        } else if (result["ERROR"] === errors.ERROR_BAD_REQUEST) {
            res.statusCode = 400;
            res.statusMessage = "Bad request.";
            res.send();
        } else if (result["ERROR"] === errors.ERROR_AUCTION_DOES_NOT_EXIST) {
            res.statusCode = 404;
            res.statusMessage = "Not found";
            res.send();
        } else {
            res.statusCode = 200;
            res.statusMessage = "OK";
            res.setHeader('content-type', 'image/' + result["filetype"]);
            res.send(result["data"]);
        }
    });
};

exports.addPhoto = function (req, res) {
    let id = parseInt(req.params.id);
    let token = req.headers["x-authorization"];
    let values = [id, token];

    Photo.addPhoto(values, function (result) {

        if (result["ERROR"] === errors.ERROR_UNAUTHORISED) {
            res.statusCode = 401;
            res.statusMessage = "Unauthorised";
            res.send();
        } else if (result["ERROR"] === errors.ERROR_AUCTION_DOES_NOT_EXIST) {
            res.statusCode = 404;
            res.statusMessage = "Not found";
            res.send();
        } else if (result["ERROR"] === errors.ERROR_AUCTION_STARTED) {
            res.statusCode = 400;
            res.statusMessage = "Bad request: the auction has already started.";
            res.send();
        } else if (req.headers['content-type'] === "image/jpeg" || req.headers['content-type'] === "image/png") {
            let fileExtension = req.headers['content-type'].slice(6); //trim the first 6 chars: "image/"
            try {
                //First, delete auction's photo
                new Promise(function (resolve, reject) {
                    Photo.deletePhoto(values, function (result) {
                        if (result["ERROR"] === errors.ERROR_ON_SERVER) {
                            reject(errors.ERROR_ON_SERVER);
                        } else {
                            resolve();
                        }
                    });

                }).then(function () {

                    return new Promise(function (resolve, reject) {
                        // Then add the photo and send response
                        req.pipe(fs.createWriteStream(__dirname + "/../../uploads/" + id + '.' + fileExtension));
                        resolve();
                    }).catch(function (err) {
                        throw err;
                    });

                }).then(function() {
                    res.statusCode = 201;
                    res.statusMessage = "Photo saved";
                    res.send();
                }).catch(function (err) {
                    throw err;
                });

            } catch (err) {
                res.statusCode = 500;
                res.statusMessage = "Internal server error";
                res.send();
            }
        } else {
            // The client sent something with a content-type that we don't accept
            res.statusCode = 400;
            res.statusMessage = "Bad request: only jpeg and png are accepted.";
            res.send();
        }
    });
};

exports.deletePhoto = function (req, res) {
    let id = parseInt(req.params.id);
    let token = req.headers["x-authorization"];
    let values = [id, token];

    Photo.deletePhoto(values, function (result) {
        if (result["ERROR"] === errors.ERROR_UNAUTHORISED) {
            res.statusCode = 401;
            res.statusMessage = "Unauthorised";
            res.send();
        } else if (result["ERROR"] === errors.ERROR_AUCTION_DOES_NOT_EXIST) {
            res.statusCode = 404;
            res.statusMessage = "Not found";
            res.send();
        } else if (result["ERROR"] === errors.ERROR_AUCTION_STARTED) {
            res.statusCode = 401; //should be 400, but not in spec
            res.statusMessage = "Bad request: the auction has already started.";
            res.send();
        } else if (result["ERROR"] === errors.ERROR_ON_SERVER) {
            res.statusCode = 500;
            res.statusMessage = "Internal server error";
            res.send();
        } else {
            res.statusCode = 201;
            res.statusMessage = "Photo deleted";
            res.send();
        }
    });
};

/*

exports.NAME = function (req, res) {
    return null;
};
*/