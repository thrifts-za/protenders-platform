#!/usr/bin/env tsx
/**
 * Run a small, DB-writing enrichment pass for a specific date.
 * - Enables enrichment via env
 * - Calls performSync with constrained pageSize and batchPages
 *
 * Usage:
 *   npx tsx scripts/run-small-enrichment.ts --date=2025-11-04 --limit=5
 */

import dotenv from 'dotenv';
// Load .env.local first (Next-style), then fallback to .env
dotenv.config({ path: '.env.local' });
dotenv.config();

function parseArgs() {
  const args = process.argv.slice(2);
  const out: Record<string, string> = {};
  for (const a of args) { const m = a.match(/^--([^=]+)=(.*)$/); if (m) out[m[1]] = m[2]; }
  return out;
}

async function main() {
  const { date = '2025-11-04', limit = '5' } = parseArgs();
  const max = Math.max(1, Math.min(50, parseInt(limit, 10)));

  // Temporarily enable enrichment and cap per run
  const origEnable = process.env.ENABLE_ENRICHMENT;
  const origMax = process.env.MAX_ENRICHMENT_PER_RUN;
  process.env.ENABLE_ENRICHMENT = 'true';
  process.env.MAX_ENRICHMENT_PER_RUN = String(max);

  console.log(`🚀 Running small enrichment pass for ${date} (limit=${max})`);

  try {
    const { performSync } = await import('../src/app/api/cron/sync/route');
    const res = await performSync({
      mode: 'daily',
      fromParam: date,
      toParam: date,
      windowDays: 1,
      batchPages: 1,
      pageSize: 200, // moderate page size
    });
    console.log('✅ Done:', res);
  } finally {
    // restore env
    if (origEnable !== undefined) process.env.ENABLE_ENRICHMENT = origEnable; else delete process.env.ENABLE_ENRICHMENT;
    if (origMax !== undefined) process.env.MAX_ENRICHMENT_PER_RUN = origMax; else delete process.env.MAX_ENRICHMENT_PER_RUN;
  }
}

main().catch((e) => { console.error('❌ Enrichment pass failed:', e instanceof Error ? e.message : e); process.exit(1); });
