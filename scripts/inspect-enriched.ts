#!/usr/bin/env tsx
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

async function getPrisma() {
  const mod = await import('../src/lib/prisma');
  return mod.prisma as any;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const out: Record<string, string> = {};
  for (const a of args) { const m = a.match(/^--([^=]+)=(.*)$/); if (m) out[m[1]] = m[2]; }
  return out;
}

async function main() {
  const prisma = await getPrisma();
  const { date = '2025-11-04', limit = '10' } = parseArgs();
  const start = new Date(`${date}T00:00:00Z`);
  const end = new Date(`${date}T23:59:59Z`);

  const rows = await prisma.oCDSRelease.findMany({
    where: {
      date: { gte: start, lte: end },
      OR: [
        { province: { not: null } },
        { contactEmail: { not: null } },
        { briefingDate: { not: null } },
      ],
    },
    orderBy: { date: 'asc' },
    take: Number(limit),
    select: {
      ocid: true,
      releaseId: true,
      date: true,
      buyerName: true,
      tenderTitle: true,
      province: true,
      contactEmail: true,
      contactPerson: true,
      briefingDate: true,
      briefingVenue: true,
      tenderType: true,
    },
  });

  console.log(`Found ${rows.length} enriched rows for ${date}`);
  for (const r of rows) {
    console.log(r);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });

