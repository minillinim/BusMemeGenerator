var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var userSchema = new Schema({
    username: String,
    password: String
});

var MemeDetailsSchema = new Schema({
    imageFileLink: String,
    travelMethodChosen: String,
    publicTransportDuration: String,
    otherTransportModeDuration: String,
    startAddress: String,
    destAddress: String,
    user: userSchema
});

mongoose.model('MemeDetails', MemeDetailsSchema, 'MemeDetails');