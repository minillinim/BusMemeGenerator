var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var UserSchema = new Schema({
    fullName: String,
    email: String
});

var User = mongoose.model('User', UserSchema, 'User');

module.exports = User;