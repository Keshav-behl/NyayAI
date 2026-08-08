const express = require('express');
const { authenticate, authorize } = require('../middleware/authenticate');
const adminController = require('../controllers/adminController');

const router = express.Router();

// GET /api/v1/admin/ingestion-status
router.get('/ingestion-status', authenticate, authorize('SUPER_ADMIN'), adminController.getIngestionStatus);

module.exports = router;
