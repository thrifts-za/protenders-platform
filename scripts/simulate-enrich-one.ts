#!/usr/bin/env tsx
/**
 * Simulate enrichment for a single tender on a given date.
 * - Fetches 1 OCDS release for the date
 * - Derives tender number (same logic as performSync)
 * - Calls eTenders enrichment and prints the result
 *
 * Usage:
 *   npx tsx scripts/simulate-enrich-one.ts --date=2025-11-04
 */

import 'dotenv/config';
import { fetchReleases } from '../src/lib/sync/ocdsClient';
import { enrichTenderFromEtenders } from '../src/lib/enrichment/etendersEnricher';
import { RATE_LIMIT_DELAY_MS } from '../src/lib/enrichment/constants';

function parseArgs() {
  const args = process.argv.slice(2);
  const out: Record<string, string> = {};
  for (const a of args) {
    const m = a.match(/^--([^=]+)=(.*)$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

function deriveTenderNumber(tender: any): string | null {
  if (!tender) return null;
  if (typeof tender.title === 'string') {
    const title = tender.title.trim();
    const m = title.match(/\b(RFQ|RFP|RFB|RFT|RFI|RFA|RFPQ|RFBQ|EOI)[-_\s:/]*([A-Z0-9/\.-]{3,})/i);
    if (m) return (m[0] || title).replace(/\s+/g, '');
  }
  if (typeof tender.id === 'string' && tender.id.trim()) return tender.id.trim();
  return null;
}

async function main() {
  const args = parseArgs();
  const date = args.date || '2025-11-04';
  const size = Math.max(1, Math.min(100, parseInt(args.size || '10', 10))); // fetch up to 100 to scan for a match
  console.log(`🧪 Simulating enrichment for ${date}, scanning up to ${size} release(s)`);

  const pkg = await fetchReleases({ from: date, to: date, page: 1, pageSize: size });
  const releases = pkg.releases || [];
  if (!releases.length) {
    console.log('⚠️  No releases for that date.');
    return;
  }

  let chosen: any | null = null;
  let chosenTenderNo: string | null = null;
  let enriched: any | null = null;

  for (const rel of releases) {
    const tNo = deriveTenderNumber(rel?.tender);
    if (!tNo) continue;
    console.log(`→ Trying enrichment for ${tNo}...`);
    const e = await enrichTenderFromEtenders(tNo, RATE_LIMIT_DELAY_MS, {
      buyerName: rel?.buyer?.name || rel?.tender?.procuringEntity?.name,
      title: rel?.tender?.title,
      tenderIdHint: String(rel?.tender?.id || ''),
    });
    if (e) {
      chosen = rel;
      chosenTenderNo = tNo;
      enriched = e;
      break;
    }
  }

  if (!enriched || !chosen) {
    console.log('⚠️  Scanned releases but did not find an exact tender number match on eTenders for enrichment.');
    return;
  }

  console.log('📄 Chosen release:', {
    ocid: chosen.ocid,
    releaseId: chosen.id,
    title: chosen?.tender?.title,
    tenderId: chosen?.tender?.id,
    tenderNo: chosenTenderNo,
  });

  console.log('✅ Enrichment result:');
  console.log(JSON.stringify(enriched, null, 2));
}

main().catch((err) => {
  console.error('❌ Simulation failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
