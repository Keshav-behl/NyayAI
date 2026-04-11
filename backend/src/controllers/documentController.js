const { prisma } = require('../utils/prisma');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');

// GET /api/v1/documents
exports.listDocuments = async (req, res, next) => {
  try {
    const documents = await prisma.document.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        category: true,
        fileSize: true,
        mimeType: true,
        status: true,
        createdAt: true,
        aiAnalyses: {
          select: { id: true, analysisType: true, createdAt: true },
        },
      },
    });

    res.json({ success: true, data: { documents } });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/documents/upload
exports.uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { title, category } = req.body;

    const document = await prisma.document.create({
      data: {
        userId: req.user.id,
        title,
        category,
        fileUrl: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        status: 'UPLOADED',
      },
    });

    logger.info(`Document uploaded: ${document.id} by user ${req.user.id}`);

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: { document },
    });
  } catch (error) {
    // Clean up file if DB save fails
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    next(error);
  }
};

// DELETE /api/v1/documents/:id
exports.deleteDocument = async (req, res, next) => {
  try {
    const document = await prisma.document.findUnique({
      where: { id: req.params.id },
    });

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    if (document.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Delete file from disk
    if (document.fileUrl && fs.existsSync(document.fileUrl)) {
      fs.unlink(document.fileUrl, () => {});
    }

    await prisma.document.delete({ where: { id: req.params.id } });

    logger.info(`Document deleted: ${req.params.id} by user ${req.user.id}`);

    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    next(error);
  }
};