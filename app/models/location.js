// Example model

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var LocationSchema = new Schema({
  startAddress: String,
  startAddressLat: String,
  startAddressLong: String,
  startPostalCode: String,
  destAddress: String,
  destAddressLat: String,
  destAddressLong: String,
  destPostalCode: String
});

mongoose.model('Location', LocationSchema);




