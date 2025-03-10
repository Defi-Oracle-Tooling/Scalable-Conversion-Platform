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
    
    // Global limiter
    expect(globalLimiter).toBeDefined();
    expect(globalLimiter.options.windowMs).toEqual(15 * 60 * 1000);
    expect(globalLimiter.options.max).toEqual(100);
    expect(globalLimiter.options.message).toHaveProperty('success', false);
    expect(globalLimiter.options.message).toHaveProperty('error');
    expect(globalLimiter.options.message.error).toContain('Too many requests');
    
    // API limiter
    expect(apiLimiter).toBeDefined();
    expect(apiLimiter.options.windowMs).toEqual(15 * 60 * 1000);
    expect(apiLimiter.options.max).toEqual(50);
    expect(apiLimiter.options.message).toHaveProperty('success', false);
    expect(apiLimiter.options.message).toHaveProperty('error');
    expect(apiLimiter.options.message.error).toContain('Too many API requests');
    
    // Conversion limiter
    expect(conversionLimiter).toBeDefined();
    expect(conversionLimiter.options.windowMs).toEqual(5 * 60 * 1000);
    expect(conversionLimiter.options.max).toEqual(10);
    expect(conversionLimiter.options.message).toHaveProperty('success', false);
    expect(conversionLimiter.options.message).toHaveProperty('error');
    expect(conversionLimiter.options.message.error).toContain('Too many conversion requests');
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
