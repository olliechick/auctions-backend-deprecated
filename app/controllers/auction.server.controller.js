const Auction = require('../models/auction.server.model');

function getCurrentDate() {
    let today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth() + 1; //January is 0!
    let yyyy = today.getFullYear();


    if (dd < 10) {
        dd = '0' + dd
    }

    if (mm < 10) {
        mm = '0' + mm
    }

    today = yyyy + "-" + mm + '-' + dd;
    return today;
}

/**
 * Returns true if the passed in string is a valid date string.
 * Valid date is in the form yyyy-mm-dd (length = 10).
 *
 * @param dateString value to check
 * @returns {boolean} true if it is in the right form
 */
function isValidDate(dateString) {
    let yyyy = dateString.substring(0, 3);
    let mm = dateString.substring(5, 6);
    let dd = dateString.substring(8, 9);

    let validDashes = dateString.charAt(4) === '-' && dateString.charAt(7) === '-';
    let validNumbers = !(isNan(yyyy) || isNan(mm) || isNan(dd));
    return validNumbers && validDashes && dateString.length === 9;
}


/**
 * Converts a unix timestamp (in seconds) into a string of the form yyyy-mm-dd hh:MM:ss (e.g. 2018-02-14 00:00:00)
 * @param unixTimeSeconds unix timestamp in seconds
 * @return {string} timestamp in form yyyy-mm-dd hh:MM:ss
 */
function UnixTimeSecondsToDatetimeString(unixTimeSeconds) {
    let unixTimeMilliseconds = unixTimeSeconds * 1000;
    let datetime = new Date(unixTimeMilliseconds);
    let isoString = datetime.toISOString();
    return isoString.slice(0, 10) + " " + isoString.slice(11, 19);
}

/**
 * Returns true if the passed in value is a positive integer.
 *
 * @param int value to check
 * @returns {boolean} true if the value is an integer greater than or equal to 0.
 */
function isPositiveInteger(int) {
    return Number.isInteger(int) && int >= 0;
}

/**
 * Returns true if all the values in the passed in list are positive integers.
 * @param ints list of values to check
 * @returns {boolean} true if every value is an integer greater than or equal to 0.
 */
function arePositiveIntegers(ints) {
    for (let i = 0; i < ints.length; i++) {
        let int = ints[i];
        if (!isPositiveInteger(int)) return false;
    }
    return true;
}

exports.list = function (req, res) {
    console.log(req.query, req.params);
    let startIndex, count, q, categoryid, seller, bidder, winner;
    for (let p in req.query) {
        let value = req.query[p];
        switch(p.ha) {
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
    console.log(values);
    Auction.getAll(values, function (result) {
        res.statusCode = 200;
        res.statusMessage = "OK";
        res.json(result);
    });
};

exports.create = function (req, res) {
    let auction_data = {
        "title": req.body.title,
        "categoryid": req.body.categoryid,
        "description": req.body.description,
        "reserveprice": req.body.reserveprice,
        "startingprice": req.body.startingprice,
        "creationdate": getCurrentDate(),
        "startingdate": req.body.startingdate,
        "endingdate": req.body.endingdate,
        "userid": req.body.userid //TODO: use currently-logged-in user's userid here instead of getting it as part of request
    };

    //TODO: check if authorised
    let userid = auction_data['userid'];
    /*
    if (authorised) {
        let userid = USER_ID;
    } else {
        res.statusCode = 401;
        res.statusMessage = "Unauthorized";
        res.send();
    }
     */

    if (!arePositiveIntegers([auction_data["categoryid"], auction_data["reserveprice"], auction_data["startingprice"],
            auction_data["startingdate"], auction_data["endingdate"]])) {
        // malformed data
        res.statusCode = 400;
        res.statusMessage = "Malformed auction data";
        res.send();
    } else {
        // valid data
        res.statusCode = 201;
        res.statusMessage = "OK";

        //Convert integers to decimal or datetime, in order to store it in the DB
        let reserveprice = auction_data["reserveprice"]/100;
        let startingprice = auction_data["startingprice"]/100;
        let startingdate = UnixTimeSecondsToDatetimeString(auction_data["startingdate"]);
        let endingdate = UnixTimeSecondsToDatetimeString(auction_data["endingdate"]);

        let values = [
            [auction_data['title'].toString()],
            [auction_data['categoryid'].toString()],
            [auction_data['description'].toString()],
            [reserveprice.toString()],
            [startingprice.toString()],
            [auction_data['creationdate'].toString()],
            [startingdate.toString()],
            [endingdate.toString()],
            [userid.toString()]
        ];

        Auction.insert(values, function (err, result) {

            if (err === true) {
                console.log(result);
                res.statusCode = 500;
                res.statusMessage = "Internal server error";
                res.send();
            } else {
                res.statusCode = 201;
                res.statusMessage = "OK";
                res.json(result);
            }
        });
    }
};

exports.view = function (req, res) {
    let id = req.params.id;
    Auction.getOne(id, function (result) {
        if (result.length === 0) {
            res.statusCode = 400;
            res.statusMessage = "Not found";
            res.send();
        } else {
            res.statusCode = 200;
            res.statusMessage = "OK";
            res.json(result);
        }
    });
};

exports.edit = function (req, res) {
    return null;
};
/*

exports.NAME = function (req, res) {
    return null;
};*/