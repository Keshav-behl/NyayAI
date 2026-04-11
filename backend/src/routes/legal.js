const express = require('express');
const { body } = require('express-validator');
const { authenticate } = require('../middleware/authenticate');
const { validate } = require('../middleware/validate');
const legalController = require('../controllers/legalController');

const router = express.Router();

// POST /api/v1/legal/search
router.post('/search', authenticate, [
  body('query').notEmpty().isLength({ min: 5, max: 500 }),
  body('topK').optional().isInt({ min: 1, max: 10 }),
  validate,
], legalController.searchLegal);

// POST /api/v1/legal/ask
router.post('/ask', authenticate, [
  body('question').notEmpty().isLength({ min: 5, max: 500 }),
  validate,
], legalController.askLegal);

module.exports = router;