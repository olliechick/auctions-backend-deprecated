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
            console.log(result["data"]);
            res.send(result["data"]);
        }
    });

};

exports.addPhoto = function (req, res) {
    let id = parseInt(req.params.id);

    Photo.addPhoto(id, function (result) {
            if (result["ERROR"] === errors.ERROR_UNAUTHORISED) {
                res.statusCode = 401;
                res.statusMessage = "Unauthorised";
                res.send();
            } else if (result["ERROR"] === errors.ERROR_AUCTION_DOES_NOT_EXIST) {
                res.statusCode = 404;
                res.statusMessage = "Not found";
                res.send();
            } else if (result["ERROR"] === errors.ERROR_BIDDING) {
                console.log('eb');
                res.statusCode = 400;
                res.statusMessage = "Bad request: bidding has already started.";
                res.send();
            } else if (req.headers['content-type'] === "image/jpeg" || req.headers['content-type'] === "image/png") {
                let fileExtension = req.headers['content-type'].slice(6);
                console.log("EXT: " + fileExtension);
                try {
                    //todo delete file with other extension

                    req.pipe(fs.createWriteStream(__dirname + "/../../uploads/" + id + '.' + fileExtension));
                    res.statusCode = 201;
                    res.statusMessage = "Photo saved";
                    res.send();
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
        }
    );
};

exports.deletePhoto = function (req, res) {
    return null;
};

/*

exports.NAME = function (req, res) {
    return null;
};
*/