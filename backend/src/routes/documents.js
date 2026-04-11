const express = require('express');
const { body } = require('express-validator');
const { authenticate } = require('../middleware/authenticate');
const { validate } = require('../middleware/validate');
const upload = require('../middleware/upload');
const documentController = require('../controllers/documentController');

const router = express.Router();

// GET /api/v1/documents
router.get('/', authenticate, documentController.listDocuments);

// POST /api/v1/documents/upload
router.post('/upload',
  authenticate,
  upload.single('file'),
  [
    body('title').notEmpty().isLength({ min: 2, max: 200 }),
    body('category').isIn([
      'CONTRACT', 'COURT_ORDER', 'FIR', 'LEGAL_NOTICE',
      'AFFIDAVIT', 'DEED', 'AGREEMENT', 'OTHER',
    ]),
    validate,
  ],
  documentController.uploadDocument
);

// DELETE /api/v1/documents/:id
router.delete('/:id', authenticate, documentController.deleteDocument);

module.exports = router;