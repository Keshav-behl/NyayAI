const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const SOURCES_DIR = path.join(__dirname, '..', 'sources');
const OUTPUT_DIR = path.join(__dirname, '..', 'output');

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function deriveActSlug(rawText, fallbackFilename) {
  const lines = rawText.split('\n').map((l) => l.trim());
  const titleLine = lines.find((l) => /^THE .+ ACT,?\s*\d{4}/i.test(l));
  if (titleLine) {
    const match = titleLine.match(/^(THE .+ ACT,?\s*\d{4})/i);
    return slugify(match[1]);
  }
  return slugify(path.basename(fallbackFilename, path.extname(fallbackFilename)));
}

function cleanText(rawText) {
  const lines = rawText.split('\n');

  const freq = {};
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    freq[t] = (freq[t] || 0) + 1;
  }

  // Lines that repeat verbatim across the document (running headers/footers)
  const repeatedLines = new Set(
    Object.entries(freq)
      .filter(([line, count]) => count >= 2 && line.length < 100 && !/^\d+[.)]\s/.test(line))
      .map(([line]) => line)
  );

  const cleanedLines = lines.filter((line) => {
    const t = line.trim();
    if (!t) return true; // keep blank lines, collapsed later
    if (/^\d+$/.test(t)) return false; // standalone page-number line
    if (/^[_\-—]{3,}$/.test(t)) return false; // decorative separator
    if (/THE GAZETTE OF INDIA/i.test(t)) return false;
    if (/^MINISTRY OF/i.test(t)) return false;
    if (repeatedLines.has(t)) return false;
    return true;
  });

  let text = cleanedLines.join('\n');

  // Rejoin words hyphenated across a line break, e.g. "guard-\nian" -> "guardian"
  text = text.replace(/(\w+)-\n(\w+)/g, '$1$2');

  // Collapse 3+ consecutive newlines into 2
  text = text.replace(/\n{3,}/g, '\n\n');

  return text.trim();
}

async function extractPdf(filePath) {
  const buf = fs.readFileSync(filePath);
  const data = await pdf(buf);
  const slug = deriveActSlug(data.text, filePath);
  const cleaned = cleanText(data.text);
  return { slug, cleaned, pages: data.numpages };
}

function findPdfs(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findPdfs(full));
    } else if (entry.name.toLowerCase().endsWith('.pdf')) {
      results.push(full);
    }
  }
  return results;
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const pdfFiles = findPdfs(SOURCES_DIR);
  console.log(`Found ${pdfFiles.length} PDFs under ${SOURCES_DIR}\n`);

  for (const filePath of pdfFiles) {
    const { slug, cleaned, pages } = await extractPdf(filePath);
    const outPath = path.join(OUTPUT_DIR, `${slug}_raw.txt`);
    fs.writeFileSync(outPath, cleaned, 'utf-8');

    const mid = Math.floor(cleaned.length / 2);
    const sample = cleaned.slice(mid, mid + 500);

    console.log(`=== ${path.basename(filePath)} -> ${slug}_raw.txt (${pages} pages) ===`);
    console.log(sample.replace(/\n/g, ' | '));
    console.log();
  }
}

module.exports = { extractPdf, cleanText, deriveActSlug };

if (require.main === module) {
  main();
}
