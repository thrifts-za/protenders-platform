#!/usr/bin/env tsx
import 'dotenv/config';
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

async function main() {
  const { tno } = parseArgs();
  if (!tno) {
    console.error('Usage: npx tsx scripts/enrich-by-tender-no.ts --tno="RFQ/410/2025"');
    process.exit(1);
  }
  const result = await enrichTenderFromEtenders(tno, RATE_LIMIT_DELAY_MS);
  console.log('Enrichment:', result);
}

main().catch((e) => { console.error(e); process.exit(1); });

