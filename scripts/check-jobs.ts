import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking recent job logs...\n');

  // Get last 5 job logs
  const recentJobs = await prisma.jobLog.findMany({
    orderBy: { startedAt: 'desc' },
    take: 5,
    select: {
      id: true,
      type: true,
      status: true,
      startedAt: true,
      finishedAt: true,
      note: true,
      metadata: true,
    },
  });

  console.log('Recent Jobs:');
  console.log('============');
  recentJobs.forEach(job => {
    console.log(`\nID: ${job.id}`);
    console.log(`Type: ${job.type}`);
    console.log(`Status: ${job.status}`);
    console.log(`Started: ${job.startedAt.toISOString()}`);
    console.log(`Finished: ${job.finishedAt?.toISOString() || 'N/A'}`);
    console.log(`Note: ${job.note || 'N/A'}`);
    if (job.metadata) {
      try {
        const meta = JSON.parse(job.metadata as string);
        console.log(`Metadata: ${JSON.stringify(meta, null, 2)}`);
      } catch {}
    }
  });

  // Get sync state
  console.log('\n\nSync State:');
  console.log('===========');
  const syncState = await prisma.syncState.findUnique({
    where: { id: 'ocds_etenders_sa' },
  });

  if (syncState) {
    console.log(`Last Run: ${syncState.lastRunAt?.toISOString() || 'N/A'}`);
    console.log(`Last Success: ${syncState.lastSuccessAt?.toISOString() || 'N/A'}`);
    console.log(`Last Synced Date: ${syncState.lastSyncedDate?.toISOString() || 'N/A'}`);
  } else {
    console.log('No sync state found');
  }

  // Count today's tenders
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  console.log('\n\nTender Counts:');
  console.log('==============');

  const todayCount = await prisma.oCDSRelease.count({
    where: {
      publishedAt: {
        gte: today,
        lt: tomorrow,
      },
    },
  });

  console.log(`Today (${today.toISOString().slice(0, 10)}): ${todayCount} tenders`);

  // Last 7 days
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const dailyCounts = await prisma.$queryRaw<Array<{date: Date, count: bigint}>>`
    SELECT DATE("publishedAt") as date, COUNT(*) as count
    FROM "OCDSRelease"
    WHERE "publishedAt" >= ${lastWeek}
    GROUP BY DATE("publishedAt")
    ORDER BY date DESC
    LIMIT 7
  `;

  console.log('\nLast 7 days:');
  dailyCounts.forEach(row => {
    console.log(`  ${row.date.toISOString().slice(0, 10)}: ${row.count} tenders`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
