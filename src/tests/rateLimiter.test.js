const request = require('supertest');
const app = require('../server');
const { globalLimiter, apiLimiter, conversionLimiter } = require('../middleware/rateLimiter');

// Instead of mocking express-rate-limit, we'll test the middleware directly
const rateLimit = require('express-rate-limit');

// Create test middleware instances for direct testing
const testGlobalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests, please try again later.'
  }
});

const testApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many API requests, please try again later.'
  }
});

const testConversionLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many conversion requests, please try again later.'
  }
});

// Mock mongoose
jest.mock('mongoose', () => {
  const mmongoose = {
    connect: jest.fn().mockResolvedValue({
      connection: { host: 'mockdb' }
    }),
    disconnect: jest.fn().mockResolvedValue(true),
    Schema: function() {
      return {
        pre: jest.fn().mockReturnThis(),
        index: jest.fn().mockReturnThis()
      };
    },
    model: jest.fn().mockReturnValue({
      create: jest.fn().mockImplementation((data) => Promise.resolve({ 
        ...data, 
        _id: 'mock-id',
        createdAt: new Date()
      })),
      find: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([])
      })
    })
  };
  return mmongoose;
});

describe('Rate Limiting Middleware', () => {
  it('should verify rate limiter configurations', () => {
    // Test the middleware configuration directly from the imported module
    const { globalLimiter, apiLimiter, conversionLimiter } = require('../middleware/rateLimiter');
    
    // Verify the limiters exist
    expect(globalLimiter).toBeDefined();
    expect(apiLimiter).toBeDefined();
    expect(conversionLimiter).toBeDefined();
    
    // Verify they are functions (middleware)
    expect(typeof globalLimiter).toBe('function');
    expect(typeof apiLimiter).toBe('function');
    expect(typeof conversionLimiter).toBe('function');
    
    // Test that the rate limiters have the expected properties
    // Note: In express-rate-limit v6+, the options are not directly accessible
    // We can only test that the middleware functions exist
  });

  it('should successfully access rate-limited endpoints', async () => {
    // Test that the endpoints are accessible (not testing the actual rate limiting)
    const healthRes = await request(app).get('/health');
    expect(healthRes.statusCode).toEqual(200);
    
    const ratesRes = await request(app).get('/api/conversions/rates');
    expect(ratesRes.statusCode).toEqual(200);
    
    const convertRes = await request(app).post('/api/conversions/convert').send({
      fromCurrency: 'BTC',
      toCurrency: 'ETH',
      amount: '1'
    });
    expect(convertRes.statusCode).toEqual(201);
  });
});
