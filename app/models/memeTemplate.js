// Example model

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var MemeTemplateSchema = new Schema({
  firstLine: String,
  secondLine: String
});

mongoose.model('MemeTemplate', MemeTemplateSchema, 'MemeTemplate');