const db = require('../../config/db');

exports.getOne = function (id, done) {
    db.get_pool().query("SELECT * FROM auction WHERE auction_id = ?", [id], function(err, rows) {
        if (err) return done({"ERROR": "Error selecting"});
        return done(rows);
    });
};

exports.getAll = function (done) {
    db.get_pool().query("SELECT * FROM auction", function (err, rows) {
        if (err) return done({"ERROR": "Error selecting"});
        return done(rows);
    });
};

exports.insert = function (values, done) {
    let queryString = "INSERT INTO auction(auction_title, auction_categoryid, auction_description, " +
        "auction_reserveprice, auction_startingprice, auction_creationdate, auction_startingdate, auction_endingdate, " +
        "auction_userid) VALUES (?" + ", ?".repeat(9-1) + ")";
    db.get_pool().query(queryString, values, function (err, result) {
        if (err) return done(err);
        return done(result);
    });
};

exports.alter = function () {
    let queryString = "UPDATE ";
};