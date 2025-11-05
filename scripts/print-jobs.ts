#!/usr/bin/env tsx
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

async function getPrisma() {
  const mod = await import('../src/lib/prisma');
  return mod.prisma as any;
}

async function main() {
  const prisma = await getPrisma();
  const limit = Number(process.argv[2] || 10);
  const jobs = await prisma.jobLog.findMany({
    orderBy: { startedAt: 'desc' },
    take: limit,
  });
  console.log(`Showing ${jobs.length} most recent jobs:`);
  for (const j of jobs) {
    console.log({
      id: j.id,
      type: j.type,
      status: j.status,
      startedAt: j.startedAt,
      finishedAt: j.finishedAt,
      note: j.note,
    });
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
