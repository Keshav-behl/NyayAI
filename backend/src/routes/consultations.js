const express = require('express');
const { body } = require('express-validator');
const { authenticate } = require('../middleware/authenticate');
const { authorize } = require('../middleware/authenticate');
const { validate } = require('../middleware/validate');
const consultationController = require('../controllers/consultationController');

const router = express.Router();

// GET /api/v1/consultations
router.get('/', authenticate, consultationController.listConsultations);

// POST /api/v1/consultations
router.post('/', authenticate, authorize('CLIENT'), [
  body('lawyerId').notEmpty().isUUID(),
  body('type').isIn(['VIDEO', 'AUDIO', 'CHAT', 'IN_PERSON']),
  body('scheduledAt').isISO8601(),
  body('notes').optional().isLength({ max: 500 }),
  validate,
], consultationController.bookConsultation);

// PATCH /api/v1/consultations/:id/status
router.patch('/:id/status', authenticate, [
  body('status').isIn(['CONFIRMED', 'CANCELLED', 'COMPLETED']),
  validate,
], consultationController.updateStatus);

// POST /api/v1/consultations/:id/review
router.post('/:id/review', authenticate, authorize('CLIENT'), [
  body('rating').isInt({ min: 1, max: 5 }),
  body('review').optional().isLength({ max: 500 }),
  validate,
], consultationController.submitReview);

module.exports = router;