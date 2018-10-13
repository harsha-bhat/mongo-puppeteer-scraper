const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const Output = new Schema({
  href: String,
  images: [String],
  error: String
});

const OuputModel = mongoose.model('Output', Output);

module.exports = OuputModel;