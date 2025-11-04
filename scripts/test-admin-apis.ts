/**
 * Test Admin APIs Directly
 * Run with: npx tsx scripts/test-admin-apis.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local file
config({ path: resolve(__dirname, '../.env.local') });

import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('>ê Testing Admin APIs Logic Directly...\n');

  try {
    const overallStart = Date.now();

    // Test 1: Admin Stats API Logic
    console.log('=Ê Testing Admin Stats API...');
    const statsStart = Date.now();

    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [totalReleases, uniqueOcids, recentActivity24h, recentActivity7d] =
      await Promise.all([
        prisma.oCDSRelease.count(),
        prisma.oCDSRelease.groupBy({ by: ['ocid'] }).then((g) => g.length),
        prisma.oCDSRelease.count({ where: { publishedAt: { gte: last24h } } }),
        prisma.oCDSRelease.count({ where: { publishedAt: { gte: last7d } } }),
      ]);

    const statsTime = Date.now() - statsStart;
    console.log(` Stats API tested in ${statsTime}ms:`);
    console.log(`   - Total releases: ${totalReleases}`);
    console.log(`   - Unique tenders: ${uniqueOcids}`);
    console.log(`   - Published last 24h: ${recentActivity24h}`);
    console.log(`   - Published last 7d: ${recentActivity7d}`);
    console.log();

    // Test 2: Admin Jobs API Logic
    console.log('=Ê Testing Admin Jobs API...');
    const jobsStart = Date.now();

    const [recentJobs, totalJobs, pendingJobs, runningJobs] =
      await Promise.all([
        prisma.jobLog.findMany({
          orderBy: { startedAt: 'desc' },
          take: 5,
          select: {
            id: true,
            type: true,
            status: true,
            startedAt: true,
            finishedAt: true,
          },
        }),
        prisma.jobLog.count(),
        prisma.jobLog.count({ where: { status: 'PENDING' } }),
        prisma.jobLog.count({ where: { status: 'RUNNING' } }),
      ]);

    const jobsTime = Date.now() - jobsStart;
    console.log(` Jobs API tested in ${jobsTime}ms:`);
    console.log(`   - Total jobs: ${totalJobs}`);
    console.log(`   - Pending: ${pendingJobs}`);
    console.log(`   - Running: ${runningJobs}`);
    console.log(`   - Recent jobs: ${recentJobs.length}`);
    if (recentJobs.length > 0) {
      console.log(`   - Latest job: ${recentJobs[0].type} (${recentJobs[0].status})`);
    }
    console.log();

    // Test 3: Admin Health API Logic
    console.log('=Ê Testing Admin Health API...');
    const healthStart = Date.now();

    const dbCheckStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbResponseTime = Date.now() - dbCheckStart;

    const memUsage = process.memoryUsage();
    const memoryPercentage = Math.round(
      (memUsage.heapUsed / memUsage.heapTotal) * 100
    );

    const healthTime = Date.now() - healthStart;
    console.log(` Health API tested in ${healthTime}ms:`);
    console.log(`   - Database: UP (${dbResponseTime}ms)`);
    console.log(`   - Memory: ${memoryPercentage}% used`);
    console.log(`   - Uptime: ${Math.round(process.uptime())}s`);
    console.log();

    const overallTime = Date.now() - overallStart;
    console.log(` All admin API tests passed in ${overallTime}ms!\n`);
  } catch (error) {
    console.error('L Test failed:');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
