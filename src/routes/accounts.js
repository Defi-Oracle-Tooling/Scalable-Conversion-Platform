const express = require('express');
const router = express.Router();
const { TatumSDK } = require('@tatumio/tatum');
const Account = require('../models/Account');
const asyncHandler = require('../middleware/asyncHandler');

// Initialize Tatum SDK
const initTatum = async () => {
  try {
    return await TatumSDK.init({
      apiKey: process.env.TATUM_API_KEY,
    });
  } catch (error) {
    console.error('Failed to initialize Tatum SDK:', error);
    throw error;
  }
};

/**
 * Create a new blockchain wallet
 * @route POST /api/accounts/create
 * @param {string} blockchain - Blockchain to create wallet for (e.g., ethereum, bitcoin)
 * @returns {Object} Wallet details
 */
router.post('/create', asyncHandler(async (req, res) => {
  const { blockchain } = req.body;
  
  if (!blockchain) {
    res.status(400);
    throw new Error('Blockchain parameter is required');
  }
  
  const tatum = await initTatum();
  let wallet;
  
  switch (blockchain.toLowerCase()) {
    case 'ethereum':
    case 'eth':
      wallet = await tatum.ethereum.wallet.generateWallet();
      break;
    case 'bitcoin':
    case 'btc':
      wallet = await tatum.bitcoin.wallet.generateWallet();
      break;
    default:
      await tatum.destroy();
      res.status(400);
      throw new Error(`Unsupported blockchain: ${blockchain}`);
  }
  
  // Save account to database
  const account = await Account.create({
    blockchain: blockchain.toLowerCase(),
    address: wallet.address || wallet.xpub,
    walletData: wallet
  });
  
  // Destroy the Tatum SDK instance
  await tatum.destroy();
  
  res.status(201).json({
    success: true,
    data: {
      id: account._id,
      blockchain,
      address: account.address,
      created: account.createdAt
    }
  });
}));

/**
 * Get account details
 * @route GET /api/accounts/:id
 * @param {string} id - Account ID
 * @returns {Object} Account details
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const account = await Account.findById(req.params.id);
  
  if (!account) {
    res.status(404);
    throw new Error('Account not found');
  }
  
  res.json({
    success: true,
    data: account
  });
}));

/**
 * Get all accounts
 * @route GET /api/accounts
 * @returns {Object} List of all accounts
 */
router.get('/', asyncHandler(async (req, res) => {
  const accounts = await Account.find().sort({ createdAt: -1 });
  
  res.json({
    success: true,
    count: accounts.length,
    data: accounts
  });
}));

module.exports = router;
