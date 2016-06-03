var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var UserSchema = new Schema({
    imageId: String,
    fullName: String,
    email: String
});

mongoose.model('User', UserSchema, 'User');