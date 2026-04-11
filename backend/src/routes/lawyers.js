const express = require('express');
const { query } = require('express-validator');
const { validate } = require('../middleware/validate');
const lawyerController = require('../controllers/lawyerController');

const router = express.Router();

// GET /api/v1/lawyers
router.get('/', [
  query('city').optional().isString(),
  query('state').optional().isString(),
  query('specialization').optional().isString(),
  query('language').optional().isString(),
  query('minFee').optional().isFloat({ min: 0 }),
  query('maxFee').optional().isFloat({ min: 0 }),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  validate,
], lawyerController.listLawyers);

// GET /api/v1/lawyers/:id
router.get('/:id', lawyerController.getLawyer);

module.exports = router;