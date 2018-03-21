const db = require('../../config/db');
const errors = require('./errors');
const logic = require('./logic');

exports.getOne = function (id, done) {
    let queryString = "SELECT auction.*, bid.*, category_title, seller.user_username as seller_username, buyer.user_username as buyer_username " +
        "FROM auction " +
        "JOIN category ON auction_categoryid = category_id " +
        "JOIN auction_user as seller ON auction_userid = user_id " +
        "LEFT OUTER JOIN bid ON auction_id = bid_auctionid " +
        "LEFT OUTER JOIN auction_user as buyer on bid_userid = buyer.user_id " +
        "WHERE auction_id = ? " +
        "ORDER BY bid_datetime DESC"; //so the most recent bid is first

    if (isNaN(id)) return done({"ERROR": errors.ERROR_NAN});

    db.get_pool().query(queryString, [id], function (err, rows) {
        if (err) return done({"ERROR": errors.ERROR_SELECTING});
        else if (rows.length === 0) {
            return done({"ERROR": errors.ERROR_AUCTION_DOES_NOT_EXIST});
        }
        return done(rows);
    });
};

exports.getAll = function (values, done) {
    let startIndex, count, q, categoryid, seller, bidder, winner;
    [startIndex, count, q, categoryid, seller, bidder, winner] = values;
    let nonNullValues = [];
//TODO replace +ing user input with ?s
    // Build query based on parameters
    let queryString = "SELECT auction.* FROM auction";

    // Where
    let whereQueries = false; // used to check if the keyword WHERE has already been inserted

    if (bidder != null) {
        if (isNaN(categoryid)) {
            return done({"ERROR": errors.ERROR_NAN});
        }
        whereQueries = true;
        queryString += " WHERE auction_id in (" +
            "    SELECT auction_id" +
            "    FROM auction AS a2" +
            "    JOIN bid ON a2.auction_id = bid_auctionid" +
            "    WHERE bid_userid = ?" +
            ")";
        nonNullValues.push(parseInt(bidder));
    }

    if (winner != null) {
        if (isNaN(categoryid)) {
            return done({"ERROR": errors.ERROR_NAN});
        }
        if (whereQueries) {
            queryString += " AND";
        } else {
            queryString += " WHERE";
        }
        whereQueries = true;
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
            "   AND bid_userid = ?" +
            ")";
        nonNullValues.push(parseInt(winner));
    }

    if (categoryid != null) {
        if (isNaN(categoryid)) {
            return done({"ERROR": errors.ERROR_NAN});
        }
        if (whereQueries) {
            queryString += " AND";
        } else {
            queryString += " WHERE";
        }
        whereQueries = true;
        queryString += " auction_categoryid = ?";
        nonNullValues.push(parseInt(categoryid));
    }

    if (seller != null) {
        if (isNaN(seller)) {
            return done({"ERROR": errors.ERROR_NAN});
        }
        if (whereQueries) {
            queryString += " AND";
        } else {
            queryString += " WHERE";
        }
        whereQueries = true;
        queryString += " auction_userid = ?";
        nonNullValues.push(parseInt(seller));
    }

    if (q != null) {
        if (whereQueries) {
            queryString += " AND";
        } else {
            queryString += " WHERE";
        }
        queryString += " auction_title LIKE ?";
        nonNullValues.push("%" + q + "%");
    }

    // Limit
    if (count != null) {
        if (isNaN(count)) {
            return done({"ERROR": errors.ERROR_NAN});
        }
        queryString += " LIMIT ?";
        nonNullValues.push(parseInt(count));
        if (startIndex != null) {
            if (isNaN(startIndex)) {
                return done({"ERROR": errors.ERROR_NAN});
            }
            queryString += " OFFSET ?";
            nonNullValues.push(parseInt(startIndex));
        }
    }

    db.get_pool().query(queryString, nonNullValues, function (err, rows) {

        if (err) return done({"ERROR": errors.ERROR_SELECTING});
        return done(rows);
    });
};

exports.insert = function (values, done) {

    // Check the category id is valid
    let promise = new Promise(function (resolve, reject) {
        db.get_pool().query("SELECT * FROM category WHERE category_id = ?", [values[1]], function (err, rows) {
            if (err) reject(errors.ERROR_SELECTING);
            else if (rows.length === 0) {
                reject(errors.ERROR_BAD_REQUEST);
            }
        });

    }).catch(function (err) {
        return (done({"ERROR": err}));
    });

    // (Attempt to) create auction
    new Promise(function (resolve, reject) {
        let numberOfValues = 9;
        let queryString = "INSERT INTO auction(auction_title, auction_categoryid, auction_description, " +
            "auction_reserveprice, auction_startingprice, auction_creationdate, auction_startingdate, auction_endingdate, " +
            "auction_userid) VALUES (?" + ", ?".repeat(numberOfValues - 1) + ")";
        db.get_pool().query(queryString, values, function (err, result) {
            if (err) reject(errors.ERROR_SELECTING);
            resolve(result);
        });

    }).then(function (result) {
        return done(result);

    }).catch(function (err) {
        return (done({"ERROR": err}));
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
    let id, categoryId, title, description, startDateTime, endDateTime, reservePrice, startingBid, token;
    [id, categoryId, title, description, startDateTime, endDateTime, reservePrice, startingBid, token] = values;

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
        console.log(30);
        db.get_pool().query("SELECT * FROM auction WHERE auction_id = ?", [id], function (err, rows) {
            if (err) reject(errors.ERROR_SELECTING);
            else if (rows.length === 0) {
                reject(errors.ERROR_AUCTION_DOES_NOT_EXIST);
            } else if (rows.length > 1) {
                reject(errors.ERROR_SELECTING); //somehow, there are multiple auctions with the same id
            } else {
                resolve(rows);
            }
        });

        // Check auth'd
    }).then(function (rows) {
        console.log(40);
        let user_id = rows[0]["auction_userid"];
        console.log(user_id, logic.token_user_id);
        if (!(user_id === logic.token_user_id && token === logic.token)) {
            console.log('unathd:', user_id, logic.token_user_id, token, logic.token);
            throw errors.ERROR_UNAUTHORISED;
        }

        // Check valid category
    }).then(function () {
        console.log(50);
        return new Promise(function (resolve, reject) {
            if (categoryId != null) {
                console.log(51);
                db.get_pool().query("SELECT * FROM category WHERE category_id = ?", [categoryId], function (err, rows) {
                    console.log(52);
                    if (err) reject(errors.ERROR_SELECTING);
                    else if (rows.length === 0) {
                        reject(errors.ERROR_BAD_REQUEST);
                    } else resolve();
                });
            } else resolve();
        }).catch(function (err) {
            throw err;
        });

        // Check the auction hasn't started
    }).then(function () {
        console.log(55);
        return new Promise(function (resolve, reject) {
            let queryString = "SELECT * FROM auction WHERE auction_id = ? AND auction_startingdate > '" +
                logic.getCurrentDate() + "'";
            db.get_pool().query(queryString, [id], function (err, rows) {
                if (err) reject(errors.ERROR_SELECTING);
                else if (rows.length === 0) {
                    reject(errors.ERROR_AUCTION_STARTED);
                } else resolve();
            });
        }).catch(function (err) {
            throw err;
        });

        // Update the auction
    }).then(function () {
        console.log(60);
        return new Promise(function (resolve, reject) {
            if (nonNullValues.length === 0) {
                reject(errors.ERROR_NO_FIELDS);
            }
            nonNullValues.push(id);

            db.get_pool().query(queryString, nonNullValues, function (err, result) {
                if (err) reject(errors.ERROR_SELECTING);
                resolve(result);
            });
        }).catch(function (err) {
            throw err;
        });

    }).then(function (result) {
        return done(result);
    }).catch(function (err) {
        console.log(99);
        return (done({"ERROR": err}));
    });
};


exports.getBids = function (id, done) {
    let queryString = "SELECT bid.*, user_username AS buyer_username " +
        "FROM bid " +
        "RIGHT OUTER JOIN auction ON auction_id = bid_auctionid " +
        "LEFT OUTER JOIN auction_user ON user_id = bid_userid " +
        "WHERE auction_id = ?";

    if (isNaN(id)) return done({"ERROR": errors.ERROR_NAN});

    db.get_pool().query(queryString, [id], function (err, rows) {
        if (err) return done({"ERROR": errors.ERROR_SELECTING});

        else if (rows.length === 0) return done({"ERROR": errors.ERROR_AUCTION_DOES_NOT_EXIST});

        else if (rows[0]["bid_id"] === null) return done([]);

        return done(rows);
    });
};


/*
 * TODO Check for:
 *     the auction exists (or 404)
 *     the auction doesn't belong to the buyer (or 400)
 *     the auction has started (or 400)
 *     the auction hasn't expired (or 400)
 *     the amount is higher than the current highest bid (or 400)
 */
exports.addBid = function (values, done) {
    let auction_id, amount, token;
    [auction_id, amount, token] = values;
    amount = logic.centsToDollars(amount);
    let buyer_id;

    // Authorise
    if (token === logic.token) { //if auth'd
        buyer_id = logic.token_user_id;
    } else {
        return done({"ERROR": errors.ERROR_UNAUTHORISED});
    }

    // Check the auction exists
    new Promise(function (resolve, reject) {
        db.get_pool().query("SELECT * from auction where auction_id = ?", [auction_id], function (err, rows) {
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
        // Check the auction doesn't belong to the buyer, and
        // that the current datetime is between the start and end
        return new Promise(function (resolve, reject) {
            let queryString = "SELECT * FROM auction" +
                " WHERE auction_id = ?" +
                " AND auction_startingdate < '" + logic.getCurrentDate() +
                "' AND auction_endingdate > '" + logic.getCurrentDate() +
                "' AND auction_userid != ?";
            let values = [auction_id, buyer_id];
            db.get_pool().query(queryString, values, function (err, rows) {
                if (err) reject(errors.ERROR_SELECTING);
                else if (rows.length === 0) {
                    reject(errors.ERROR_BAD_REQUEST);
                } else {
                    resolve();
                }
            });
        }).catch(function (err) {
            throw err;
        });
    }).then(function () {

        // Check that amount is greater than the highest current bid
        return new Promise(function (resolve, reject) {
            let queryString = "SELECT * FROM auction" +
                " JOIN bid ON auction_id = bid_auctionid" +
                " WHERE auction_id = ?" +
                " AND bid_amount >= ?";
            let values = [auction_id, amount];
            db.get_pool().query(queryString, values, function (err, rows) {
                //console.log(rows);
                if (err) reject(errors.ERROR_SELECTING);
                else if (rows.length > 0) {
                    reject(errors.ERROR_BAD_REQUEST);
                } else {
                    resolve();
                }
            });
        }).catch(function (err) {
            throw err;
        });

    }).then(function () {
        // All checks are complete, do the insert.
        return new Promise(function (resolve, reject) {
            let values = [buyer_id, auction_id, amount, logic.getCurrentDate()];
            let numberOfValues = values.length;
            let queryString = "INSERT INTO bid (bid_userid, bid_auctionid, bid_amount, bid_datetime)" +
                "VALUES (?" + ", ?".repeat(numberOfValues - 1) + ")";
            db.get_pool().query(queryString, values, function (err, result) {
                if (err) {
                    reject(errors.ERROR_SELECTING);
                } else {
                    resolve(result);
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

/*

exports.NAME = function (values, done) {
    let queryString = "";

    db.get_pool().query(queryString, values, function (err, rows) {
        if (err) return done({"ERROR": errors.ERROR_SELECTING});
        else {
            return done(rows);
        }
    });
};*/

