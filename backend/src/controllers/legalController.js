const { Pinecone } = require('@pinecone-database/pinecone');
const { generateLegalAnswer } = require('../utils/claude');
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

    logger.info(`Legal search: "${query}" by user ${req.user.id}`);

    const index = getIndex();
    const results = await index.searchRecords({
      namespace: '__default__',
      query: { inputs: { text: query }, topK },
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

    res.json({ success: true, data: { query, sections } });
  } catch (error) {
    logger.error('Legal search error:', error);
    next(error);
  }
};

// POST /api/v1/legal/ask
exports.askLegal = async (req, res, next) => {
  try {
    const { question } = req.body;

    logger.info(`Legal question: "${question}" by user ${req.user.id}`);

    // Step 1: Search Pinecone for relevant sections
    const index = getIndex();
    const results = await index.searchRecords({
      namespace: '__default__',
      query: { inputs: { text: question }, topK: 5 },
      fields: ['act', 'section', 'title', 'originalText'],
    });

    if (!results.result.hits || results.result.hits.length === 0) {
      return res.json({
        success: true,
        data: {
          question,
          answer: 'I could not find relevant legal information for your question. Please try rephrasing or consult a lawyer directly.',
          sources: [],
        },
      });
    }

    // Step 2: Build context from retrieved sections
    const context = results.result.hits
      .map(h => `${h.fields.act} Section ${h.fields.section} — ${h.fields.title}:\n${h.fields.originalText}`)
      .join('\n\n---\n\n');

    const sources = results.result.hits.map(h => ({
      act: h.fields.act,
      section: h.fields.section,
      title: h.fields.title,
      relevanceScore: Math.round(h._score * 100),
    }));

    // Step 3: Generate AI answer using NVIDIA Llama
    const answer = await generateLegalAnswer(question, context);

    // Step 4: Log to audit
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'LEGAL_QUERY',
        entity: 'legal_search',
        metadata: { question, sourcesCount: sources.length },
      },
    });

    res.json({
      success: true,
      data: { question, answer, sources },
    });
  } catch (error) {
    logger.error('Legal ask error:', error);
    next(error);
  }
};