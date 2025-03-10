const request = require('supertest');
const app = require('../server');
const { globalLimiter, apiLimiter, conversionLimiter } = require('../middleware/rateLimiter');

// Mock express-rate-limit to avoid actual rate limiting during tests
jest.mock('express-rate-limit', () => {
  return jest.fn().mockImplementation((options) => {
    return (req, res, next) => {
      // Store the options for testing
      req.rateLimit = {
        limit: options.max,
        windowMs: options.windowMs,
        message: options.message
      };
      next();
    };
  });
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
  it('should apply global rate limiting to all routes', async () => {
    const res = await request(app).get('/health');
    
    expect(res.statusCode).toEqual(200);
    expect(res.req.rateLimit).toBeDefined();
    expect(res.req.rateLimit.limit).toEqual(100);
    expect(res.req.rateLimit.windowMs).toEqual(15 * 60 * 1000);
  });

  it('should apply API rate limiting to API routes', async () => {
    const res = await request(app).get('/api/conversions/rates');
    
    expect(res.statusCode).toEqual(200);
    expect(res.req.rateLimit).toBeDefined();
    expect(res.req.rateLimit.limit).toEqual(50);
    expect(res.req.rateLimit.windowMs).toEqual(15 * 60 * 1000);
  });

  it('should apply conversion rate limiting to conversion routes', async () => {
    const res = await request(app).post('/api/conversions/convert').send({
      fromCurrency: 'BTC',
      toCurrency: 'ETH',
      amount: '1'
    });
    
    expect(res.statusCode).toEqual(201);
    expect(res.req.rateLimit).toBeDefined();
    expect(res.req.rateLimit.limit).toEqual(10);
    expect(res.req.rateLimit.windowMs).toEqual(5 * 60 * 1000);
  });

  it('should have appropriate error messages for rate limiting', () => {
    expect(globalLimiter.message).toHaveProperty('success', false);
    expect(globalLimiter.message).toHaveProperty('error');
    expect(globalLimiter.message.error).toContain('Too many requests');
    
    expect(apiLimiter.message).toHaveProperty('success', false);
    expect(apiLimiter.message).toHaveProperty('error');
    expect(apiLimiter.message.error).toContain('Too many API requests');
    
    expect(conversionLimiter.message).toHaveProperty('success', false);
    expect(conversionLimiter.message).toHaveProperty('error');
    expect(conversionLimiter.message.error).toContain('Too many conversion requests');
  });
});
