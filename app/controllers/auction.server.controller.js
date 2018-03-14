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
    Auction.getAll(function (result) {
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

    //TODO: check if not logged in
    /*
    if (not logged in) {
        // user isn't logged in
        res.statusCode = 401;
        res.statusMessage = "Unauthorized";
    } else
     */
    if (!arePositiveIntegers([auction_data["categoryid"]/*, auction_data["reserveprice"], auction_data["startingprice"],
            auction_data["startingdate"], auction_data["endingdate"]*/])) {
        //TODO: currently the commented out stuff should be ints according to the spec, but are decimals/datetimes in the DB. Austen will
        //TODO: confirm what is happening here soon.
        // malformed data
        res.statusCode = 400;
        res.statusMessage = "Malformed auction data";
        res.json({"Error": "Malformed auction data"});
    } else {
        // valid data
        res.statusCode = 201;
        res.statusMessage = "OK";

        let values = [
            [auction_data['title'].toString()],
            [auction_data['categoryid'].toString()],
            [auction_data['description'].toString()],
            [auction_data['reserveprice'].toString()],
            [auction_data['startingprice'].toString()],
            [auction_data['creationdate'].toString()],
            [auction_data['startingdate'].toString()],
            [auction_data['endingdate'].toString()],
            [auction_data['userid'].toString()]
        ];

        Auction.insert(values, function (result) {

            if (result === err) {
                res.statusCode = 400;
                res.statusMessage = "Not found";
            } else {
                res.statusCode = 201;
                res.statusMessage = "OK";
            }
            res.json(result);
        });
    }
};

exports.view = function (req, res) {
    let id = req.params.id;
    Auction.getOne(id, function (result) {
        if (result.length === 0) {
            res.statusCode = 400;
            res.statusMessage = "Not found";
        } else {
            res.statusCode = 200;
            res.statusMessage = "OK";
        }
        res.json(result);
    });
};

exports.edit = function (req, res) {
    return null;
};
/*

exports.NAME = function (req, res) {
    return null;
};*/