const photos = require('../controllers/photo.server.controller');
const api_base = '/api/v1';

module.exports = function(app) {
    app.route(api_base + '/auctions/:id/photos')
        .get(photos.showPhoto)
        .post(photos.addPhoto)
        .delete(photos.deletePhoto);

};