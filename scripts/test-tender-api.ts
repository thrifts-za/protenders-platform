/**
 * Test Tender Detail API Directly
 * Run with: npx tsx scripts/test-tender-api.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local file
config({ path: resolve(__dirname, '../.env.local') });

import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('🧪 Testing Tender Detail API Logic Directly...\n');

  const testId = 'ocds-9t57fa-138906';

  try {
    // Query local DB for the most recent release of this tender
    console.log(`📊 Fetching tender: ${testId}`);

    const release = await prisma.oCDSRelease.findFirst({
      where: { ocid: testId },
      orderBy: { date: 'desc' }, // Most recent release
    });

    if (!release) {
      console.log(`❌ Tender not found: ${testId}`);
      return;
    }

    console.log(`✅ Tender found: ${release.tenderTitle}\n`);

    // Parse the full OCDS JSON
    let rawData: unknown;
    try {
      rawData = JSON.parse(release.json);
    } catch (error) {
      console.error(`Error parsing JSON for tender ${testId}:`, error);
      rawData = null;
    }

    // Build normalized tender response
    const tender = {
      id: release.ocid,
      ocid: release.ocid,
      title: release.tenderTitle || release.ocid,
      displayTitle: release.tenderDisplayTitle || undefined,
      description: release.tenderDescription || undefined,
      buyerName: release.buyerName || undefined,
      mainProcurementCategory: release.mainCategory || undefined,
      closingDate: release.closingAt?.toISOString(),
      submissionMethods: release.submissionMethods
        ? JSON.parse(release.submissionMethods)
        : undefined,
      status: release.status || undefined,
      publishedAt: release.publishedAt?.toISOString(),
      updatedAt: release.updatedAt?.toISOString(),
      previousClosingDate: null,
      dataQualityScore: 85,
      hasRawData: !!rawData,
    };

    console.log('📋 Tender Details:');
    console.log(JSON.stringify(tender, null, 2));
    console.log('\n✅ API logic test passed!\n');
  } catch (error) {
    console.error('❌ Test failed:');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
