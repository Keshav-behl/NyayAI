const express = require('express');
const { body } = require('express-validator');
const { authenticate } = require('../middleware/authenticate');
const { validate } = require('../middleware/validate');
const upload = require('../middleware/upload');
const documentController = require('../controllers/documentController');
const analysisController = require('../controllers/analysisController');

const router = express.Router();

// GET /api/v1/documents
router.get('/', authenticate, documentController.listDocuments);

// POST /api/v1/documents/upload
router.post('/upload',
  authenticate,
  upload.single('file'),
  [
    body('title').notEmpty().isLength({ min: 2, max: 200 }).trim().escape(),
    body('category').isIn([
      'CONTRACT', 'COURT_ORDER', 'FIR', 'LEGAL_NOTICE',
      'AFFIDAVIT', 'DEED', 'AGREEMENT', 'OTHER',
    ]),
    validate,
  ],
  documentController.uploadDocument
);

// POST /api/v1/documents/:id/analyze
router.post('/:id/analyze',
  authenticate,
  [
    body('analysisType').isIn([
      'DOCUMENT_SUMMARY', 'RISK_ASSESSMENT',
      'CLAUSE_EXTRACTION', 'COMPLIANCE_CHECK',
    ]),
    validate,
  ],
  analysisController.analyzeDoc
);

// GET /api/v1/documents/:id/analyses
router.get('/:id/analyses', authenticate, analysisController.getAnalyses);

// DELETE /api/v1/documents/:id
router.delete('/:id', authenticate, documentController.deleteDocument);

module.exports = router;