/**
 * Fix Stuck Enrichment Job
 * Marks long-running jobs as FAILED if they've exceeded timeout
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixStuckJobs() {
  console.log('🔍 Looking for stuck RUNNING jobs...');

  // Find jobs that have been running for more than 10 minutes (way past the 5-minute timeout)
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

  const stuckJobs = await prisma.jobLog.findMany({
    where: {
      status: 'RUNNING',
      startedAt: {
        lt: tenMinutesAgo
      }
    },
    orderBy: {
      startedAt: 'desc'
    }
  });

  console.log(`Found ${stuckJobs.length} stuck job(s)`);

  for (const job of stuckJobs) {
    const runningFor = Math.floor((Date.now() - job.startedAt.getTime()) / 1000 / 60);
    console.log(`\n📋 Job ${job.id}:`);
    console.log(`   Type: ${job.type}`);
    console.log(`   Started: ${job.startedAt.toISOString()}`);
    console.log(`   Running for: ${runningFor} minutes`);

    // Update to FAILED
    await prisma.jobLog.update({
      where: { id: job.id },
      data: {
        status: 'FAILED',
        finishedAt: new Date(),
        note: `Job timed out after running for ${runningFor} minutes. Marked as failed by cleanup script.`
      }
    });

    console.log(`   ✅ Marked as FAILED`);
  }

  console.log(`\n✨ Done! Updated ${stuckJobs.length} job(s)`);
}

fixStuckJobs()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
