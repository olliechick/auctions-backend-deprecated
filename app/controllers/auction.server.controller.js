const Auction = require('../models/auction.server.model');

exports.list = function(req, res){
    Auction.getAll(function(result){
        res.json(result);
    });
};

function getCurrentDate() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();


    if (dd < 10) {
        dd = '0' + dd
    }

    if (mm < 10) {
        mm = '0' + mm
    }

    today = yyyy + "-" + mm + '-' + dd;
    return today;
}

exports.create = function(req, res){
    let auction_data = {
        "title": req.body.title,
        "categoryid": req.body.categoryid,
        "description": req.body.description,
        "reserveprice": req.body.reserveprice,
        "startingprice": req.body.startingprice,
        "creationdate": getCurrentDate(),
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