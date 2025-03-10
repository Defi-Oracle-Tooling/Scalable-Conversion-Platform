const mongoose = require('mongoose');

/**
 * Account Schema
 * Stores blockchain wallet accounts
 */
const AccountSchema = new mongoose.Schema({
  blockchain: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  walletData: {
    type: Object,
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

module.exports = mongoose.model('Account', AccountSchema);
