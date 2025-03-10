const request = require('supertest');
const app = require('../server');
const { getSystemHealth } = require('../middleware/monitoring');

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

describe('Monitoring Middleware', () => {
  it('should return system health metrics on health endpoint', async () => {
    const res = await request(app).get('/health');
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('cpu');
    expect(res.body.cpu).toHaveProperty('loadAvg');
    expect(res.body.cpu).toHaveProperty('cores');
    expect(res.body).toHaveProperty('memory');
    expect(res.body.memory).toHaveProperty('total');
    expect(res.body.memory).toHaveProperty('free');
    expect(res.body.memory).toHaveProperty('used');
    expect(res.body.memory).toHaveProperty('usagePercentage');
    expect(res.body).toHaveProperty('os');
    expect(res.body.os).toHaveProperty('platform');
    expect(res.body.os).toHaveProperty('release');
  });

  it('should return metrics endpoint data in non-production environment', async () => {
    // Save original NODE_ENV
    const originalEnv = process.env.NODE_ENV;
    
    // Set NODE_ENV to development for this test
    process.env.NODE_ENV = 'development';
    
    const res = await request(app).get('/metrics');
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('environment', 'development');
    expect(res.body).toHaveProperty('nodeVersion');
    expect(res.body).toHaveProperty('processUptime');
    
    // Restore original NODE_ENV
    process.env.NODE_ENV = originalEnv;
  });

  it('should not expose metrics endpoint in production environment', async () => {
    // Save original NODE_ENV
    const originalEnv = process.env.NODE_ENV;
    
    // Set NODE_ENV to production for this test
    process.env.NODE_ENV = 'production';
    
    const res = await request(app).get('/metrics');
    
    expect(res.statusCode).toEqual(404);
    
    // Restore original NODE_ENV
    process.env.NODE_ENV = originalEnv;
  });

  it('getSystemHealth should return valid system metrics', () => {
    const health = getSystemHealth();
    
    expect(health).toHaveProperty('status', 'ok');
    expect(health).toHaveProperty('uptime');
    expect(health).toHaveProperty('timestamp');
    expect(health).toHaveProperty('cpu');
    expect(health.cpu).toHaveProperty('loadAvg');
    expect(health.cpu).toHaveProperty('cores');
    expect(health).toHaveProperty('memory');
    expect(health.memory).toHaveProperty('total');
    expect(health.memory).toHaveProperty('free');
    expect(health.memory).toHaveProperty('used');
    expect(health.memory).toHaveProperty('usagePercentage');
    expect(health).toHaveProperty('os');
    expect(health.os).toHaveProperty('platform');
    expect(health.os).toHaveProperty('release');
  });
});
