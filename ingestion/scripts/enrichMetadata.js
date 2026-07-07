const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'output');

// Hardcoded per-act religion mapping. Extended beyond the original runbook list
// to cover Hindu Disposition of Property Act, 1916, which wasn't anticipated
// there but is unambiguously a Hindu personal-law act.
const RELIGION_MAP = {
  'The Hindu Marriage Act, 1955': 'hindu',
  'The Hindu Succession Act, 1956': 'hindu',
  'The Hindu Adoptions and Maintenance Act, 1956': 'hindu',
  'The Hindu Minority and Guardianship Act, 1956': 'hindu',
  'The Hindu Disposition of Property Act, 1916': 'hindu',
  'The Family Courts Act, 1984': 'secular',
};

const SUBTOPIC_KEYWORDS = {
  marriage: /\bmarriage\b|\bmarry\b|\bmarried\b|\bmatrimonial\b|\bsolemni[sz]/i,
  divorce: /\bdivorce\b|\bjudicial separation\b|\bdissolution of marriage\b/i,
  maintenance: /\bmaintenance\b|\balimony\b/i,
  custody: /\bcustody\b/i,
  adoption: /\badopt/i,
  succession: /\bsuccession\b|\bintestate\b|\binheritance\b|\binherit\b|\bheirs?\b|\btestamentary\b/i,
  guardianship: /\bguardian/i,
};

const MONTHS = {
  january: '01', february: '02', march: '03', april: '04', may: '05', june: '06',
  july: '07', august: '08', september: '09', october: '10', november: '11', december: '12',
};

function extractEffectiveDate(rawText) {
  const match = rawText.match(/\[(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]+),?\s+(\d{4})\.?\]/);
  if (!match) return null;
  const [, day, monthName, year] = match;
  const month = MONTHS[monthName.toLowerCase()];
  if (!month) return null;
  return `${year}-${month}-${day.padStart(2, '0')}`;
}

function matchSubtopics(text) {
  return Object.entries(SUBTOPIC_KEYWORDS)
    .filter(([, re]) => re.test(text))
    .map(([subtopic]) => subtopic);
}

function enrichChunk(chunk, effectiveDate) {
  const religion = RELIGION_MAP[chunk.act];
  if (!religion) {
    throw new Error(`No religion mapping for act "${chunk.act}" — add it to RELIGION_MAP`);
  }
  const subtopic = matchSubtopics(chunk.text);

  return {
    act: chunk.act,
    section_number: chunk.section_number,
    religion,
    subtopic,
    jurisdiction: 'India',
    effective_date: effectiveDate,
    superseded_by: null,
    citation: `${chunk.act}, ${chunk.section_number}`,
    tags: subtopic,
    text: chunk.text,
  };
}

function main() {
  const chunkFiles = fs.readdirSync(OUTPUT_DIR).filter((f) => f.endsWith('_chunks.json'));

  for (const file of chunkFiles) {
    const slug = file.replace(/_chunks\.json$/, '');
    const chunks = JSON.parse(fs.readFileSync(path.join(OUTPUT_DIR, file), 'utf-8'));
    const rawText = fs.readFileSync(path.join(OUTPUT_DIR, `${slug}_raw.txt`), 'utf-8');
    const effectiveDate = extractEffectiveDate(rawText);

    if (!effectiveDate) {
      console.log(`WARNING: could not extract effective_date for ${slug}, leaving null`);
    }

    const enriched = chunks.map((c) => enrichChunk(c, effectiveDate));
    fs.writeFileSync(
      path.join(OUTPUT_DIR, `${slug}_enriched.json`),
      JSON.stringify(enriched, null, 2),
      'utf-8'
    );

    console.log(`\n=== ${enriched[0].act} (effective_date: ${effectiveDate}) ===`);
    console.log(JSON.stringify(enriched[0], null, 2));
  }
}

module.exports = { enrichChunk, extractEffectiveDate, matchSubtopics, RELIGION_MAP };

if (require.main === module) {
  main();
}
