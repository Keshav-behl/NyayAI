const { Pinecone } = require('@pinecone-database/pinecone');
const { generateLegalAnswer } = require('../utils/claude');
const { sanitizeQuestion } = require('../utils/sanitize');
const { prisma } = require('../utils/prisma');
const logger = require('../utils/logger');

const getIndex = () => {
  const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  return pc.index(
    process.env.PINECONE_INDEX_NAME || 'nyayai-legal',
    process.env.PINECONE_HOST
  );
};

// POST /api/v1/legal/search
exports.searchLegal = async (req, res, next) => {
  try {
    const { query, topK = 5 } = req.body;

    // Security: sanitize query before vector search
    const safeQuery = sanitizeQuestion(query);
    if (!safeQuery) {
      return res.status(400).json({ success: false, message: 'Invalid query' });
    }

    logger.info(`Legal search by user ${req.user.id} — query length: ${safeQuery.length}`);

    const index = getIndex();
    const results = await index.searchRecords({
      namespace: '__default__',
      query: { inputs: { text: safeQuery }, topK },
      fields: ['act', 'section', 'title', 'originalText'],
    });

    const sections = results.result.hits.map(hit => ({
      id: hit._id,
      score: hit._score,
      act: hit.fields.act,
      section: hit.fields.section,
      title: hit.fields.title,
      text: hit.fields.originalText,
    }));

    res.json({ success: true, data: { query: safeQuery, sections } });
  } catch (error) {
    logger.error('Legal search error:', error.message);
    next(error);
  }
};

// POST /api/v1/legal/ask
exports.askLegal = async (req, res, next) => {
  try {
    const { question } = req.body;

    // Security: sanitize question
    const safeQuestion = sanitizeQuestion(question);
    if (!safeQuestion) {
      return res.status(400).json({ success: false, message: 'Invalid question' });
    }

    logger.info(`Legal question by user ${req.user.id} — length: ${safeQuestion.length}`);

    const index = getIndex();
    const results = await index.searchRecords({
      namespace: '__default__',
      query: { inputs: { text: safeQuestion }, topK: 5 },
      fields: ['act', 'section', 'title', 'originalText'],
    });

    if (!results.result.hits || results.result.hits.length === 0) {
      return res.json({
        success: true,
        data: {
          question: safeQuestion,
          answer: 'I could not find relevant legal information for your question. Please try rephrasing or consult a lawyer directly.',
          sources: [],
        },
      });
    }

    const context = results.result.hits
      .map(h => `${h.fields.act} Section ${h.fields.section} — ${h.fields.title}:\n${h.fields.originalText}`)
      .join('\n\n---\n\n');

    const sources = results.result.hits.map(h => ({
      act: h.fields.act,
      section: h.fields.section,
      title: h.fields.title,
      relevanceScore: Math.round(h._score * 100),
    }));

    const answer = await generateLegalAnswer(safeQuestion, context);

    // Security: log only metadata, never log question content or AI answer
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'LEGAL_QUERY',
        entity: 'legal_search',
        metadata: {
          sourcesCount: sources.length,
          questionLength: safeQuestion.length,
        },
      },
    });

    res.json({ success: true, data: { question: safeQuestion, answer, sources } });
  } catch (error) {
    logger.error('Legal ask error:', error.message);
    next(error);
  }
};