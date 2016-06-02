var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ImageSchema = new Schema({
    imageUrl: String,
    imageLink: String,
    otherMode: String,
    otherModeTravelTime: Number,
    otherModeTravelDistance: Number,
    publicModeTravelTime: Number,
    publicModeTravelDistance: Number
});

mongoose.model('Image', ImageSchema, 'Image');