// With integrated embeddings, Pinecone handles this automatically
// We just need to pass text and Pinecone embeds it server-side

const chunkText = (text, chunkSize = 500, overlap = 50) => {
  const words = text.split(/\s+/);
  const chunks = [];
  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    if (chunk.trim().length > 50) chunks.push(chunk);
  }
  return chunks;
};

module.exports = { chunkText };