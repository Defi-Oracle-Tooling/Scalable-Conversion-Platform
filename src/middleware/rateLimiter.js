const rateLimit = require('express-rate-limit');

/**
 * Global rate limiter middleware
 * Limits requests to 100 per 15 minutes per IP
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    error: 'Too many requests, please try again later.'
  }
});

/**
 * API rate limiter middleware
 * More strict limits for API endpoints
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many API requests, please try again later.'
  }
});

/**
 * Conversion rate limiter middleware
 * Stricter limits for conversion endpoints
 */
const conversionLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many conversion requests, please try again later.'
  }
});

module.exports = {
  globalLimiter,
  apiLimiter,
  conversionLimiter
};
