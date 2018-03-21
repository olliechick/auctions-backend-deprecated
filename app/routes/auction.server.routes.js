const auctions = require('../controllers/auction.server.controller');
const api_base = '/api/v1';

module.exports = function(app) {
    app.route(api_base + '/auctions')
        .get(auctions.list)
        .post(auctions.create);

    app.route(api_base + '/auctions/:id')
        .get(auctions.view)
        .patch(auctions.edit);

    app.route(api_base + '/auctions/:id/bids')
        .get(auctions.getBids)
        .post(auctions.addBid);
};