const users = require('../controllers/user.server.controller');
const api_base = '/api/v1';

module.exports = function(app) {
    app.route(api_base + '/users')
        .post(users.addUser);

    app.route(api_base + '/users/login')
        .post(users.login);

    app.route(api_base + '/users/logout')
        .post(users.logout);
/*
    app.route(api_base + '/users/:id')
        .get(users.viewUser)
        .patch(users.editUser);*/

};