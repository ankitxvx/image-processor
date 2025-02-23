const express = require('express');
const mongoose = require('mongoose');
const uploadRouter = require('./routes/upload');
const statusRouter = require('./routes/status');
const outputRouter = require('./routes/output');
const dotenv =require('dotenv')
const app = express();
dotenv.config()
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use(express.static('public'));
app.use('/upload', uploadRouter);
app.use('/status', statusRouter);
app.use('/output', outputRouter);

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});