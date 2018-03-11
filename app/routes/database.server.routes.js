const databases = require('../controllers/database.server.controller');

module.exports = function(app) {
    app.route('/reset')
        .post(databases.reset);

    app.route('/resample')
        .post(databases.resample);
};