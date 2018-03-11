const Auction = require('../models/auction.server.model');

exports.list = function(req, res){
    Auction.getAll(function(result){
        res.json(result);
    });
};

exports.create = function(req, res){
    let auction_data = {
        "title": req.body.title,
        "categoryid": req.body.categoryid,
        "description": req.body.description,
        "reserveprice": req.body.reserveprice,
        "startingprice": req.body.startingprice,
        "creationdate": req.body.creationdate,
        "startingdate": req.body.startingdate,
        "endingdate": req.body.endingdate,
        "userid": req.body.userid
    };

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

    Auction.insert(values, function(result){
        res.json(result);
    });
};

exports.view = function(req, res){
    return null;
};

exports.edit = function(req, res){
    return null;
};