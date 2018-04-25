const Auction = require('../models/auction.server.model');
const errors = require('../models/errors');
const logic = require('../models/logic');

exports.list = function (req, res) {
    let startIndex, count, q, categoryid, seller, bidder, winner;
    for (let p in req.query) {
        let value = req.query[p];
        switch (p) {
            case "startIndex":
                startIndex = value;
                break;
            case "count":
                count = value;
                break;
            case "q":
                q = value;
                break;
            case "category-id":
                categoryid = value;
                break;
            case "seller":
                seller = value;
                break;
            case "bidder":
                bidder = value;
                break;
            case "winner":
                winner = value;
                break;
        }
    }
    let values = [
        startIndex,
        count,
        q,
        categoryid,
        seller,
        bidder,
        winner
    ];
    Auction.getAll(values, function (result) {
        if (result["ERROR"] === errors.ERROR_SELECTING) {
            res.statusCode = 500;
            res.statusMessage = "Internal server error";
            res.send();
        } else if (result["ERROR"] === errors.ERROR_NAN) {
            res.statusCode = 400;
            res.statusMessage = "Bad request.";
            res.send();
        } else {
            res.statusCode = 200;
            res.statusMessage = "OK";
            res.json(result);
        }
    });
};

exports.create = function (req, res) {

    let userid;
    if (req.headers["x-authorization"] === logic.token) { //if auth'd
        userid = logic.token_user_id;
    } else {
        res.statusCode = 401;
        res.statusMessage = "Unauthorized";
        res.send();
        return;
    }

    let auction_data = {
        "title": req.body.title,
        "categoryid": req.body.categoryId,
        "description": req.body.description,
        "reserveprice": req.body.reservePrice,
        "startingprice": req.body.startingBid,
        "creationdate": logic.getCurrentDate(),
        "startingdate": req.body.startDateTime,
        "endingdate": req.body.endDateTime,
        "userid": userid
    };

    // Check everything is there and dates are valid
    if (!logic.arePositiveIntegers([auction_data["categoryid"], auction_data["reserveprice"], auction_data["startingprice"],
            auction_data["startingdate"], auction_data["endingdate"]])
        || auction_data["title"] === undefined
        || auction_data["description"] === undefined
        || auction_data["startingdate"] < new Date().getTime()
        || auction_data["startingdate"] > auction_data["endingdate"]) {
        // malformed data
        res.statusCode = 400;
        res.statusMessage = "Malformed auction data";
        res.send();
    } else {
        // valid data

        //Convert integers to decimal or datetime, in order to store it in the DB
        let reserveprice = auction_data["reserveprice"] / 100;
        let startingprice = auction_data["startingprice"] / 100;
        let startingdate = logic.unixTimeMillisecondsToDatetimeString(auction_data["startingdate"]);
        let endingdate = logic.unixTimeMillisecondsToDatetimeString(auction_data["endingdate"]);

        let values = [
            [auction_data['title'].toString()],
            [auction_data['categoryid'].toString()],
            [auction_data['description'].toString()],
            [reserveprice.toString()],
            [startingprice.toString()],
            [auction_data['creationdate'].toString()],
            [startingdate],
            [endingdate],
            [userid.toString()]
        ];

        Auction.insert(values, function (result) {
            if (result["ERROR"] === errors.ERROR_SELECTING) {
                res.statusCode = 500;
                res.statusMessage = "Internal server error";
                res.send();
            } else if (result["ERROR"] === errors.ERROR_BAD_REQUEST) {
                res.statusCode = 400;
                res.statusMessage = "Bad request: invalid category id";
                res.send();
            } else {
                res.statusCode = 201;
                res.statusMessage = "OK";
                res.json({"id": result.insertId});
            }
        });
    }
};

exports.view = function (req, res) {
    let id = req.params.id;
    Auction.getOne(id, function (result) {
        if (result["ERROR"] === errors.ERROR_SELECTING) {
            res.statusCode = 500;
            res.statusMessage = "Internal server error";
            res.send();
        } else if (result["ERROR"] === errors.ERROR_NAN) {
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
            res.json(logic.createNewAuctionJson(result));
        }
    });
};

exports.edit = function (req, res) {


    let id = req.params.id;
    let auction_data = {
        "categoryid": req.body.categoryId,
        "title": req.body.title,
        "description": req.body.description,
        "startingdate": req.body.startDateTime,
        "endingdate": req.body.endDateTime,
        "reserveprice": req.body.reservePrice,
        "startingprice": req.body.startingBid,
    };

    //Convert integers to decimal or datetime, in order to store it in the DB
    let reserveprice;
    let startingprice;
    let startingdate;
    let endingdate;
    try {
        reserveprice = logic.centsToDollars(auction_data["reserveprice"]);
        startingprice = logic.centsToDollars(auction_data["startingprice"]);
        startingdate = logic.unixTimeMillisecondsToDatetimeString(auction_data["startingdate"]);
        endingdate = logic.unixTimeMillisecondsToDatetimeString(auction_data["endingdate"]);
    } catch (err) {
        res.statusCode = 400;
        res.statusMessage = "Bad request: currency/timestamp";
        res.send();
    }

    if (auction_data['categoryid'] != null && !(logic.isPositiveInteger(auction_data['categoryid']))) {
        res.statusCode = 400;
        res.statusMessage = "Bad request: category id";
        res.send();
    }

    let values = [
        id,
        auction_data['categoryid'],
        auction_data['title'],
        auction_data['description'],
        startingdate,
        endingdate,
        reserveprice,
        startingprice,
        req.headers["x-authorization"]
    ];

    Auction.alter(values, function (result) {
        if (result["ERROR"] === errors.ERROR_SELECTING) {
            res.statusCode = 500;
            res.statusMessage = "Internal server error";
            res.send();
        } else if (result["ERROR"] === errors.ERROR_AUCTION_DOES_NOT_EXIST) {
            res.statusCode = 404;
            res.statusMessage = "Not found.";
            res.send();
        } else if (result["ERROR"] === errors.ERROR_AUCTION_STARTED) {
            res.statusCode = 403;
            res.statusMessage = "Forbidden - the auction has begun.";
            res.send();
        } else if (result["ERROR"] === errors.ERROR_BAD_REQUEST) {
            res.statusCode = 400;
            res.statusMessage = "Bad request";
            res.send();
        } else if (result["ERROR"] === errors.ERROR_UNAUTHORISED) {
            res.statusCode = 401;
            res.statusMessage = "Unauth'd";
            res.send();
        } else {
            res.statusCode = 201;
            res.statusMessage = "OK";
            res.send();
        }
    });
};

exports.getBids = function (req, res) {
    let id = req.params.id;
    Auction.getBids(id, function (result) {
        if (result["ERROR"] === errors.ERROR_SELECTING) {
            res.statusCode = 500;
            res.statusMessage = "Internal server error";
            res.send();
        } else if (result["ERROR"] === errors.ERROR_NAN) {
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
            res.json(logic.createNewBidsJsonArray(result));
        }
    });
};

/**
 * Adds a bid, providing:
 *     the user is authenticated (or 401)
 *     the auction id is a valid positive integer (or 400)
 *     the amount is a valid positive integer (or 400)
 *     the auction exists (or 404)
 *     the auction doesn't belong to the buyer (or 400)
 *     the auction has started (or 400)
 *     the auction hasn't expired (or 400)
 *     the amount is higher than the current highest bid (or 400)
 */
exports.addBid = function (req, res) {
    let auction_id = parseInt(req.params.id);
    let amount = parseInt(req.query["amount"]);
    let token = req.headers["x-authorization"];

    if (!logic.arePositiveIntegers([auction_id, amount])) {
        res.statusCode = 400;
        res.statusMessage = "Bad request: auction id and amount shouold be positive integers.";
        res.send();
    }

    let values = [auction_id, amount, token];

    Auction.addBid(values, function (result) {
        if (result["ERROR"] === errors.ERROR_SELECTING) {
            res.statusCode = 500;
            res.statusMessage = "Internal server error";
            res.send();
        } else if (result["ERROR"] === errors.ERROR_BAD_REQUEST) {
            res.statusCode = 400;
            res.statusMessage = "Bad request.";
            res.send();
        } else if (result["ERROR"] === errors.ERROR_UNAUTHORISED) {
            res.statusCode = 401;
            res.statusMessage = "unauth'd";
            res.send();
        } else if (result["ERROR"] === errors.ERROR_AUCTION_DOES_NOT_EXIST) {
            res.statusCode = 404;
            res.statusMessaage = "Not found";
            res.send();
        } else {
            res.statusCode = 201;
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