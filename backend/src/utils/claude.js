const OpenAI = require('openai');

let client = null;

const getClient = () => {
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.NVIDIA_API_KEY,
      baseURL: 'https://integrate.api.nvidia.com/v1',
    });
  }
  return client;
};

// Generate a legal answer using RAG context
const generateLegalAnswer = async (question, context) => {
  const nvidia = getClient();

  const response = await nvidia.chat.completions.create({
    model: 'meta/llama-3.3-70b-instruct',
    messages: [
      {
        role: 'system',
        content: `You are NyayAI, an expert Indian legal assistant. You help users understand Indian law clearly and accurately.

You have access to relevant sections from Indian legal acts. Use this context to answer the user's question.

Rules:
- Always cite the specific section and act you are referencing
- Use simple language that a non-lawyer can understand  
- If the context does not contain enough information, say so clearly
- Never give personal legal advice — always recommend consulting a lawyer for specific cases
- Format your response with clear sections when appropriate`,
      },
      {
        role: 'user',
        content: `Relevant Legal Context:\n${context}\n\nUser Question: ${question}\n\nPlease provide a clear, accurate answer based on the legal context above.`,
      },
    ],
    temperature: 0.3,
    max_tokens: 1500,
  });

  return response.choices[0].message.content;
};

// Analyze a legal document
const analyzeDocument = async (documentText, analysisType) => {
  const nvidia = getClient();

  const prompts = {
    DOCUMENT_SUMMARY: `Summarize this Indian legal document in simple terms. Identify: 1) Type of document 2) Key parties involved 3) Main obligations 4) Important dates/deadlines 5) Critical clauses`,
    RISK_ASSESSMENT: `Analyze this Indian legal document for risks. Identify: 1) High-risk clauses 2) Missing standard protections 3) Ambiguous terms 4) Potential disputes 5) Recommendations`,
    CLAUSE_EXTRACTION: `Extract and explain all key clauses from this Indian legal document. For each clause: 1) Clause name 2) Plain English explanation 3) Legal implications 4) Risk level (Low/Medium/High)`,
    COMPLIANCE_CHECK: `Check this document for compliance with Indian law. Identify: 1) Applicable acts/regulations 2) Compliant sections 3) Non-compliant or missing sections 4) Required corrections`,
  };

  const response = await nvidia.chat.completions.create({
    model: 'meta/llama-3.3-70b-instruct',
    messages: [
      {
        role: 'system',
        content: `You are NyayAI, an expert Indian legal document analyzer. Analyze documents accurately under Indian law (IPC, CrPC, Contract Act, Companies Act, etc.). Always structure your response in clear sections with headers.`,
      },
      {
        role: 'user',
        content: `${prompts[analysisType] || prompts.DOCUMENT_SUMMARY}\n\nDocument:\n${documentText.slice(0, 8000)}`,
      },
    ],
    temperature: 0.2,
    max_tokens: 2000,
  });

  return response.choices[0].message.content;
};

module.exports = { generateLegalAnswer, analyzeDocument };