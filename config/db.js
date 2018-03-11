const mysql = require("mysql");

let state = {
    pool: null
};

exports.connect = function(done) {
    state.pool = mysql.createPool({
        host: 'mysql3.csse.canterbury.ac.nz',
        port: 3306,
        user: 'och26',
        password: '67683982',
        database: 'och26'
    });
    done();
};

exports.get_pool = function() {
    return state.pool;
};