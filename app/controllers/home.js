var express = require('express'),
  router = express.Router(),
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
  Location.find(function (err, locations) {
    if (err) return next(err);
    res.render('index', {
      title: 'Bus Meme Generator',
      locations: locations
    });
  });
});
