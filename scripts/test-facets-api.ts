/**
 * Test Facets API Directly
 * Run with: npx tsx scripts/test-facets-api.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local file
config({ path: resolve(__dirname, '../.env.local') });

import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('>ê Testing Facets API Logic Directly...\n');

  try {
    const startTime = Date.now();

    // Test category facets
    console.log('=Ê Fetching category facets...');
    const categories = await prisma.oCDSRelease.groupBy({
      by: ['mainCategory'],
      where: {
        mainCategory: { not: null },
      },
      _count: {
        mainCategory: true,
      },
      orderBy: {
        _count: {
          mainCategory: 'desc',
        },
      },
      take: 10,
    });

    console.log(` Found ${categories.length} categories:`);
    categories.forEach((cat, idx) => {
      console.log(`   ${idx + 1}. ${cat.mainCategory}: ${cat._count.mainCategory} tenders`);
    });
    console.log();

    // Test buyer facets
    console.log('=Ê Fetching buyer facets...');
    const buyers = await prisma.oCDSRelease.groupBy({
      by: ['buyerName'],
      where: {
        buyerName: { not: null },
      },
      _count: {
        buyerName: true,
      },
      orderBy: {
        _count: {
          buyerName: 'desc',
        },
      },
      take: 10,
    });

    console.log(` Found ${buyers.length} top buyers:`);
    buyers.forEach((buyer, idx) => {
      console.log(`   ${idx + 1}. ${buyer.buyerName}: ${buyer._count.buyerName} tenders`);
    });
    console.log();

    // Test status facets
    console.log('=Ê Fetching status facets...');
    const statuses = await prisma.oCDSRelease.groupBy({
      by: ['status'],
      where: {
        status: { not: null },
      },
      _count: {
        status: true,
      },
      orderBy: {
        _count: {
          status: 'desc',
        },
      },
    });

    console.log(` Found ${statuses.length} statuses:`);
    statuses.forEach((status, idx) => {
      console.log(`   ${idx + 1}. ${status.status}: ${status._count.status} tenders`);
    });
    console.log();

    // Test closing date range facets
    console.log('=Ê Fetching closing date range facets...');
    const now = new Date();
    const in7Days = new Date(now);
    in7Days.setDate(in7Days.getDate() + 7);

    const closingSoonCount = await prisma.oCDSRelease.count({
      where: {
        closingAt: {
          gte: now,
          lte: in7Days,
        },
      },
    });

    console.log(` Tenders closing in next 7 days: ${closingSoonCount}`);
    console.log();

    const duration = Date.now() - startTime;
    console.log(` All facet tests passed in ${duration}ms!\n`);
  } catch (error) {
    console.error('L Test failed:');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
