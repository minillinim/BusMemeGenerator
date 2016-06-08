var express = require('express'),
  config = require('./config/backend_config/config'),
  glob = require('glob'),
  mongoose = require('mongoose');

mongoose.connect(config.db);
var db = mongoose.connection;
db.on('error', function () {
  throw new Error('unable to connect to database at ' + config.db);
});

var models = glob.sync(config.root + './../app/models/*.js');
models.forEach(function (model) {
  require(model);
});

var memeTemplates = require(config.root + './../app/db/memeTemplate.js');
mongoose.connection.collections['MemeTemplate'].drop( function(err) {});
mongoose.connection.collections['MemeTemplate'].insertMany(memeTemplates.memeTemplates, function(err, docs) {
  if (err) console.log(err);
});

var app = express();
require('./config/backend_config/express')(app, config);

app.listen(config.port, function () {
  console.log('Express server listening on port ' + config.port);
});