const db = require('../../config/db');

exports.getOne = function (values, done) {
    let queryString = "SELECT * FROM auction WHERE auction_id = ?";
    db.get_pool().query(queryString, [id], function(err, rows) {
        if (err) return done({"ERROR": "Error selecting"});
        return done(rows);
    });
};

exports.getAll = function (values, done) {
    // Build query based on parameters
    let queryString = "SELECT a.* FROM auction as a";
    let startIndex, count, q, categoryid, seller, bidder, winner;
    [startIndex, count, q, categoryid, seller, bidder, winner] = values;

    // Join
    if (bidder != null || winner != null) {
        queryString += " JOIN bid ON auction_id = bid_auctionid";
    }

    // Where
    let whereQueries = false; // used to check if the keyword WHERE has already been inserted
    if (categoryid != null) {
        whereQueries = true;
        queryString += " WHERE auction_categoryid = " + categoryid;
    }

    if (seller != null) {
        whereQueries = true;
        if (whereQueries) {
            queryString += " AND";
        } else {
            queryString += "WHERE";
        }
        queryString += " auction_userid = " + seller;
    }

    if (bidder != null) {
        whereQueries = true;
        if (whereQueries) {
            queryString += " AND";
        } else {
            queryString += "WHERE";
        }
        queryString += " bid_userid = " + bidder;
    }

    if (winner != null) {
        whereQueries = true;
        if (whereQueries) {
            queryString += " AND";
        } else {
            queryString += "WHERE";
        }
        queryString += " bid_amount >= auction_reserveprice and bid_amount >= "
            + "(select max(bid_amount) from bid where bid_auctionid = a.auction_id)";
    }

    // Limit
    if (count != null) {
        queryString += " LIMIT " + count;
        if (startIndex != null) {
            queryString += " OFFSET " + startIndex;
        }
    }

    console.log(queryString);
    db.get_pool().query(queryString, function (err, rows) {
        if (err) return done({"ERROR": "Error selecting"});
        return done(rows);
    });
};

exports.insert = function (values, done) {
    let queryString = "INSERT INTO auction(auction_title, auction_categoryid, auction_description, " +
        "auction_reserveprice, auction_startingprice, auction_creationdate, auction_startingdate, auction_endingdate, " +
        "auction_userid) VALUES (?" + ", ?".repeat(9-1) + ")";
    db.get_pool().query(queryString, values, function (err, result) {
        if (err) return done(true, err);
        return done(false, result);
    });
};

exports.alter = function () {
    let queryString = "UPDATE ";
};