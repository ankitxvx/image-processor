const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  requestId: { type: String, required: true },
  serialNumber: { type: Number, required: true },
  productName: { type: String, required: true },
  inputImageUrls: { type: [String], required: true },
  outputImageUrls: { type: [String], default: [] },
  status: { type: String, default: 'pending' },
  error: { type: String }
});

module.exports = mongoose.model('Product', productSchema);