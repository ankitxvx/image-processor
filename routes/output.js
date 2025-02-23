const express = require('express');
const { createObjectCsvStringifier } = require('csv-writer');
const Request = require('../models/Request');
const Product = require('../models/Product');

const router = express.Router();

router.get('/:requestId.csv', async (req, res) => {
  const { requestId } = req.params;
  const request = await Request.findOne({ requestId });

  if (!request || request.status !== 'completed') {
    return res.status(403).json({ error: 'Output not available or processing incomplete' });
  }

  const products = await Product.find({ requestId }).sort({ serialNumber: 1 });

  const csvStringifier = createObjectCsvStringifier({
    header: [
      { id: 'serialNumber', title: 'S. No.' },
      { id: 'productName', title: 'Product Name' },
      { id: 'inputImageUrls', title: 'Input Image Urls' },
      { id: 'outputImageUrls', title: 'Output Image Urls' }
    ]
  });

  const records = products.map(product => ({
    serialNumber: product.serialNumber,
    productName: product.productName,
    inputImageUrls: product.inputImageUrls.join(','),
    outputImageUrls: product.outputImageUrls.join(',')
  }));

  const csvData = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records);
  res.header('Content-Type', 'text/csv');
  res.attachment(`${requestId}.csv`);
  res.send(csvData);
});

module.exports = router;