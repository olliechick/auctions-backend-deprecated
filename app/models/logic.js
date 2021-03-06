
exports.token = null;
exports.token_user_id = null;

exports.isJsonString = function(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
};


/**
 * Returns the current date and time as a string, in the form yyyy-mm-dd hh:MM:ss
 */
exports.getCurrentDate = function() {
    return exports.unixTimeMillisecondsToDatetimeString(new Date());
};

/**
 * Returns true if the passed in string is a valid date string.
 * Valid date is in the form yyyy-mm-dd (length = 10).
 *
 * @param dateString value to check
 * @returns {boolean} true if it is in the right form
 */
exports.isValidDate = function(dateString) {
    let yyyy = dateString.substring(0, 3);
    let mm = dateString.substring(5, 6);
    let dd = dateString.substring(8, 9);

    let validDashes = dateString.charAt(4) === '-' && dateString.charAt(7) === '-';
    let validNumbers = !(isNan(yyyy) || isNan(mm) || isNan(dd));
    return validNumbers && validDashes && dateString.length === 9;
};

exports.createNewBidsJsonArray = function(jsonBids) {
    let bids = [];
    let bid, json;
    for (let i = 0; i < jsonBids.length; i++) {
        json = jsonBids[i];
        if (json["bid_id"] != null) { // if the primary key is null, this must have been generated by an outer join
            bid = {};
            bid.amount = json["bid_amount"];
            bid.datetime = exports.datetimeStringToUnixTimeMilliseconds(json["bid_datetime"]);
            bid.buyerId = json["bid_userid"];
            bid.buyerUsername = json["buyer_username"];
            bids.push(bid);
        }
    }
    return bids;
};

/**
 * Returns a JSON of a new auction ready to be sent to the server.
 */
exports.createNewAuctionJson = function(result) {
    let jsonAuctions = JSON.parse(JSON.stringify(result));
    let json = jsonAuctions[0];

    let auction = {};
    auction.categoryId = json["auction_categoryid"];
    auction.categoryTitle = json["category_title"];
    auction.title = json["auction_title"];
    auction.reservePrice = json["auction_reserveprice"];
    auction.startDateTime = exports.datetimeStringToUnixTimeMilliseconds(json["auction_startingdate"]);
    auction.endDateTime = exports.datetimeStringToUnixTimeMilliseconds(json["auction_endingdate"]);
    auction.description = json["auction_description"];
    auction.creationDateTime = exports.datetimeStringToUnixTimeMilliseconds(json["auction_creationdate"]);

    let seller = {};
    seller.id = json["auction_userid"];
    seller.username = json["seller_username"];
    auction.seller = seller;

    auction.startingBid = json["auction_startingprice"] * 100;
    auction.currentBid = jsonAuctions[0]["bid_amount"];

    auction.bids = exports.createNewBidsJsonArray(jsonAuctions);

    return JSON.parse(JSON.stringify(auction));
};

/**
 * Converts a unix timestamp (in milliseconds) into a string of the form yyyy-mm-dd hh:MM:ss (e.g. 2018-02-14 00:00:00)
 * @param unixTimeMilliseconds unix timestamp in milliseconds
 * @return {string} timestamp in form yyyy-mm-dd hh:MM:ss
 */
exports.unixTimeMillisecondsToDatetimeString = function(unixTimeMilliseconds) {
    if (unixTimeMilliseconds == null) {
        return null;
    }
    let datetime = new Date(unixTimeMilliseconds);
    let isoString = datetime.toISOString();
    return isoString.slice(0, 10) + " " + isoString.slice(11, 19);
};

/**
 * Converts a string of the form yyyy-mm-dd hh:MM:ss (e.g. 2018-02-14 00:00:00) into a unix timestamp (in milliseconds)
 * @param datetimeString a string of the form yyyy-mm-dd hh:MM:ss
 * @return {int} unix timestamp (in milliseconds)
 */
exports.datetimeStringToUnixTimeMilliseconds = function(datetimeString) {
    if (datetimeString == null) {
        return null;
    }
    return Date.parse(datetimeString);
};

exports.centsToDollars = function(cents) {
    if (cents == null) {
        return null;
    }
    return cents / 100;
};

/**
 * Returns true if the passed in value is a positive integer.
 *
 * @param int value to check
 * @returns {boolean} true if the value is an integer greater than or equal to 0.
 */
exports.isPositiveInteger = function(int) {
    return Number.isInteger(int) && int >= 0;
};

/**
 * Returns true if all the values in the passed in list are positive integers.
 * @param ints list of values to check
 * @returns {boolean} true if every value is an integer greater than or equal to 0.
 */
exports.arePositiveIntegers = function(ints) {
    for (let i = 0; i < ints.length; i++) {
        let int = ints[i];
        if (!exports.isPositiveInteger(int)) return false;
    }
    return true;
};
