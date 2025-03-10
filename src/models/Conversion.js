const mongoose = require('mongoose');

/**
 * Conversion Schema
 * Stores cryptocurrency conversion transactions
 */
const ConversionSchema = new mongoose.Schema({
  fromCurrency: {
    type: String,
    required: true,
    trim: true,
  },
  toCurrency: {
    type: String,
    required: true,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  convertedAmount: {
    type: Number,
    required: true,
  },
  rate: {
    type: Number,
    required: true,
  },
  userId: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Conversion', ConversionSchema);
