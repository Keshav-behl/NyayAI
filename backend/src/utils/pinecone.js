const { Pinecone } = require('@pinecone-database/pinecone');

let pineconeClient = null;

const getPinecone = async () => {
  if (!pineconeClient) {
    pineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
  }
  return pineconeClient;
};

const getIndex = async () => {
  const pc = await getPinecone();
  return pc.index(process.env.PINECONE_INDEX_NAME || 'nyayai-legal');
};

module.exports = { getPinecone, getIndex };