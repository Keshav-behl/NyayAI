const express = require('express');
const { prisma } = require('../utils/prisma');

const router = express.Router();

router.get('/', async (req, res) => {
  const start = Date.now();
  let dbStatus = 'healthy';
  let dbLatency = null;

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbLatency = Date.now() - start;
  } catch (err) {
    dbStatus = 'unhealthy';
  }

  const status = dbStatus === 'healthy' ? 'ok' : 'degraded';

  res.status(status === 'ok' ? 200 : 503).json({
    status,
    timestamp: new Date().toISOString(),
    service: 'NyayAI API',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    uptime: Math.floor(process.uptime()),
    database: {
      status: dbStatus,
      latencyMs: dbLatency,
    },
    memory: {
      heapUsedMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      heapTotalMB: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
    },
  });
});

module.exports = router;