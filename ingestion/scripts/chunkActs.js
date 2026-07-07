const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'output');

// Footnote/amendment citation lines share the "<digit>. <text>" shape of a real
// section heading (e.g. "1. Ins. by Act 45 of 1962, s. 4 (w.e.f. 29-11-1962)."),
// but always lead with one of these abbreviations. A real section heading never does.
const FOOTNOTE_LEAD_WORDS = /^(Ins|Subs|Subst|Om|Rep|Add|Cf|See|Vide)\b\.?/i;

// Marginal-note separator varies by act: em dash, horizontal bar, en dash, or a
// plain ASCII hyphen depending on how the source PDF was typeset.
const DASH_CLASS = '[-–—―−]';

// Heading text can wrap onto a second physical line before the period+dash
// appears (e.g. Hindu Gains of Learning Act s.3). Allow the heading capture to
// cross a newline, but never past what looks like the start of the *next*
// numbered heading — otherwise an omitted section with no body (e.g.
// "6. [Omitted.]." with no dash at all) would swallow the next real section.
// Some sections carry a leading "[" (amended/substituted section marker), and
// spacing after the number is inconsistent ("4.Overriding..." vs "4. Overriding...").
// Some heading lines carry incidental leading whitespace from the PDF layout.
const HEADING_RE = new RegExp(
  `^[ \\t]*\\[?(\\d{1,3}[A-Z]{0,2})\\.[ \\t]*(?!${FOOTNOTE_LEAD_WORDS.source})((?:(?!\\n[ \\t]*\\[?\\d{1,3}[A-Z]{0,2}\\.)[\\s\\S]){1,200}?)\\.\\s*${DASH_CLASS}\\s*`,
  'gm'
);

function slugToActName(slug) {
  const parts = slug.split('-');
  const smallWords = new Set(['of', 'and', 'the', 'in', 'to', 'for']);
  const titled = parts.map((w, i) => {
    if (/^\d+$/.test(w)) return w;
    if (i !== 0 && smallWords.has(w)) return w;
    return w.charAt(0).toUpperCase() + w.slice(1);
  });
  const year = titled.pop();
  return `${titled.join(' ')}, ${year}`;
}

function chunkAct(text) {
  const matches = [...text.matchAll(HEADING_RE)];
  const chunks = [];

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const start = match.index;
    const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
    const sectionNumber = match[1];
    const chunkText = text.slice(start, end).trim();
    chunks.push({ section_number: sectionNumber, text: chunkText });
  }

  return chunks;
}

function wordCount(str) {
  return str.split(/\s+/).filter(Boolean).length;
}

function main() {
  const rawFiles = fs
    .readdirSync(OUTPUT_DIR)
    .filter((f) => f.endsWith('_raw.txt'));

  const summaryRows = [];
  const flags = [];

  for (const file of rawFiles) {
    const slug = file.replace(/_raw\.txt$/, '');
    const actName = slugToActName(slug);
    const text = fs.readFileSync(path.join(OUTPUT_DIR, file), 'utf-8');

    const rawChunks = chunkAct(text);
    const chunks = rawChunks.map((c) => ({ act: actName, section_number: c.section_number, text: c.text }));

    const outPath = path.join(OUTPUT_DIR, `${slug}_chunks.json`);
    fs.writeFileSync(outPath, JSON.stringify(chunks, null, 2), 'utf-8');

    if (chunks.length === 0) {
      summaryRows.push([actName, 0, '-', '-', '-']);
      flags.push(`${actName}: 0 chunks found — heading regex matched nothing, needs investigation`);
      continue;
    }

    const wordCounts = chunks.map((c) => wordCount(c.text));
    const avg = (wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length).toFixed(1);
    const minIdx = wordCounts.indexOf(Math.min(...wordCounts));
    const maxIdx = wordCounts.indexOf(Math.max(...wordCounts));
    const min = wordCounts[minIdx];
    const max = wordCounts[maxIdx];

    summaryRows.push([actName, chunks.length, avg, `${min} (s.${chunks[minIdx].section_number})`, `${max} (s.${chunks[maxIdx].section_number})`]);

    chunks.forEach((c, idx) => {
      const wc = wordCounts[idx];
      if (wc < 15) flags.push(`${actName} s.${c.section_number}: ${wc} words — possibly a mis-split (short cross-reference caught as its own section)`);
      if (wc > 2000) flags.push(`${actName} s.${c.section_number}: ${wc} words — possibly a failed split (heading not detected, merged with next sections)`);
    });
  }

  console.log('Act'.padEnd(45), 'Chunks'.padEnd(8), 'Avg words'.padEnd(11), 'Shortest'.padEnd(20), 'Longest');
  for (const row of summaryRows) {
    console.log(
      String(row[0]).padEnd(45),
      String(row[1]).padEnd(8),
      String(row[2]).padEnd(11),
      String(row[3]).padEnd(20),
      String(row[4])
    );
  }

  if (flags.length) {
    console.log('\n--- flagged chunks ---');
    flags.forEach((f) => console.log(' -', f));
  } else {
    console.log('\nNo chunks flagged.');
  }
}

module.exports = { chunkAct, slugToActName, wordCount };

if (require.main === module) {
  main();
}
