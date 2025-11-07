#!/usr/bin/env tsx
import 'dotenv/config';
import { ETENDERS_API_BASE } from '../src/lib/enrichment/constants';

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
  const { q = 'RFQ/410/2025' } = parseArgs();
  const params = new URLSearchParams({ draw: '1', start: '0', length: '20', status: '1', 'search[value]': q });
  const url = `${ETENDERS_API_BASE}?${params.toString()}`;
  console.log('GET', url);
  const res = await fetch(url, { headers: { accept: 'application/json' } });
  console.log('status', res.status);
  const json = await res.json();
  const data = Array.isArray(json.data) ? json.data : [];
  console.log(`rows: ${data.length}`);
  for (const r of data.slice(0, 10)) {
    console.log({ tender_No: r.tender_No, organ_of_State: r.organ_of_State, id: r.id });
  }
}

main().catch((e) => { console.error(e); process.exit(1); });

