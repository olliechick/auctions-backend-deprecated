const Auction = require('../models/auction.server.model');

exports.list = function(req, res){
    Auction.getAll(function(result){
        res.json(result);
    });
};

exports.create = function(req, res){
    return null;
};

exports.view = function(req, res){
    return null;
};

exports.edit = function(req, res){
    return null;
};