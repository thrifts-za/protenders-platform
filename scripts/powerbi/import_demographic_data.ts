/**
 * Import Demographic Data into Database
 *
 * Imports all decoded PowerBI demographic data into Prisma/PostgreSQL database.
 *
 * Usage: npx tsx scripts/powerbi/import_demographic_data.ts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();
const DECODED_DIR = path.join(__dirname, 'decoded');
const IMPORT_BATCH = `powerbi_${new Date().toISOString()}`;

/**
 * Import PPPFA Categories
 */
async function importPPPFACategories() {
  console.log('\n[1/4] Importing PPPFA Categories...');

  const data = JSON.parse(
    fs.readFileSync(path.join(DECODED_DIR, 'pppfa_categories.json'), 'utf8')
  );

  const categoryMap: Record<string, { code: string; name: string; sortOrder: number }> = {
    'Black Owned': { code: 'BLACK_OWNED', name: 'Black Owned', sortOrder: 1 },
    'Women Owned': { code: 'WOMEN_OWNED', name: 'Women Owned', sortOrder: 2 },
    'Youth Owned': { code: 'YOUTH_OWNED', name: 'Youth Owned', sortOrder: 3 },
    'Disabled Owned': { code: 'DISABLED_OWNED', name: 'Disabled Owned', sortOrder: 4 },
    'Military Veteran Owned': { code: 'MILITARY_VETERAN_OWNED', name: 'Military Veteran Owned', sortOrder: 5 },
    'Rural Township Owned': { code: 'RURAL_TOWNSHIP_OWNED', name: 'Rural Township Owned', sortOrder: 6 },
  };

  let imported = 0;

  for (const row of data) {
    const categoryName = row.G0;
    const categoryInfo = categoryMap[categoryName];

    if (!categoryInfo) {
      console.warn(`Unknown category: ${categoryName}`);
      continue;
    }

    await prisma.pPPFACategory.upsert({
      where: { code: categoryInfo.code },
      update: {
        name: categoryInfo.name,
        sortOrder: categoryInfo.sortOrder,
        active: true,
      },
      create: {
        code: categoryInfo.code,
        name: categoryInfo.name,
        description: `PPPFA ${categoryInfo.name} category for procurement tracking`,
        sortOrder: categoryInfo.sortOrder,
        active: true,
      },
    });

    imported++;
  }

  console.log(`✓ Imported ${imported} PPPFA categories`);
  return imported;
}

/**
 * Import Demographic Spend Time-Series
 */
async function importDemographicTimeSeries() {
  console.log('\n[2/4] Importing Demographic Spend Time-Series...');

  const data = JSON.parse(
    fs.readFileSync(path.join(DECODED_DIR, 'demographic_timeseries.json'), 'utf8')
  );

  const monthMap: Record<number, { name: string; number: number }> = {
    0: { name: 'April', number: 4 },
    1: { name: 'May', number: 5 },
    2: { name: 'June', number: 6 },
    3: { name: 'July', number: 7 },
    4: { name: 'August', number: 8 },
    5: { name: 'September', number: 9 },
  };

  const fiscalYear = '2025/26';
  let imported = 0;

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const monthInfo = monthMap[i];

    if (!monthInfo || !row.C || row.C.length < 4) {
      console.warn(`Skipping invalid row ${i}`);
      continue;
    }

    const monthIndex = row.C[0];
    const blackSpend = parseFloat(row.C[1]);
    const womenSpend = parseFloat(row.C[2]);
    const youthSpend = parseFloat(row.C[3]);

    // Import Black Owned
    await prisma.demographicSpendTimeSeries.upsert({
      where: {
        fiscalYear_month_categoryCode: {
          fiscalYear,
          month: monthInfo.name,
          categoryCode: 'BLACK_OWNED',
        },
      },
      update: {
        spendAmount: blackSpend,
        monthNumber: monthInfo.number,
        importBatch: IMPORT_BATCH,
      },
      create: {
        fiscalYear,
        month: monthInfo.name,
        monthNumber: monthInfo.number,
        categoryCode: 'BLACK_OWNED',
        spendAmount: blackSpend,
        importBatch: IMPORT_BATCH,
      },
    });

    // Import Women Owned
    await prisma.demographicSpendTimeSeries.upsert({
      where: {
        fiscalYear_month_categoryCode: {
          fiscalYear,
          month: monthInfo.name,
          categoryCode: 'WOMEN_OWNED',
        },
      },
      update: {
        spendAmount: womenSpend,
        monthNumber: monthInfo.number,
        importBatch: IMPORT_BATCH,
      },
      create: {
        fiscalYear,
        month: monthInfo.name,
        monthNumber: monthInfo.number,
        categoryCode: 'WOMEN_OWNED',
        spendAmount: womenSpend,
        importBatch: IMPORT_BATCH,
      },
    });

    // Import Youth Owned
    await prisma.demographicSpendTimeSeries.upsert({
      where: {
        fiscalYear_month_categoryCode: {
          fiscalYear,
          month: monthInfo.name,
          categoryCode: 'YOUTH_OWNED',
        },
      },
      update: {
        spendAmount: youthSpend,
        monthNumber: monthInfo.number,
        importBatch: IMPORT_BATCH,
      },
      create: {
        fiscalYear,
        month: monthInfo.name,
        monthNumber: monthInfo.number,
        categoryCode: 'YOUTH_OWNED',
        spendAmount: youthSpend,
        importBatch: IMPORT_BATCH,
      },
    });

    imported += 3; // 3 categories per month
  }

  console.log(`✓ Imported ${imported} demographic time-series records (${data.length} months × 3 categories)`);
  return imported;
}

/**
 * Import Supplier Classifications
 */
async function importSupplierClassifications() {
  console.log('\n[3/4] Importing Supplier Classifications...');

  const data = JSON.parse(
    fs.readFileSync(path.join(DECODED_DIR, 'supplier_classification.json'), 'utf8')
  );

  const fiscalYear = '2025/26';
  let totalSpend = 0;
  let imported = 0;

  // Calculate total first
  for (const row of data) {
    if (row.C && row.C.length >= 2) {
      totalSpend += parseFloat(row.C[1]);
    }
  }

  // Import each classification
  for (const row of data) {
    if (!row.C || row.C.length < 2) {
      continue;
    }

    const supplierType = row.C[0];
    const spend = parseFloat(row.C[1]);
    const percentOfTotal = totalSpend > 0 ? (spend / totalSpend) * 100 : 0;

    await prisma.supplierClassification.upsert({
      where: {
        fiscalYear_supplierType: {
          fiscalYear,
          supplierType,
        },
      },
      update: {
        totalSpend: spend,
        percentOfTotal,
        importBatch: IMPORT_BATCH,
      },
      create: {
        fiscalYear,
        supplierType,
        totalSpend: spend,
        percentOfTotal,
        importBatch: IMPORT_BATCH,
      },
    });

    imported++;
  }

  console.log(`✓ Imported ${imported} supplier classifications`);
  console.log(`  Total spend tracked: R ${totalSpend.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`);
  return imported;
}

/**
 * Import Commodity Spend Breakdown
 */
async function importCommoditySpendBreakdown() {
  console.log('\n[4/4] Importing Commodity Spend Breakdown...');

  const data = JSON.parse(
    fs.readFileSync(path.join(DECODED_DIR, 'smme_breakdown.json'), 'utf8')
  );

  const fiscalYear = '2025/26';
  let totalSpend = 0;
  let imported = 0;

  // Calculate total first
  for (const row of data) {
    if (row.C && row.C.length >= 2) {
      totalSpend += parseFloat(row.C[1]);
    }
  }

  // Import each commodity segment
  for (const row of data) {
    if (!row.C || row.C.length < 2) {
      continue;
    }

    const segmentTitle = row.C[0];
    const spend = parseFloat(row.C[1]);
    const percentOfTotal = totalSpend > 0 ? (spend / totalSpend) * 100 : 0;

    await prisma.commoditySpendBreakdown.upsert({
      where: {
        fiscalYear_segmentTitle: {
          fiscalYear,
          segmentTitle,
        },
      },
      update: {
        totalSpend: spend,
        percentOfTotal,
        importBatch: IMPORT_BATCH,
      },
      create: {
        fiscalYear,
        segmentTitle,
        totalSpend: spend,
        percentOfTotal,
        importBatch: IMPORT_BATCH,
      },
    });

    imported++;
  }

  console.log(`✓ Imported ${imported} commodity segments`);
  console.log(`  Total spend tracked: R ${totalSpend.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`);
  return imported;
}

/**
 * Main execution
 */
async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  PowerBI Demographic Data Import');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Import Batch: ${IMPORT_BATCH}\n`);

  try {
    const results = {
      categories: await importPPPFACategories(),
      timeSeries: await importDemographicTimeSeries(),
      supplierTypes: await importSupplierClassifications(),
      commodities: await importCommoditySpendBreakdown(),
    };

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('  Import Complete!');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`PPPFA Categories:         ${results.categories} categories`);
    console.log(`Demographic Time-Series:  ${results.timeSeries} records`);
    console.log(`Supplier Classifications: ${results.supplierTypes} types`);
    console.log(`Commodity Segments:       ${results.commodities} segments`);
    console.log('\nAll demographic data successfully imported into database!');
    console.log('═══════════════════════════════════════════════════════════\n');
  } catch (error) {
    console.error('\n✗ Import failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
