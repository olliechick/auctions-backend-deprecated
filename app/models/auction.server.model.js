const db = require('../../config/db');
const ERROR_SELECTING = "Error selecting";
const ERROR_AUCTION_DOES_NOT_EXIST = "Auction does not exist";
const ERROR_BIDDING = "Bidding has already started";
const ERROR_NO_FIELDS = "No fields to update";
const ERROR_NAN = "Not a number";
const ERROR_NO_BIDS = "The auction has not bids.";

exports.getOne = function (id, done) {
    let queryString = "SELECT auction.*, bid.*, category_title, seller.user_username as seller_username, buyer.user_username as buyer_username " +
        "FROM auction " +
        "JOIN category ON auction_categoryid = category_id " +
        "JOIN auction_user as seller ON auction_userid = user_id " +
        "LEFT OUTER JOIN bid ON auction_id = bid_auctionid " +
        "LEFT OUTER JOIN auction_user as buyer on bid_userid = buyer.user_id " +
        "WHERE auction_id = ? " +
        "ORDER BY bid_datetime DESC"; //so the most recent bid is first

    console.log(queryString);
    if (isNaN(id)) return done({"ERROR": ERROR_NAN});

    db.get_pool().query(queryString, [id], function (err, rows) {
        if (err) return done({"ERROR": ERROR_SELECTING});
        else if (rows.length === 0) {
            return done({"ERROR": ERROR_AUCTION_DOES_NOT_EXIST});
        }
        return done(rows);
    });
};

exports.getAll = function (values, done) {
    let startIndex, count, q, categoryid, seller, bidder, winner;
    [startIndex, count, q, categoryid, seller, bidder, winner] = values;
//TODO replace +ing user input with ?s
    // Build query based on parameters
    let queryString = "SELECT auction.* FROM auction";

    // Where
    let whereQueries = false; // used to check if the keyword WHERE has already been inserted

    if (bidder != null) {
        whereQueries = true;
        queryString += " WHERE auction_id in (" +
            "    SELECT auction_id" +
            "    FROM auction AS a2" +
            "    JOIN bid ON a2.auction_id = bid_auctionid" +
            "    WHERE bid_userid = '" + bidder + "'" +
            ")";
        /*queryString += " JOIN bid as b ON auction_id = b.bid_auctionid";*/
    }
    if (winner != null) {
        whereQueries = true;
        if (whereQueries) {
            queryString += " AND";
        } else {
            queryString += " WHERE";
        }
        queryString += " auction_id in (" +
            "   SELECT a2.auction_id" +
            "   FROM auction as a2" +
            "   JOIN bid ON a2.auction_id = bid_auctionid" +
            "   WHERE bid_amount = (" +
            "       SELECT max(b2.bid_amount)" +
            "       FROM bid AS b2" +
            "       WHERE b2.bid_auctionid = a2.auction_id" +
            "       AND b2.bid_amount >= a2.auction_reserveprice" +
            "   )" +
            "   AND bid_userid = '" + winner + "'" +
            ")";

    }
    if (categoryid != null) {
        whereQueries = true;
        if (whereQueries) {
            queryString += " AND";
        } else {
            queryString += " WHERE";
        }
        queryString += "  auction_categoryid = '" + categoryid + "'";
    }

    if (seller != null) {
        whereQueries = true;
        if (whereQueries) {
            queryString += " AND";
        } else {
            queryString += " WHERE";
        }
        queryString += " auction_userid = '" + seller + "'";
    }

    if (q != null) {
        if (whereQueries) {
            queryString += " AND";
        } else {
            queryString += " WHERE";
        }
        queryString += " auction_title LIKE '%" + q + "%'";
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
        if (err) return done({"ERROR": ERROR_SELECTING});
        return done(rows);
    });
};

exports.insert = function (values, done) {
    let numberOfValues = 9;
    let queryString = "INSERT INTO auction(auction_title, auction_categoryid, auction_description, " +
        "auction_reserveprice, auction_startingprice, auction_creationdate, auction_startingdate, auction_endingdate, " +
        "auction_userid) VALUES (?" + ", ?".repeat(numberOfValues - 1) + ")";
    db.get_pool().query(queryString, values, function (err, result) {
        if (err) return done({"ERROR": ERROR_SELECTING});
        return done(result);
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

exports.alter = function (values, done) {
    let nonNullValues = [];
    let firstSet = true;
    let queryString = "UPDATE auction ";
    let id, categoryId, title, description, startDateTime, endDateTime, reservePrice, startingBid;
    [id, categoryId, title, description, startDateTime, endDateTime, reservePrice, startingBid] = values;

    if (categoryId != null) {
        [firstSet, queryString] = setSeparator(firstSet, queryString);
        queryString += "auction_categoryid = ?";
        nonNullValues.push(categoryId);
    }
    if (title != null) {
        [firstSet, queryString] = setSeparator(firstSet, queryString);
        queryString += "auction_title = ?";
        nonNullValues.push(title);
    }
    if (description != null) {
        [firstSet, queryString] = setSeparator(firstSet, queryString);
        queryString += "auction_description = ?";
        nonNullValues.push(description);
    }
    if (startDateTime != null) {
        [firstSet, queryString] = setSeparator(firstSet, queryString);
        queryString += "auction_startingdate = ?";
        nonNullValues.push(startDateTime);
    }
    if (endDateTime != null) {
        [firstSet, queryString] = setSeparator(firstSet, queryString);
        queryString += "auction_endingdate = ?";
        nonNullValues.push(endDateTime);
    }
    if (reservePrice != null) {
        [firstSet, queryString] = setSeparator(firstSet, queryString);
        queryString += "auction_reserveprice = ?";
        nonNullValues.push(reservePrice);
    }
    if (startingBid != null) {
        [firstSet, queryString] = setSeparator(firstSet, queryString);
        queryString += "auction_startingprice = ?";
        nonNullValues.push(startingBid);
    }

    queryString += " WHERE auction_id = ?";

    // Check the auction exists
    new Promise(function (resolve, reject) {
        db.get_pool().query("SELECT * FROM auction WHERE auction_id = ?", [id], function (err, rows) {
            if (err) reject(ERROR_SELECTING);
            else if (rows.length === 0) {
                reject(ERROR_AUCTION_DOES_NOT_EXIST);
            } else if (rows.length > 1) {
                reject(ERROR_SELECTING); //somehow, there are multiple auctions with the same id
            } else {
                resolve();
            }
        });

    }).catch(function (err) {
        return (done({"ERROR": err}));
    });

    // Check there are no bids
    new Promise(function (resolve, reject) {
        db.get_pool().query("SELECT * FROM bid WHERE bid_auctionid = ?", [id], function (err, rows) {
            if (err) reject(ERROR_SELECTING);
            else if (rows.length >= 1) {
                reject(ERROR_BIDDING);
            }
        });

    }).catch(function (err) {
        return (done({"ERROR": err}));
    });

    // Update the auction
    new Promise(function (resolve, reject) {
        if (nonNullValues.length === 0) {
            reject(ERROR_NO_FIELDS);
        }
        nonNullValues.push(id);

        db.get_pool().query(queryString, nonNullValues, function (err, result) {
            if (err) reject(ERROR_SELECTING);
            resolve(result);
        });

    }).then(function (result) {
        return done(result);

    }).catch(function (err) {
        return (done({"ERROR": err}));
    });

};

exports.getBids = function (id, done) {
    let queryString = "SELECT bid.*, user_username AS buyer_username " +
        "FROM bid " +
        "RIGHT OUTER JOIN auction ON auction_id = bid_auctionid " +
        "JOIN auction_user ON user_id = bid_userid " +
        "WHERE auction_id = ?";
    if (isNaN(id)) return done({"ERROR": ERROR_NAN});

    db.get_pool().query(queryString, [id], function (err, rows) {
        if (err) return done({"ERROR": ERROR_SELECTING});
        else if (rows.length === 0) {
            return done({"ERROR": ERROR_AUCTION_DOES_NOT_EXIST});
        }
        else if (rows[0]["bid_id"] === null) return done([]);
        return done(rows);
    });
};

