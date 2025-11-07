#!/usr/bin/env tsx
/**
 * All-time enrichment backfill (long-running CLI)
 * - Iterates year-by-year from earliest release date to today
 * - For each year, processes up to --limit missing rows per pass
 * - Repeats passes until no updates are made (or cancel flag is set)
 * - Safe to rerun; only selects rows still missing enrichment
 *
 * Usage examples:
 *   npx tsx scripts/backfill-enrichment-all.ts --limit=500 --delay=300
 *   npx tsx scripts/backfill-enrichment-all.ts --from=2023-01-01 --to=2025-12-31 --limit=1000
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

function parseArgs() {
  const out: Record<string, string> = {};
  for (const a of process.argv.slice(2)) {
    const m = a.match(/^--([^=]+)=(.*)$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

function startOfYear(y: number) { return new Date(Date.UTC(y, 0, 1, 0, 0, 0)); }
function endOfYear(y: number) { return new Date(Date.UTC(y, 11, 31, 23, 59, 59)); }
function fmt(d: Date) { return d.toISOString().slice(0, 10); }

async function main() {
  const args = parseArgs();
  // Load modules AFTER env is configured to ensure DATABASE_URL is available
  const [{ prisma }, constants, backfill] = await Promise.all([
    import('../src/lib/prisma'),
    import('../src/lib/enrichment/constants'),
    import('../src/lib/enrichment/backfill'),
  ]);
  const RATE_LIMIT_DELAY_MS: number = (constants as any).RATE_LIMIT_DELAY_MS || 300;
  const backfillEnrichment: any = (backfill as any).backfillEnrichment;

  const limit = Math.max(1, Math.min(5000, parseInt(args.limit || '1000', 10)));
  const delayMs = Math.max(0, parseInt(args.delay || String(RATE_LIMIT_DELAY_MS), 10));
  const fromArg = args.from;
  const toArg = args.to;

  // Determine overall range
  let rangeStart: Date;
  let rangeEnd: Date;
  if (fromArg && toArg) {
    rangeStart = new Date(`${fromArg}T00:00:00Z`);
    rangeEnd = new Date(`${toArg}T23:59:59Z`);
  } else {
    const min = await prisma.oCDSRelease.aggregate({ _min: { date: true } });
    rangeStart = min._min.date ? new Date(min._min.date) : new Date('2021-01-01T00:00:00Z');
    rangeEnd = new Date();
  }

  const startYear = rangeStart.getUTCFullYear();
  const endYear = rangeEnd.getUTCFullYear();
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

  console.log(`🚀 Starting all-time enrichment backfill`);
  console.log(`   Range: ${fmt(rangeStart)} → ${fmt(rangeEnd)} (${years.length} year(s))`);
  console.log(`   Batch limit: ${limit}, delay: ${delayMs}ms`);

  let pass = 1;
  while (true) {
    let passUpdated = 0;
    console.log(`\n▶︎ Pass ${pass} across ${years.length} year(s)`);
    for (const y of years) {
      const yFrom = new Date(Math.max(startOfYear(y).getTime(), rangeStart.getTime()));
      const yTo = new Date(Math.min(endOfYear(y).getTime(), rangeEnd.getTime()));
      if (yFrom > yTo) continue; // outside selected window

      const res = await backfillEnrichment({ from: fmt(yFrom), to: fmt(yTo), limit, delayMs });
      console.log(`  • ${y}: processed=${res.processed}, updated=${res.updated}, skipped=${res.skipped}, failures=${res.failures}`);
      passUpdated += res.updated;

      // Optional small pause between yearly windows to be friendly
      await new Promise((r) => setTimeout(r, 1000));
    }

    console.log(`⏱️  Pass ${pass} total updates: ${passUpdated}`);
    if (passUpdated === 0) {
      console.log(`✅ No further updates; all-time backfill complete (or remaining rows are not enrichable currently).`);
      break;
    }
    pass += 1;
  }

  await prisma.$disconnect();
}

main().catch((e) => { console.error('❌ Backfill failed:', e); process.exit(1); });
