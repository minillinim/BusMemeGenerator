var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    User = require('./user');

var ImageSchema = new Schema({
    imageUrl: String,
    imageLink: String,
    otherMode: String,
    otherModeTravelTime: Number,
    otherModeTravelDistance: Number,
    publicModeTravelTime: Number,
    publicModeTravelDistance: Number,
    createDate: String,
    user: {
        fullName: String,
        email: String
    }
});

mongoose.model('Image', ImageSchema, 'Image');