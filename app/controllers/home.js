var express = require('express'),
    router = express.Router(),
    tlapi = require('./translinkapi'),
    mongoose = require('mongoose'),
    MemeTemplate = mongoose.model('MemeTemplate'),
    MemeDetails = mongoose.model('MemeDetails'),
    Image = mongoose.model('Image'),
    Location = mongoose.model('Location'),
    MemeController = require('./MemeController');


module.exports = function (app) {
    app.use('/', router);
};

router.get('/', function (req, res, next) {
    res.render('index', {title: 'Bus Meme Generator'});
});

router.get('/getMemeTemplates', MemeController().getMemeTemplates);

router.post('/saveMemeDetails', MemeController().saveMemeDetails);

router.post('/saveImageUrl', MemeController().saveImageUrl);

router.get('/image/:imageLink', MemeController().serveImage);


router.get('/tl/:startLat/:startLng/:endLat/:endLng/:mode/:at/:walkMax', function (req, res, next) {
    tlapi().getJourneysBetween(req.params.startLat,
        req.params.startLng,
        req.params.endLat,
        req.params.endLng,
        req.params.mode,
        req.params.at,
        req.params.walkMax)
        .then(function (journeys) {
        });
});