const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const Request = require('../models/Request');
const Product = require('../models/Product');
const processRequest = require('../workers/processRequest');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('file'), async (req, res) => {
  const { webhookUrl } = req.body;
  const filePath = req.file.path;

  const products = [];
  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      if (row['S. No.'] && row['Product Name'] && row['Input Image Urls']) {
        products.push({
          serialNumber: parseInt(row['S. No.']),
          productName: row['Product Name'],
          inputImageUrls: row['Input Image Urls'].split(',').map(url => url.trim())
        });
      }
    })
    .on('end', async () => {
      if (products.length === 0) {
        fs.unlinkSync(filePath);
        return res.status(400).json({ error: 'Invalid CSV format' });
      }

      const requestId = uuidv4();
      const request = new Request({ requestId, webhookUrl });
      await request.save();

      await Product.insertMany(products.map(product => ({
        requestId,
        ...product
      })));

      fs.unlinkSync(filePath);
      res.json({ requestId });

      setImmediate(() => processRequest(requestId));
    })
    .on('error', (err) => {
      fs.unlinkSync(filePath);
      res.status(500).json({ error: 'Error parsing CSV' });
    });
});

module.exports = router;