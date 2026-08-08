const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// The 9 scope-locked central acts (see the ingestion plan's "Scope lock"
// section) that define MVP completeness. Mirrors ingestion/scripts/
// scrapeIndiaCode.js's TARGET_ACTS — kept as a separate static list rather
// than a shared import since backend and ingestion are separate packages
// and this list is fixed for the MVP scope.
const TARGET_ACTS = [
  { shortTitle: 'Bharatiya Nyaya Sanhita', year: 2023, namespace: 'bns' },
  { shortTitle: 'Bharatiya Nagarik Suraksha Sanhita', year: 2023, namespace: 'bnss' },
  { shortTitle: 'Indian Penal Code', year: 1860, namespace: 'ipc' },
  { shortTitle: 'Code of Criminal Procedure', year: 1973, namespace: 'statutes' },
  { shortTitle: 'Indian Contract Act', year: 1872, namespace: 'statutes' },
  { shortTitle: 'Consumer Protection Act', year: 2019, namespace: 'statutes' },
  { shortTitle: 'Right to Information Act', year: 2005, namespace: 'statutes' },
  { shortTitle: 'Guardians and Wards Act', year: 1890, namespace: 'personal_law' },
  { shortTitle: 'Code of Civil Procedure', year: 1908, namespace: 'cpc' },
];

async function main() {
  for (const act of TARGET_ACTS) {
    const row = await prisma.ingestionStatus.upsert({
      where: { namespace_shortTitle: { namespace: act.namespace, shortTitle: act.shortTitle } },
      update: {},
      create: { namespace: act.namespace, shortTitle: act.shortTitle, year: act.year },
    });
    console.log(`  ${row.shortTitle} (${row.namespace}): ${row.stage}`);
  }
  console.log(`Seeded/verified ${TARGET_ACTS.length} ingestion_status rows.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
