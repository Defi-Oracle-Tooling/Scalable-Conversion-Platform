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
 * Convert between cryptocurrencies
 * @route POST /api/conversions/convert
 * @param {string} fromCurrency - Source currency code (e.g., BTC)
 * @param {string} toCurrency - Target currency code (e.g., ETH)
 * @param {string} amount - Amount to convert
 * @returns {Object} Conversion result
 */
router.post('/convert', async (req, res) => {
  try {
    const { fromCurrency, toCurrency, amount } = req.body;
    
    if (!fromCurrency || !toCurrency || !amount) {
      return res.status(400).json({ 
        error: 'Missing required parameters: fromCurrency, toCurrency, and amount are required' 
      });
    }
    
    const tatum = await initTatum();
    
    // Get current exchange rate
    const rateData = await tatum.exchangeRate.getExchangeRate({
      currency: fromCurrency,
      basePair: toCurrency
    });
    
    // Calculate converted amount
    const rate = parseFloat(rateData.value);
    const convertedAmount = parseFloat(amount) * rate;
    
    // Destroy the Tatum SDK instance
    await tatum.destroy();
    
    res.json({
      fromCurrency,
      toCurrency,
      amount,
      convertedAmount,
      rate,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({ error: error.message || 'An error occurred during conversion' });
  }
});

/**
 * Get current exchange rates
 * @route GET /api/conversions/rates
 * @param {string} from - Source currency code (optional)
 * @param {string} to - Target currency code (optional)
 * @returns {Object} Current exchange rates
 */
router.get('/rates', async (req, res) => {
  try {
    const { from, to } = req.query;
    const tatum = await initTatum();
    
    let ratesData;
    
    if (from && to) {
      // Get specific exchange rate
      const rateData = await tatum.exchangeRate.getExchangeRate({
        currency: from,
        basePair: to
      });
      
      ratesData = {
        [from]: {
          [to]: rateData.value
        }
      };
    } else {
      // Get multiple common exchange rates
      const currencies = ['BTC', 'ETH', 'USDT', 'BNB'];
      ratesData = {};
      
      for (const currency of currencies) {
        ratesData[currency] = {};
        
        for (const targetCurrency of currencies.filter(c => c !== currency)) {
          try {
            const rateData = await tatum.exchangeRate.getExchangeRate({
              currency: currency,
              basePair: targetCurrency
            });
            
            ratesData[currency][targetCurrency] = rateData.value;
          } catch (err) {
            console.warn(`Could not fetch rate for ${currency}/${targetCurrency}:`, err.message);
            ratesData[currency][targetCurrency] = null;
          }
        }
      }
    }
    
    // Destroy the Tatum SDK instance
    await tatum.destroy();
    
    res.json({ 
      rates: ratesData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching rates:', error);
    res.status(500).json({ error: error.message || 'An error occurred while fetching rates' });
  }
});

module.exports = router;
