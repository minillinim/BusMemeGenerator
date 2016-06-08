var express = require('express'),
    router = express.Router(),
    tlapi = require('./translinkapi'),
    mongoose = require('mongoose'),
    MemeTemplate = mongoose.model('MemeTemplate'),
    MemeDetails = mongoose.model('MemeDetails'),
    Image = mongoose.model('Image'),
    Location = mongoose.model('Location'),
    MemeController = require('./MemeController');
    UserController = require('./UserController');


module.exports = function (app) {
    app.use('/logan/', router);
    app.use('/', router);
};

router.get('/', function (req, res) {
    res.render('index', {title: 'Bus Meme Generator'});
});
router.get('/logan', function (req, res) {
    res.render('index', {title: 'Bus Meme Generator'});
});
router.get('/logan/galleries', function (req, res) {
    res.render('index', {title: 'Bus Meme Generator'});
});
router.get('/logan/meme', function (req, res) {
    res.render('index', {title: 'Bus Meme Generator'});
});
router.get('/logan/about', function (req, res) {
    res.render('index', {title: 'Bus Meme Generator'});
});

router.get('/getMemeTemplates', MemeController().getMemeTemplates);

router.post('/saveMemeDetails', MemeController().saveMemeDetails);

router.post('/saveImage', MemeController().saveImage);

router.get('/image/:imageLink', MemeController().serveImage);

router.get('/getImages', MemeController().getImages);

router.post('/saveUser', UserController().saveUserDetails);

router.get('/tl/:startLat/:startLng/:endLat/:endLng/:mode/:at/:walkMax', function (req, res) {
    tlapi().getJourneysBetween(req.params.startLat,
        req.params.startLng,
        req.params.endLat,
        req.params.endLng,
        req.params.mode,
        req.params.at,
        req.params.walkMax)
        .then(function (processedJourney) {
            res.send(processedJourney);
        });
});