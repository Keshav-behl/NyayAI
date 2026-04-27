const express = require('express');
const { body } = require('express-validator');
const { authenticate } = require('../middleware/authenticate');
const { validate } = require('../middleware/validate');
const orgController = require('../controllers/organizationController');

const router = express.Router();

// GET /api/v1/organizations/mine
router.get('/mine', authenticate, orgController.getMyOrganizations);

// POST /api/v1/organizations
router.post('/', authenticate, [
  body('name').notEmpty().isLength({ min: 2, max: 200 }).trim(),
  body('type').isIn(['LAW_FIRM', 'BANK', 'NBFC', 'ENTERPRISE', 'STARTUP']),
  body('email').isEmail().normalizeEmail(),
  body('phone').optional().isString(),
  body('city').optional().isString().trim(),
  body('state').optional().isString().trim(),
  body('gstin').optional().isString(),
  validate,
], orgController.createOrganization);

// GET /api/v1/organizations/:id
router.get('/:id', authenticate, orgController.getOrganization);

// PUT /api/v1/organizations/:id
router.put('/:id', authenticate, [
  body('name').optional().isLength({ min: 2, max: 200 }).trim(),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().isString(),
  body('city').optional().isString().trim(),
  body('state').optional().isString().trim(),
  body('gstin').optional().isString(),
  validate,
], orgController.updateOrganization);

module.exports = router;