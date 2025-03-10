const express = require('express');
const router = express.Router();
const { TatumSDK } = require('@tatumio/tatum');
const Conversion = require('../models/Conversion');
const asyncHandler = require('../middleware/asyncHandler');
const { conversionLimiter } = require('../middleware/rateLimiter');

// Initialize Tatum SDK
const initTatum = async () => {
  try {
    // For testing without API key, return mock data
    if (process.env.NODE_ENV === 'test' || !process.env.TATUM_API_KEY) {
      console.log('Using mock Tatum SDK data (no API key provided)');
      return {
        exchangeRate: {
          getExchangeRate: async () => ({ value: '0.05' })
        },
        destroy: async () => {}
      };
    }
    
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
router.post('/convert', conversionLimiter, asyncHandler(async (req, res) => {
  const { fromCurrency, toCurrency, amount } = req.body;
  
  if (!fromCurrency || !toCurrency || !amount) {
    res.status(400);
    throw new Error('Missing required parameters: fromCurrency, toCurrency, and amount are required');
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
  
  // Save conversion to database
  const conversion = await Conversion.create({
    fromCurrency,
    toCurrency,
    amount: parseFloat(amount),
    convertedAmount,
    rate
  });
  
  // Destroy the Tatum SDK instance
  await tatum.destroy();
  
  res.status(201).json({
    success: true,
    data: {
      id: conversion._id,
      fromCurrency,
      toCurrency,
      amount,
      convertedAmount,
      rate,
      timestamp: conversion.createdAt
    }
  });
}));

/**
 * Get current exchange rates
 * @route GET /api/conversions/rates
 * @param {string} from - Source currency code (optional)
 * @param {string} to - Target currency code (optional)
 * @returns {Object} Current exchange rates
 */
router.get('/rates', conversionLimiter, asyncHandler(async (req, res) => {
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
    success: true,
    data: { 
      rates: ratesData,
      timestamp: new Date().toISOString()
    }
  });
}));

/**
 * Get conversion history
 * @route GET /api/conversions/history
 * @returns {Object} List of recent conversions
 */
router.get('/history', conversionLimiter, asyncHandler(async (req, res) => {
  const conversions = await Conversion.find().sort({ createdAt: -1 }).limit(50);
  
  res.json({
    success: true,
    count: conversions.length,
    data: conversions
  });
}));

module.exports = router;
