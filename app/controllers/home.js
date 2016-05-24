var express = require('express'),
  router = express.Router(),
  directions = require('./map')
  mongoose = require('mongoose'),
  Location = mongoose.model('Location');


var logan = new Location({
  state: 'QLD',
  city: 'Logan Central',
  suburb: 'Logan',
  postalCode: '4114'
});

logan.save(function(err, data){
  console.log(data.suburb + " was saved");
});

module.exports = function (app) {
  app.use('/', router);
};

router.get('/', function (req, res, next) {
    res.render('index', {title: 'Bus Meme Generator'});
});

router.post('/directions', function (req, res, next) {
    console.log(req.body.startAddress);
    res.render('map', {directions:directions()});
});
