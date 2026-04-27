const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const healthRouter = require('./routes/health');
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const documentsRouter = require('./routes/documents');
const lawyersRouter = require('./routes/lawyers');
const consultationsRouter = require('./routes/consultations');
const { errorHandler } = require('./middleware/errorHandler');
const { notFound } = require('./middleware/notFound');
const logger = require('./utils/logger');
const legalRouter = require('./routes/legal');
const organizationsRouter = require('./routes/organizations');


const app = express();

app.use(helmet());
app.use(compression());

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Org-ID'],
}));

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) },
  }));
}

app.use('/api/v1/legal', legalRouter);
app.use('/health', healthRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/documents', documentsRouter);
app.use('/api/v1/lawyers', lawyersRouter);
app.use('/api/v1/consultations', consultationsRouter);
app.use('/api/v1/organizations', organizationsRouter);

app.get('/api/v1', (req, res) => {
  res.json({
    name: 'NyayAI API',
    version: '1.0.0',
    description: 'AI-powered Indian Legal Platform',
    endpoints: {
      health: '/health',
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      documents: '/api/v1/documents',
      lawyers: '/api/v1/lawyers',
      consultations: '/api/v1/consultations',
    },
  });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;