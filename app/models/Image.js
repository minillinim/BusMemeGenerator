var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ImageSchema = new Schema({
    imageUrl: String
});

mongoose.model('Image', ImageSchema, 'Image');