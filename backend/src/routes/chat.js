const express = require('express');
const { body, param } = require('express-validator');
const { authenticate } = require('../middleware/authenticate');
const { validate } = require('../middleware/validate');
const chatController = require('../controllers/chatController');

const router = express.Router();

// POST /api/v1/chat/stream
router.post('/stream', authenticate, [
  body('query').notEmpty().isLength({ min: 3, max: 1000 }),
  body('history').optional().isArray(),
  body('conversationId').optional().isUUID(),
  validate,
], chatController.streamChat);

// GET /api/v1/chat/history/:conversationId
router.get('/history/:conversationId', authenticate, [
  param('conversationId').isUUID(),
  validate,
], chatController.getHistory);

// GET /api/v1/chat/conversations
router.get('/conversations', authenticate, chatController.listConversations);

module.exports = router;
