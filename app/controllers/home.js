var express = require('express'),
  router = express.Router(),
  directions = require('./map')
  tlapi = require('./translinkapi')
  mongoose = require('mongoose'),
  MemeTemplate = mongoose.model('MemeTemplate'),
  Location = mongoose.model('Location');


module.exports = function (app) {
  app.use('/', router);
};

router.get('/', function (req, res, next) {
    res.render('index', {title: 'Bus Meme Generator'});
});

router.get('/map/:startAddressLat/:startAddressLong/:destAddressLat/:destAddressLong', function(req, res, next) {
  var responses = directions(req.params.startAddressLat,
                             req.params.startAddressLong,
                             req.params.destAddressLat,
                             req.params.destAddressLong)
  .then(function(response){
    res.json(response);
  });
});

router.get('/getMemeTemplates', function(req, res, next){
  var templates = [];
    MemeTemplate.find().stream().on('data', function(data){
        templates.push(data);
    }).on('error', function (err) {
      console.log('error', err);
    }).on('close', function () {
      res.json(templates);
    });
});

router.get('/tl/:startAddressLat/:startAddressLong/:destAddressLat/:destAddressLong', function(req, res, next) {
  tlapi().getJourneysBetween(req.params.startAddressLat,
                             req.params.startAddressLong,
                             req.params.destAddressLat,
                             req.params.destAddressLong)
  .then(function(journeys) {
    console.log(journeys);
  });
});