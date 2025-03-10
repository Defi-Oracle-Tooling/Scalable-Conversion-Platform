const request = require('supertest');
const app = require('../server');

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
        limit: jest.fn().mockResolvedValue([
          { 
            _id: 'mock-id',
            fromCurrency: 'BTC',
            toCurrency: 'ETH',
            amount: 1,
            convertedAmount: 0.05,
            rate: 0.05,
            createdAt: new Date()
          }
        ])
      })
    })
  };
  return mmongoose;
});

// Mock Tatum SDK
jest.mock('@tatumio/tatum', () => ({
  TatumSDK: {
    init: jest.fn().mockImplementation(() => ({
      exchangeRate: {
        getExchangeRate: jest.fn().mockResolvedValue({ value: '0.05' })
      },
      destroy: jest.fn().mockResolvedValue(true)
    }))
  }
}));

describe('POST /api/conversions/convert', () => {
  it('should convert currency and return result', async () => {
    const res = await request(app)
      .post('/api/conversions/convert')
      .send({
        fromCurrency: 'BTC',
        toCurrency: 'ETH',
        amount: '1'
      });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('convertedAmount', 0.05);
    expect(res.body.data).toHaveProperty('rate', 0.05);
  });

  it('should return 400 if parameters are missing', async () => {
    const res = await request(app)
      .post('/api/conversions/convert')
      .send({
        fromCurrency: 'BTC'
      });
    
    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/conversions/rates', () => {
  it('should return exchange rates', async () => {
    const res = await request(app)
      .get('/api/conversions/rates')
      .query({ from: 'BTC', to: 'ETH' });
    
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.rates).toHaveProperty('BTC');
    expect(res.body.data.rates.BTC).toHaveProperty('ETH', '0.05');
  });
});

describe('GET /api/conversions/history', () => {
  it('should return conversion history', async () => {
    const res = await request(app)
      .get('/api/conversions/history');
    
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toEqual(1);
    expect(res.body.data[0]).toHaveProperty('fromCurrency', 'BTC');
  });
});
