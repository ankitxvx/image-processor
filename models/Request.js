const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  requestId: { type: String, unique: true, required: true },
  status: { type: String, default: 'pending' },
  webhookUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Request', requestSchema);