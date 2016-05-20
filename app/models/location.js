// Example model

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var LocationSchema = new Schema({
  state: String,
  city: String,
  suburb: String,
  postalCode: String
});

mongoose.model('Location', LocationSchema);




