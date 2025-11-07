#!/usr/bin/env tsx
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

async function getPrisma() {
  const mod = await import('../src/lib/prisma');
  return (mod as any).prisma as any;
}

function parseArgs(){
  const args = process.argv.slice(2);
  const out: Record<string,string> = {};
  for(const a of args){ const m=a.match(/^--([^=]+)=(.*)$/); if(m) out[m[1]]=m[2]; }
  return out;
}

async function main(){
  const prisma = await getPrisma();
  const { ocid='' } = parseArgs();
  if(!ocid){ console.error('Usage: npx tsx scripts/inspect-raw-json.ts --ocid=ocds-...'); process.exit(1); }
  const r = await prisma.oCDSRelease.findFirst({ where: { ocid }, orderBy: { date: 'desc' } });
  if(!r){ console.log('not found'); return; }
  const raw = JSON.parse(r.json);
  console.log('tender.id:', raw?.tender?.id);
  console.log('tender.title:', raw?.tender?.title);
  console.log('buyer:', raw?.buyer?.name || raw?.tender?.procuringEntity?.name);
}

main().catch((e)=>{ console.error(e); process.exit(1); });

