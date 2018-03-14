const databases = require('../controllers/database.server.controller');
const api_base = '/api/v1';

module.exports = function(app) {
    app.route(api_base + '/reset')
        .post(databases.reset);

    app.route(api_base + '/resample')
        .post(databases.resample);
};