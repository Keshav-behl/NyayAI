const request = require('supertest');
const app = require('../app');
const { prisma } = require('../utils/prisma');

jest.mock('../utils/prisma', () => ({
  prisma: {
    $queryRaw: jest.fn().mockResolvedValue([]),
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

const bcrypt = require('bcryptjs');

describe('Auth - Register', () => {
  beforeEach(() => jest.clearAllMocks());

  it('rejects registration with weak password', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      email: 'test@nyayai.in',
      password: '123',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects invalid email', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      email: 'not-an-email',
      password: 'Str0ngPass!',
    });
    expect(res.status).toBe(400);
  });

  it('returns 409 if email already exists', async () => {
    prisma.user.findUnique.mockResolvedValueOnce({ id: '123', email: 'exists@nyayai.in' });
    const res = await request(app).post('/api/v1/auth/register').send({
      email: 'exists@nyayai.in',
      password: 'Str0ngPass1',
    });
    expect(res.status).toBe(409);
  });

  it('registers a new user successfully', async () => {
    prisma.user.findUnique.mockResolvedValueOnce(null);
    prisma.user.create.mockResolvedValueOnce({
      id: 'uuid-123',
      email: 'new@nyayai.in',
      role: 'CLIENT',
      createdAt: new Date(),
    });
    prisma.refreshToken.create.mockResolvedValueOnce({});

    const res = await request(app).post('/api/v1/auth/register').send({
      email: 'new@nyayai.in',
      password: 'Str0ngPass1',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
  });
});

describe('Auth - Login', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 401 for unknown user', async () => {
    prisma.user.findUnique.mockResolvedValueOnce(null);
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'ghost@nyayai.in',
      password: 'SomePass1',
    });
    expect(res.status).toBe(401);
  });

  it('returns 401 for wrong password', async () => {
    const hash = await bcrypt.hash('CorrectPass1', 12);
    prisma.user.findUnique.mockResolvedValueOnce({
      id: 'uuid-123',
      email: 'user@nyayai.in',
      role: 'CLIENT',
      passwordHash: hash,
      isActive: true,
    });
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'user@nyayai.in',
      password: 'WrongPass1',
    });
    expect(res.status).toBe(401);
  });

  it('logs in successfully with correct credentials', async () => {
    const hash = await bcrypt.hash('Str0ngPass1', 12);
    prisma.user.findUnique.mockResolvedValueOnce({
      id: 'uuid-123',
      email: 'user@nyayai.in',
      role: 'CLIENT',
      passwordHash: hash,
      isActive: true,
    });
    prisma.refreshToken.create.mockResolvedValueOnce({});

    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'user@nyayai.in',
      password: 'Str0ngPass1',
    });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });
});