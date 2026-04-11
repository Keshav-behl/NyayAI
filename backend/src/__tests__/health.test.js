const request = require('supertest');
const app = require('../app');

jest.mock('../utils/prisma', () => ({
  prisma: {
    $queryRaw: jest.fn().mockResolvedValue([{ 1: 1 }]),
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

describe('Health Check', () => {
  it('GET /health returns 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('NyayAI API');
    expect(res.body.database).toBeDefined();
  });

  it('GET /health includes uptime and memory fields', async () => {
    const res = await request(app).get('/health');
    expect(res.body.uptime).toBeGreaterThanOrEqual(0);
    expect(res.body.memory.heapUsedMB).toBeGreaterThan(0);
  });
});

describe('API Info', () => {
  it('GET /api/v1 returns endpoint map', async () => {
    const res = await request(app).get('/api/v1');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('NyayAI API');
    expect(res.body.endpoints).toBeDefined();
  });
});

describe('404 Handler', () => {
  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/this-does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});