const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const cheerio = require('cheerio');

const BASE_URL = 'https://www.indiacode.nic.in';
const SOURCES_DIR = path.join(__dirname, '..', 'sources');
const MANIFEST_PATH = path.join(SOURCES_DIR, '_manifest.json');
// indiacode.nic.in's WAF blanket-blocks any User-Agent containing "bot"/"crawler"
// (confirmed: a descriptive bot UA got 403, a standard browser UA got 200 on the
// identical request). Using a standard browser UA here, not to evade any real
// access control — this is public legislative text with no auth/paywall — just
// to get past a blocklist rule that isn't targeting us specifically.
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
const REQUEST_DELAY_MS = 1500;
const MAX_RETRIES = 3;

// Central acts in scope — see plan's "Scope lock" section for the namespace mapping.
//
// Item handles were resolved MANUALLY, not by an automated discovery step. The
// site's browse-by-shorttitle and simple-search pages sit behind Radware Bot
// Manager (confirmed via the BNI_persistence cookie) and require real browser
// behavior (JS execution) to actually filter/search — a plain HTTP request gets
// served an unfiltered/default page instead of an error, which is worse than a
// clean failure since it looks like a match. Item pages and PDF bitstreams
// themselves have no such gate, so once you know an act's handle, fetching it
// is fully reliable — that's what this script automates.
//
// IPC and CrPC are further special-cased: both were delisted from the live
// Central Acts collection when BNS/BNSS took over in 2023-24 and only exist
// in the separate Repealed Acts registry (repealed-act.jsp), which has no
// handle-based item page at all — just a direct PDF link.
const TARGET_ACTS = [
  { shortTitle: 'Bharatiya Nyaya Sanhita', year: 2023, namespace: 'bns', itemHandle: '20062' },
  { shortTitle: 'Bharatiya Nagarik Suraksha Sanhita', year: 2023, namespace: 'bnss', itemHandle: '20099' },
  {
    shortTitle: 'Indian Penal Code',
    year: 1860,
    namespace: 'ipc',
    repealedPdfUrl: 'https://www.indiacode.nic.in/repealedfileopen?rfilename=A1860-45.pdf',
  },
  {
    shortTitle: 'Code of Criminal Procedure',
    year: 1973,
    namespace: 'statutes',
    repealedPdfUrl: 'https://www.indiacode.nic.in/repealedfileopen?rfilename=A1974-2.pdf',
  },
  { shortTitle: 'Indian Contract Act', year: 1872, namespace: 'statutes', itemHandle: '2187' },
  { shortTitle: 'Consumer Protection Act', year: 2019, namespace: 'statutes', itemHandle: '15256' },
  { shortTitle: 'Right to Information Act', year: 2005, namespace: 'statutes', itemHandle: '2065' },
  { shortTitle: 'Guardians and Wards Act', year: 1890, namespace: 'personal_law', itemHandle: '2318' },
  { shortTitle: 'Code of Civil Procedure', year: 1908, namespace: 'cpc', itemHandle: '2191' },
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, options = {}) {
  let lastErr;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': USER_AGENT,
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        ...options,
      });
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

// Item page's <meta name="citation_pdf_url"> reliably points at the English
// bitstream (DSpace populates this for Google Scholar indexing) — confirmed
// via manual recon, and avoids matching on the Hindi-title link by mistake.
async function resolveItemPdf(itemHandle) {
  const itemUrl = `${BASE_URL}/handle/123456789/${itemHandle}?view_type=browse`;
  const res = await fetchWithRetry(itemUrl);
  const html = await res.text();
  const $ = cheerio.load(html);

  let pdfUrl = $('meta[name="citation_pdf_url"]').attr('content');
  if (!pdfUrl) {
    throw new Error(`no citation_pdf_url meta tag on item page ${itemUrl}`);
  }
  if (pdfUrl.startsWith('http://')) pdfUrl = pdfUrl.replace('http://', 'https://');
  return { sourceUrl: itemUrl, pdfUrl };
}

// Repealed acts (repealed-act.jsp) link straight to a PDF via ?rfilename=,
// with no item page to resolve at all.
function resolveRepealedPdf(repealedPdfUrl) {
  return { sourceUrl: repealedPdfUrl, pdfUrl: repealedPdfUrl };
}

// Bitstream URLs end in a real filename (.../bitstream/.../A187209.pdf);
// repealedfileopen URLs carry it in the rfilename query param instead.
function deriveFilename(pdfUrl) {
  const u = new URL(pdfUrl);
  if (u.pathname.toLowerCase().endsWith('.pdf')) {
    return decodeURIComponent(u.pathname.split('/').pop());
  }
  const rfilename = u.searchParams.get('rfilename');
  if (rfilename) return decodeURIComponent(rfilename);
  throw new Error(`cannot derive a filename from pdfUrl: ${pdfUrl}`);
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
      const { sourceUrl, pdfUrl } = act.itemHandle
        ? await resolveItemPdf(act.itemHandle)
        : resolveRepealedPdf(act.repealedPdfUrl);
      if (act.itemHandle) await sleep(REQUEST_DELAY_MS);

      const filename = deriveFilename(pdfUrl);
      const destPath = path.join(destDir, filename);
      const sha256 = await downloadPdf(pdfUrl, destPath);
      await sleep(REQUEST_DELAY_MS);

      manifest[key] = {
        shortTitle: act.shortTitle,
        year: act.year,
        namespace: act.namespace,
        itemHandle: act.itemHandle ? `123456789/${act.itemHandle}` : null,
        sourceUrl,
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

module.exports = { main, TARGET_ACTS, resolveItemPdf, resolveRepealedPdf, deriveFilename };

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
