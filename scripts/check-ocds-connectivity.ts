#!/usr/bin/env tsx
/**
 * Quick connectivity check to the OCDS API via our client
 * Usage: npx tsx scripts/check-ocds-connectivity.ts --date=YYYY-MM-DD --size=1
 */

import 'dotenv/config';
import { fetchReleases } from '../src/lib/sync/ocdsClient';

function parseArgs() {
  const args = process.argv.slice(2);
  const out: Record<string, string> = {};
  for (const a of args) {
    const m = a.match(/^--([^=]+)=(.*)$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

async function main() {
  const args = parseArgs();
  const date = args.date || '2025-11-04';
  const size = Math.max(1, Math.min(15000, parseInt(args.size || '1', 10)));

  console.log(`🔎 Checking OCDS connectivity for ${date} (PageSize=${size})...`);
  const t0 = Date.now();
  const pkg = await fetchReleases({ from: date, to: date, page: 1, pageSize: size });
  const t1 = Date.now();

  const releases = pkg.releases || [];
  console.log(`✅ HTTP OK. Received ${releases.length} release(s) in ${t1 - t0}ms.`);

  if (releases.length > 0) {
    const r = releases[0] as any;
    console.log('— First release summary —');
    console.log(`  ocid: ${r.ocid}`);
    console.log(`  releaseId: ${r.id}`);
    console.log(`  date: ${r.date}`);
    console.log(`  title: ${r?.tender?.title || 'N/A'}`);
    console.log(`  buyer: ${r?.buyer?.name || r?.tender?.procuringEntity?.name || 'N/A'}`);
    console.log(`  closing: ${r?.tender?.tenderPeriod?.endDate || 'N/A'}`);
  }
}

main().catch((err) => {
  console.error('❌ Connectivity check failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});

