#!/usr/bin/env tsx
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

async function getPrisma() {
  const mod = await import('../src/lib/prisma');
  return (mod as any).prisma as any;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const out: Record<string, string> = {};
  for (const a of args) { const m = a.match(/^--([^=]+)=(.*)$/); if (m) out[m[1]] = m[2]; }
  return out;
}

async function main() {
  const prisma = await getPrisma();
  const { ocid = '' } = parseArgs();
  if (!ocid) { console.error('Usage: npx tsx scripts/inspect-ocid.ts --ocid=ocds-...'); process.exit(1); }
  const rows = await prisma.oCDSRelease.findMany({ where: { ocid }, orderBy: { date: 'desc' }, take: 3 });
  console.log('count', rows.length);
  for (const r of rows) {
    console.log({ ocid: r.ocid, date: r.date, buyerName: r.buyerName, tenderTitle: r.tenderTitle, province: r.province, contactEmail: r.contactEmail, tenderType: r.tenderType, briefingDate: r.briefingDate, briefingVenue: r.briefingVenue });
  }
}

main().catch((e)=>{ console.error(e); process.exit(1); });

