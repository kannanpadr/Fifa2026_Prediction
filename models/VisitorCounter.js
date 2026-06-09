const mongoose = require('mongoose');

const visitorCounterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, default: 'global' },
  count: { type: Number, required: true, default: 0 }
});

module.exports = mongoose.model('VisitorCounter', visitorCounterSchema);
