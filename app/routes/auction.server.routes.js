const auctions = require('../controllers/auction.server.controller');

module.exports = function(app) {
    app.route('/auctions')
        .get(auctions.list)
        .post(auctions.create);

    app.route('/auctions/:id')
        .get(auctions.view)
        .patch(auctions.edit);
};