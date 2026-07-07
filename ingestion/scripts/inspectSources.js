const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const SOURCES_DIR = path.join(__dirname, '..', 'sources');

async function inspectFile(filePath) {
  const buf = fs.readFileSync(filePath);
  const data = await pdf(buf);
  const firstPageText = data.text.slice(0, 200).replace(/\s+/g, ' ').trim();
  const hasText = firstPageText.length > 0;
  return {
    filename: path.basename(filePath),
    sizeBytes: buf.length,
    pages: data.numpages,
    hasText,
    sample: firstPageText,
  };
}

async function main() {
  const namespaces = fs.readdirSync(SOURCES_DIR).filter((f) =>
    fs.statSync(path.join(SOURCES_DIR, f)).isDirectory()
  );

  const flagged = [];

  for (const ns of namespaces) {
    const dir = path.join(SOURCES_DIR, ns);
    const files = fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.pdf'));
    if (files.length === 0) continue;

    console.log(`\n=== namespace: ${ns} (${files.length} files) ===`);
    for (const f of files) {
      const info = await inspectFile(path.join(dir, f));
      console.log(`\n${info.filename}`);
      console.log(`  size: ${info.sizeBytes} bytes | pages: ${info.pages}`);
      console.log(`  text sample: "${info.sample}"`);
      if (!info.hasText) {
        console.log('  FLAGGED: no extractable text — likely scanned image, needs OCR');
        flagged.push(info.filename);
      }
    }
  }

  console.log('\n--- summary ---');
  if (flagged.length === 0) {
    console.log('All PDFs returned readable text. No OCR needed.');
  } else {
    console.log('Flagged (no extractable text, needs OCR):', flagged.join(', '));
  }
}

main();
