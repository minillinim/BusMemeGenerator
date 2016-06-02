var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ImageSchema = new Schema({
    imageUrl: String,
    imageLink: String,
    otherMode: String,
    otherModeTravelTime: Number,
    otherModeTravelDistance: Number,
    publicModeTravelTime: Number,
    publicModeTravelDistance: Number,
    createDate: String,
    userName: String,
    userEmail: String
});

mongoose.model('Image', ImageSchema, 'Image');