const express = require('express');
const router = express.Router();
const { TatumSDK, Network, Ethereum, Bitcoin } = require('@tatumio/tatum');

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
router.post('/create', async (req, res) => {
  try {
    const { blockchain } = req.body;
    
    if (!blockchain) {
      return res.status(400).json({ error: 'Blockchain parameter is required' });
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
        return res.status(400).json({ error: `Unsupported blockchain: ${blockchain}` });
    }
    
    // Destroy the Tatum SDK instance
    await tatum.destroy();
    
    res.json({
      blockchain,
      wallet,
      created: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating wallet:', error);
    res.status(500).json({ error: error.message || 'An error occurred while creating wallet' });
  }
});

/**
 * Get account details (placeholder for future implementation)
 * @route GET /api/accounts/:id
 * @param {string} id - Account ID
 * @returns {Object} Account details
 */
router.get('/:id', async (req, res) => {
  try {
    // This is a placeholder for future implementation
    // In a real application, you would fetch account details from a database
    res.json({
      id: req.params.id,
      message: 'Account details endpoint - to be implemented',
      note: 'This is a placeholder for future implementation'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
