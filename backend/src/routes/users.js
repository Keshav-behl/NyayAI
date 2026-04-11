const express = require('express');
const { authenticate } = require('../middleware/authenticate');
const { authorize } = require('../middleware/authenticate');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const userController = require('../controllers/userController');

const router = express.Router();

// GET /api/v1/users/profile
router.get('/profile', authenticate, userController.getProfile);

// PUT /api/v1/users/profile
router.put('/profile', authenticate, [
  body('fullName').optional().isLength({ min: 2, max: 100 }),
  body('phone').optional().matches(/^(\+91[-\s]?)?[6-9]\d{9}$/),
  body('city').optional().isLength({ min: 2, max: 100 }),
  body('state').optional().isLength({ min: 2, max: 100 }),
  body('preferredLanguage').optional().isIn(['en', 'hi', 'pa', 'mr', 'gu', 'ta', 'te', 'kn', 'bn']),
  validate,
], userController.updateProfile);

// PUT /api/v1/users/lawyer-profile
router.put('/lawyer-profile', authenticate, authorize('LAWYER'), [
  body('fullName').optional().isLength({ min: 2, max: 100 }),
  body('bio').optional().isLength({ max: 1000 }),
  body('consultationFee').optional().isFloat({ min: 0 }),
  body('experienceYears').optional().isInt({ min: 0, max: 60 }),
  body('specializations').optional().isArray(),
  body('languages').optional().isArray(),
  body('city').optional().isLength({ min: 2, max: 100 }),
  body('state').optional().isLength({ min: 2, max: 100 }),
  body('isAvailable').optional().isBoolean(),
  validate,
], userController.updateLawyerProfile);

module.exports = router;