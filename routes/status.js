const express = require('express');
const Request = require('../models/Request');

const router = express.Router();

router.get('/:requestId', async (req, res) => {
  const { requestId } = req.params;
  const request = await Request.findOne({ requestId });

  if (!request) {
    return res.status(404).json({ error: 'Request not found' });
  }

  const response = { status: request.status };
  if (request.status === 'completed') {
    response.outputUrl = `/output/${requestId}.csv`;
  }

  res.json(response);
});

module.exports = router;