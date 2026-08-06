const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const cheerio = require('cheerio');

const BASE_URL = 'https://www.indiacode.nic.in';
// Handle of the "Central Acts" collection — browse-by-shorttitle within it.
// Confirmed via manual recon: https://www.indiacode.nic.in/handle/123456789/1362/browse?type=shorttitle...
const CENTRAL_ACTS_HANDLE = '123456789/1362';
const SOURCES_DIR = path.join(__dirname, '..', 'sources');
const MANIFEST_PATH = path.join(SOURCES_DIR, '_manifest.json');
const USER_AGENT = 'NyayAI-LegalCorpusBot/1.0 (+https://nyayai.in; legal research corpus ingestion; contact: keshavbehl02@gmail.com)';
const REQUEST_DELAY_MS = 1500;
const MAX_RETRIES = 3;

// Central acts in scope — see plan's "Scope lock" section for the namespace mapping.
const TARGET_ACTS = [
  { shortTitle: 'Bharatiya Nyaya Sanhita', year: 2023, namespace: 'bns', startsWith: 'B' },
  { shortTitle: 'Bharatiya Nagarik Suraksha Sanhita', year: 2023, namespace: 'bnss', startsWith: 'B' },
  { shortTitle: 'Indian Penal Code', year: 1860, namespace: 'ipc', startsWith: 'I' },
  { shortTitle: 'Code of Criminal Procedure', year: 1973, namespace: 'statutes', startsWith: 'C' },
  { shortTitle: 'Indian Contract Act', year: 1872, namespace: 'statutes', startsWith: 'I' },
  { shortTitle: 'Consumer Protection Act', year: 2019, namespace: 'statutes', startsWith: 'C' },
  { shortTitle: 'Right to Information Act', year: 2005, namespace: 'statutes', startsWith: 'R' },
  { shortTitle: 'Guardians and Wards Act', year: 1890, namespace: 'personal_law', startsWith: 'G' },
  { shortTitle: 'Code of Civil Procedure', year: 1908, namespace: 'cpc', startsWith: 'C' },
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, options = {}) {
  let lastErr;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT }, ...options });
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return res;
    } catch (err) {
      lastErr = err;
      if (attempt === MAX_RETRIES) break;
      const backoffMs = 1000 * 2 ** attempt;
      console.warn(`  retry ${attempt}/${MAX_RETRIES} for ${url} after ${backoffMs}ms (${err.message})`);
      await sleep(backoffMs);
    }
  }
  throw lastErr;
}

// Browse-by-shorttitle listing for one starting letter. DSpace JSPUI browse
// params confirmed via manual recon (type/sort_by/order/rpp/etal/starts_with).
async function getBrowseListing(letter) {
  const url = `${BASE_URL}/handle/${CENTRAL_ACTS_HANDLE}/browse?type=shorttitle&sort_by=3&order=ASC&rpp=200&etal=-1&null=&starts_with=${encodeURIComponent(letter)}`;
  const res = await fetchWithRetry(url);
  const html = await res.text();
  const $ = cheerio.load(html);

  const items = [];
  $('a[href*="/handle/123456789/"]').each((_, el) => {
    const href = $(el).attr('href');
    const match = href.match(/\/handle\/123456789\/(\d+)/);
    const title = $(el).text().trim();
    if (match && title) items.push({ itemId: match[1], title, href });
  });
  return items;
}

function findActMatch(items, shortTitle) {
  const needle = shortTitle.toLowerCase();
  return items.find((it) => it.title.toLowerCase().includes(needle));
}

// Item page's <meta name="citation_pdf_url"> reliably points at the English
// bitstream (DSpace populates this for Google Scholar indexing) — confirmed
// via manual recon, and avoids matching on the Hindi-title link by mistake.
async function resolveItemPdf(itemId) {
  const itemUrl = `${BASE_URL}/handle/123456789/${itemId}?view_type=browse`;
  const res = await fetchWithRetry(itemUrl);
  const html = await res.text();
  const $ = cheerio.load(html);

  let pdfUrl = $('meta[name="citation_pdf_url"]').attr('content');
  if (!pdfUrl) {
    throw new Error(`no citation_pdf_url meta tag on item page ${itemUrl}`);
  }
  if (pdfUrl.startsWith('http://')) pdfUrl = pdfUrl.replace('http://', 'https://');
  return { itemUrl, pdfUrl };
}

async function downloadPdf(pdfUrl, destPath) {
  const res = await fetchWithRetry(pdfUrl);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(destPath, buf);
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function loadManifest() {
  if (fs.existsSync(MANIFEST_PATH)) {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  }
  return {};
}

function saveManifest(manifest) {
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf-8');
}

function manifestKey(act) {
  return `${act.namespace}:${act.shortTitle}`;
}

async function main() {
  const manifest = loadManifest();
  const browseCache = {};
  const results = { downloaded: [], skipped: [], failed: [] };

  for (const act of TARGET_ACTS) {
    const key = manifestKey(act);
    const destDir = path.join(SOURCES_DIR, act.namespace);
    fs.mkdirSync(destDir, { recursive: true });

    const existing = manifest[key];
    if (existing && fs.existsSync(path.join(destDir, existing.filename))) {
      console.log(`SKIP (already downloaded): ${act.shortTitle} -> ${act.namespace}/${existing.filename}`);
      results.skipped.push(act.shortTitle);
      continue;
    }

    console.log(`\n=== ${act.shortTitle}, ${act.year} (namespace: ${act.namespace}) ===`);
    try {
      if (!browseCache[act.startsWith]) {
        browseCache[act.startsWith] = await getBrowseListing(act.startsWith);
        await sleep(REQUEST_DELAY_MS);
      }

      const match = findActMatch(browseCache[act.startsWith], act.shortTitle);
      if (!match) {
        throw new Error(`not found in browse listing for letter "${act.startsWith}" — check short title text or starting letter`);
      }

      const { itemUrl, pdfUrl } = await resolveItemPdf(match.itemId);
      await sleep(REQUEST_DELAY_MS);

      const filename = decodeURIComponent(pdfUrl.split('/').pop());
      const destPath = path.join(destDir, filename);
      const sha256 = await downloadPdf(pdfUrl, destPath);
      await sleep(REQUEST_DELAY_MS);

      manifest[key] = {
        shortTitle: act.shortTitle,
        year: act.year,
        namespace: act.namespace,
        itemHandle: `123456789/${match.itemId}`,
        sourceUrl: itemUrl,
        pdfUrl,
        filename,
        downloadedAt: new Date().toISOString(),
        sha256,
      };
      saveManifest(manifest);

      console.log(`  OK -> ${act.namespace}/${filename}`);
      results.downloaded.push(act.shortTitle);
    } catch (err) {
      console.error(`  FAILED: ${err.message}`);
      results.failed.push({ act: act.shortTitle, reason: err.message });
    }
  }

  console.log('\n--- summary ---');
  console.log(`Downloaded: ${results.downloaded.length}/${TARGET_ACTS.length}`);
  if (results.skipped.length) console.log(`Skipped (already present): ${results.skipped.join(', ')}`);
  if (results.failed.length) {
    console.log('Failed:');
    results.failed.forEach((f) => console.log(`  - ${f.act}: ${f.reason}`));
  }
}

module.exports = { main, TARGET_ACTS, getBrowseListing, findActMatch, resolveItemPdf };

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
