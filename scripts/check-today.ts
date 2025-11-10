import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Check today's date (Nov 10, 2025)
  const today = new Date('2025-11-10T00:00:00Z');
  const tomorrow = new Date('2025-11-11T00:00:00Z');

  const todayCount = await prisma.oCDSRelease.count({
    where: {
      publishedAt: {
        gte: today,
        lt: tomorrow,
      },
    },
  });

  console.log(`\nTenders for Nov 10, 2025: ${todayCount}`);

  // Get sample tenders from today
  const sampleTenders = await prisma.oCDSRelease.findMany({
    where: {
      publishedAt: {
        gte: today,
        lt: tomorrow,
      },
    },
    select: {
      ocid: true,
      tenderTitle: true,
      buyerName: true,
      publishedAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  if (sampleTenders.length > 0) {
    console.log('\nRecent tenders from today:');
    sampleTenders.forEach(t => {
      console.log(`  - ${t.ocid}: ${t.tenderTitle?.slice(0, 50)}... (created: ${t.createdAt.toISOString()})`);
    });
  }

  // Check most recent DELTA_SYNC job
  const recentSync = await prisma.jobLog.findFirst({
    where: { type: 'DELTA_SYNC' },
    orderBy: { startedAt: 'desc' },
    select: {
      id: true,
      status: true,
      startedAt: true,
      finishedAt: true,
      note: true,
    },
  });

  if (recentSync) {
    console.log('\n\nMost Recent DELTA_SYNC Job:');
    console.log(`  Status: ${recentSync.status}`);
    console.log(`  Started: ${recentSync.startedAt.toISOString()}`);
    console.log(`  Finished: ${recentSync.finishedAt?.toISOString() || 'N/A'}`);
    console.log(`  Note: ${recentSync.note || 'N/A'}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
