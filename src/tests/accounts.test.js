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
        sort: jest.fn().mockResolvedValue([
          { 
            _id: 'mock-id',
            blockchain: 'ethereum',
            address: '0xTestAddress',
            walletData: { address: '0xTestAddress' },
            createdAt: new Date()
          }
        ])
      }),
      findById: jest.fn().mockImplementation((id) => {
        if (id === 'mock-id') {
          return Promise.resolve({
            _id: 'mock-id',
            blockchain: 'ethereum',
            address: '0xTestAddress',
            walletData: { address: '0xTestAddress' },
            createdAt: new Date()
          });
        }
        return Promise.resolve(null);
      })
    })
  };
  return mmongoose;
});

// Mock Tatum SDK
jest.mock('@tatumio/tatum', () => ({
  TatumSDK: {
    init: jest.fn().mockImplementation(() => ({
      ethereum: {
        wallet: {
          generateWallet: jest.fn().mockResolvedValue({
            mnemonic: 'test mnemonic',
            xpub: 'test xpub',
            address: '0xTestAddress'
          })
        }
      },
      bitcoin: {
        wallet: {
          generateWallet: jest.fn().mockResolvedValue({
            mnemonic: 'test mnemonic',
            xpub: 'test xpub'
          })
        }
      },
      destroy: jest.fn().mockResolvedValue(true)
    }))
  }
}));

describe('POST /api/accounts/create', () => {
  it('should create an ethereum wallet and return result', async () => {
    const res = await request(app)
      .post('/api/accounts/create')
      .send({
        blockchain: 'ethereum'
      });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('blockchain', 'ethereum');
    expect(res.body.data).toHaveProperty('address', '0xTestAddress');
  });

  it('should return 400 if blockchain parameter is missing', async () => {
    const res = await request(app)
      .post('/api/accounts/create')
      .send({});
    
    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/accounts', () => {
  it('should return all accounts', async () => {
    const res = await request(app).get('/api/accounts');
    
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data[0]).toHaveProperty('blockchain', 'ethereum');
  });
});

describe('GET /api/accounts/:id', () => {
  it('should return a specific account', async () => {
    const res = await request(app).get('/api/accounts/mock-id');
    
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('blockchain', 'ethereum');
    expect(res.body.data).toHaveProperty('address', '0xTestAddress');
  });

  it('should return 404 if account not found', async () => {
    const res = await request(app).get('/api/accounts/nonexistent-id');
    
    expect(res.statusCode).toEqual(404);
    expect(res.body.success).toBe(false);
  });
});
