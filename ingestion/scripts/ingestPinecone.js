require('dotenv').config({ path: require('path').join(__dirname, '..', '..', 'backend', '.env') });
const fs = require('fs');
const path = require('path');
const { Pinecone } = require('@pinecone-database/pinecone');

const OUTPUT_DIR = path.join(__dirname, '..', 'output');
const NAMESPACE = 'personal_law';
// The integrated-embeddings upsertRecords endpoint caps batches at 96 (server
// embeds synchronously), unlike raw vector upsert which allows ~500.
const BATCH_SIZE = 90;
const DRY_RUN_ACT = 'The Hindu Marriage Act, 1955';

function getIndex() {
  const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  return pc.index(process.env.PINECONE_INDEX_NAME || 'nyayai-legal', process.env.PINECONE_HOST);
}

function loadAllChunks() {
  const files = fs.readdirSync(OUTPUT_DIR).filter((f) => f.endsWith('_enriched.json'));
  let all = [];
  for (const f of files) {
    all = all.concat(JSON.parse(fs.readFileSync(path.join(OUTPUT_DIR, f), 'utf-8')));
  }
  return all;
}

function toRecord(chunk) {
  const id = `${chunk.act}_${chunk.section_number}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  // Integrated-embedding indexes auto-embed the `text` field (llama-text-embed-v2,
  // same as the existing __default__ namespace ingestion). Pinecone metadata
  // rejects null, so superseded_by is omitted rather than sent as null.
  return {
    id,
    text: `${chunk.act}, Section ${chunk.section_number}: ${chunk.text}`,
    act: chunk.act,
    section_number: chunk.section_number,
    religion: chunk.religion,
    subtopic: chunk.subtopic,
    jurisdiction: chunk.jurisdiction,
    effective_date: chunk.effective_date || '',
    citation: chunk.citation,
    tags: chunk.tags,
    originalText: chunk.text,
  };
}

async function upsertBatches(index, chunks) {
  const records = chunks.map(toRecord);
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    await index.upsertRecords({ namespace: NAMESPACE, records: batch });
    console.log(`  upserted batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} records`);
  }
  return records.length;
}

async function runQuery(index, queryText, topK = 3) {
  const results = await index.searchRecords({
    namespace: NAMESPACE,
    query: { inputs: { text: queryText }, topK },
    fields: ['act', 'section_number', 'citation', 'religion', 'subtopic', 'originalText'],
  });

  console.log(`\nQuery: "${queryText}"`);
  if (!results.result.hits.length) {
    console.log('  (no hits)');
    return results;
  }
  results.result.hits.forEach((hit, i) => {
    const f = hit.fields;
    console.log(`  ${i + 1}. [score ${hit._score.toFixed(3)}] ${f.citation} (${f.religion}, ${(f.subtopic || []).join('/')})`);
    console.log(`     ${f.originalText.slice(0, 180).replace(/\n/g, ' ')}...`);
  });
  return results;
}

async function dryRun() {
  const index = getIndex();
  const chunks = loadAllChunks().filter((c) => c.act === DRY_RUN_ACT);
  console.log(`=== DRY RUN: ${DRY_RUN_ACT} (${chunks.length} chunks) -> namespace "${NAMESPACE}" ===`);
  await upsertBatches(index, chunks);

  console.log('\nWaiting for index freshness...');
  await new Promise((r) => setTimeout(r, 8000));

  await runQuery(index, 'grounds for divorce under Hindu law');
}

async function fullRun() {
  const index = getIndex();
  const chunks = loadAllChunks();
  console.log(`=== FULL INGESTION: ${chunks.length} chunks across all acts -> namespace "${NAMESPACE}" ===`);
  const total = await upsertBatches(index, chunks);

  console.log('\nWaiting for index freshness...');
  await new Promise((r) => setTimeout(r, 8000));

  const queries = [
    'custody of a minor child',
    'maintenance for wife after divorce',
  ];
  for (const q of queries) {
    await runQuery(index, q);
  }

  const stats = await index.describeIndexStats();
  const nsStats = stats.namespaces?.[NAMESPACE];
  console.log(`\nTotal vectors upserted this run: ${total}`);
  console.log(`Namespace "${NAMESPACE}" vector count (per Pinecone): ${nsStats ? nsStats.recordCount : 'unknown'}`);
}

const mode = process.argv[2];
if (mode === '--dry-run') {
  dryRun().catch((e) => { console.error(e); process.exit(1); });
} else if (mode === '--full') {
  fullRun().catch((e) => { console.error(e); process.exit(1); });
} else {
  console.log('Usage: node scripts/ingestPinecone.js --dry-run | --full');
  process.exit(1);
}
