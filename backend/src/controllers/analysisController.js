const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const { analyzeDocument, NVIDIA_MODEL } = require('../utils/claude');
const { validateFileByMagicBytes } = require('../utils/fileValidator');
const { sanitizeForPrompt } = require('../utils/sanitize');
const { prisma } = require('../utils/prisma');
const logger = require('../utils/logger');

// Extract text from a document file
const extractText = async (filePath, mimeType) => {
  const buffer = fs.readFileSync(filePath);

  // Security: validate file by magic bytes before processing
  const validation = await validateFileByMagicBytes(buffer);
  if (!validation.valid) {
    throw new Error(`Invalid file content: ${validation.reason}`);
  }

  if (mimeType === 'application/pdf' || validation.mime === 'application/pdf') {
    const data = await pdfParse(buffer);
    return data.text;
  }

  // For images and other types, return a placeholder
  // In production, add OCR here (e.g. Tesseract)
  if (mimeType?.startsWith('image/')) {
    return '[Image document — OCR not yet implemented. Please upload a PDF or text document for analysis.]';
  }

  // For .doc/.docx, return placeholder
  // In production, add mammoth.js here
  return buffer.toString('utf8').replace(/[^\x20-\x7E\n\r]/g, ' ').trim();
};

// POST /api/v1/documents/:id/analyze
exports.analyzeDoc = async (req, res, next) => {
  try {
    const { analysisType } = req.body;
    const { id: documentId } = req.params;

    const VALID_TYPES = ['DOCUMENT_SUMMARY', 'RISK_ASSESSMENT', 'CLAUSE_EXTRACTION', 'COMPLIANCE_CHECK'];
    if (!VALID_TYPES.includes(analysisType)) {
      return res.status(400).json({ success: false, message: 'Invalid analysis type' });
    }

    // Fetch document — security: verify ownership
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Security: verify document belongs to requesting user
    if (document.userId !== req.user.id) {
      logger.warn(`Unauthorized analysis attempt: user ${req.user.id} on doc ${documentId}`);
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Check if analysis already exists
    const existing = await prisma.aiAnalysis.findFirst({
      where: { documentId, analysisType },
    });

    if (existing) {
      return res.json({
        success: true,
        message: 'Analysis already exists',
        data: { analysis: existing },
      });
    }

    // Verify file exists on disk
    if (!document.fileUrl || !fs.existsSync(document.fileUrl)) {
      return res.status(404).json({ success: false, message: 'Document file not found' });
    }

    // Update document status
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'PROCESSING' },
    });

    const startTime = Date.now();

    // Extract text from document
    let documentText;
    try {
      documentText = await extractText(document.fileUrl, document.mimeType);
    } catch (extractError) {
      await prisma.document.update({
        where: { id: documentId },
        data: { status: 'UPLOADED' },
      });
      return res.status(400).json({
        success: false,
        message: `Could not read document: ${extractError.message}`,
      });
    }

    if (!documentText || documentText.trim().length < 50) {
      await prisma.document.update({
        where: { id: documentId },
        data: { status: 'UPLOADED' },
      });
      return res.status(400).json({
        success: false,
        message: 'Document appears to be empty or unreadable. Please upload a text-based PDF.',
      });
    }

    // Run AI analysis — sanitize text before sending
    const result = await analyzeDocument(documentText, analysisType, req.user.id);
    const processingMs = Date.now() - startTime;

    // Save analysis to DB
    const analysis = await prisma.aiAnalysis.create({
      data: {
        documentId,
        analysisType,
        result: { text: result },
        modelUsed: NVIDIA_MODEL,
        processingMs,
      },
    });

    // Update document status
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'ANALYZED' },
    });

    // Security: log only metadata, never log document contents
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'DOCUMENT_ANALYZED',
        entity: 'document',
        entityId: documentId,
        metadata: {
          analysisType,
          processingMs,
          textLength: documentText.length,
        },
      },
    });

    logger.info(`Document ${documentId} analyzed (${analysisType}) in ${processingMs}ms`);

    res.json({
      success: true,
      message: 'Analysis complete',
      data: { analysis },
    });
  } catch (error) {
    logger.error('Document analysis error:', error.message);

    // Reset document status on error
    try {
      await prisma.document.update({
        where: { id: req.params.id },
        data: { status: 'UPLOADED' },
      });
    } catch {}

    next(error);
  }
};

// GET /api/v1/documents/:id/analyses
exports.getAnalyses = async (req, res, next) => {
  try {
    const { id: documentId } = req.params;

    // Security: verify document ownership
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    if (document.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const analyses = await prisma.aiAnalysis.findMany({
      where: { documentId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: { analyses } });
  } catch (error) {
    next(error);
  }
};