const axios = require('axios');
const sharp = require('sharp');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const Request = require('../models/Request');
const Product = require('../models/Product');

const processProduct = async (product) => {
  try {
    await Product.updateOne({ _id: product._id }, { status: 'processing' });
    const outputImageUrls = new Array(product.inputImageUrls.length).fill('');

    for (let i = 0; i < product.inputImageUrls.length; i++) {
      const url = product.inputImageUrls[i];
      try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data, 'binary');
        const filename = `${uuidv4()}.jpg`;
        const outputPath = path.join(__dirname, '..', 'public', 'images', filename);
        await sharp(buffer).jpeg({ quality: 50 }).toFile(outputPath);
        outputImageUrls[i] = `/images/${filename}`;
      } catch (error) {
        console.error(`Error processing image ${url}:`, error.message);
        // Leave outputImageUrls[i] as empty string
      }
    }

    await Product.updateOne(
      { _id: product._id },
      { outputImageUrls, status: 'completed', updatedAt: Date.now() }
    );
  } catch (error) {
    console.error(`Error processing product ${product._id}:`, error.message);
    await Product.updateOne(
      { _id: product._id },
      { status: 'failed', error: error.message, updatedAt: Date.now() }
    );
  }
};

const processRequest = async (requestId) => {
  try {
    await Request.updateOne({ requestId }, { status: 'processing', updatedAt: Date.now() });
    const products = await Product.find({ requestId });

    await Promise.allSettled(products.map(product => processProduct(product)));

    await Request.updateOne({ requestId }, { status: 'completed', updatedAt: Date.now() });

    const request = await Request.findOne({ requestId });
    if (request.webhookUrl) {
      try {
        await axios.post(request.webhookUrl, { requestId, status: 'completed' });
        console.log(`Webhook triggered for ${requestId}`);
      } catch (error) {
        console.error(`Webhook failed for ${requestId}:`, error.message);
      }
    }
  } catch (error) {
    console.error(`Error processing request ${requestId}:`, error.message);
    await Request.updateOne({ requestId }, { status: 'failed', error: error.message });
  }
};

module.exports = processRequest;