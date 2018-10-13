const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const Input = new Schema({
  href: String
});

const InputModel = mongoose.model('Input', Input);

module.exports = InputModel;