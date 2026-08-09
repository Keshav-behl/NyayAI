require('dotenv').config({ path: require('path').join(__dirname, '..', '..', 'backend', '.env') });
const crypto = require('crypto');
const { Client } = require('pg');

// Ordering matters here so a re-run of an earlier phase (e.g. re-scraping a
// PDF someone deleted locally) can't regress an act's status backwards past
// work a later phase already did.
const STAGE_ORDER = ['PENDING', 'DOWNLOADED', 'VALIDATED', 'CHUNKED', 'ENRICHED', 'REVIEWED', 'INGESTED'];

// Writes ingestion progress to the same Postgres the deployed backend reads
// (via the ingestion_status table / IngestionStatus Prisma model) so the
// admin dashboard reflects real pipeline state. DATABASE_URL must point at
// whichever database backs the dashboard you want updated — point it at the
// deployed Render database, not a local dev DB, if you want the deployed
// dashboard to move. Never throws: a status-reporting failure shouldn't take
// down the actual ingestion step it's attached to.
async function reportStatus({ namespace, shortTitle, year, stage, sectionsIngested = 0 }) {
  if (!process.env.DATABASE_URL) {
    console.warn('  (status not reported: DATABASE_URL not set)');
    return;
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();

    const { rows } = await client.query(
      'SELECT stage FROM ingestion_status WHERE namespace = $1 AND "shortTitle" = $2',
      [namespace, shortTitle]
    );
    const current = rows[0];
    if (current && STAGE_ORDER.indexOf(current.stage) > STAGE_ORDER.indexOf(stage)) {
      return; // already further along than this report — don't regress it
    }

    await client.query(
      `INSERT INTO ingestion_status (id, namespace, "shortTitle", year, stage, "sectionsIngested", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, now(), now())
       ON CONFLICT (namespace, "shortTitle")
       DO UPDATE SET stage = EXCLUDED.stage, "sectionsIngested" = EXCLUDED."sectionsIngested", "updatedAt" = now()`,
      [crypto.randomUUID(), namespace, shortTitle, year, stage, sectionsIngested]
    );
  } catch (err) {
    console.warn(`  (status not reported: ${err.message})`);
  } finally {
    await client.end().catch(() => {});
  }
}

module.exports = { reportStatus, STAGE_ORDER };
