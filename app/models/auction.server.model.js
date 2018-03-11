const db = require('../../config/db');

exports.getOne = function(){
    return null;
};

exports.getAll = function(done){
    db.get_pool().query("SELECT * FROM auction", function(err, rows) {
        if (err) return done({"ERROR": "Error selecting"});
        return done(rows);
    });
};

exports.insert = function(){
    return null;
};

exports.alter = function(){
    return null;
};