/**
 * Verify Demographic Data Import
 *
 * Quick verification script to check imported data counts and samples
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyImport() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  Demographic Data Verification');
  console.log('═══════════════════════════════════════════════════════════\n');

  try {
    // Verify PPPFA Categories
    const categories = await prisma.pPPFACategory.findMany({
      orderBy: { sortOrder: 'asc' }
    });
    console.log(`✓ PPPFA Categories: ${categories.length} found`);
    categories.forEach(cat => {
      console.log(`  - ${cat.code}: ${cat.name}`);
    });

    // Verify Time Series
    const timeSeries = await prisma.demographicSpendTimeSeries.findMany({
      orderBy: [
        { monthNumber: 'asc' },
        { categoryCode: 'asc' }
      ]
    });
    console.log(`\n✓ Demographic Time Series: ${timeSeries.length} records`);

    // Group by month
    const byMonth = timeSeries.reduce((acc, record) => {
      if (!acc[record.month]) acc[record.month] = [];
      acc[record.month].push(record);
      return acc;
    }, {} as Record<string, typeof timeSeries>);

    Object.entries(byMonth).forEach(([month, records]) => {
      const total = records.reduce((sum, r) => sum + Number(r.spendAmount), 0);
      console.log(`  - ${month}: ${records.length} categories, R${(total / 1e9).toFixed(2)}B total`);
    });

    // Verify Supplier Classifications
    const suppliers = await prisma.supplierClassification.findMany({
      orderBy: { totalSpend: 'desc' }
    });
    console.log(`\n✓ Supplier Classifications: ${suppliers.length} types`);
    const totalSupplierSpend = suppliers.reduce((sum, s) => sum + Number(s.totalSpend), 0);
    console.log(`  Total Spend: R${(totalSupplierSpend / 1e9).toFixed(2)}B`);
    suppliers.slice(0, 5).forEach(supplier => {
      console.log(`  - ${supplier.supplierType}: R${(Number(supplier.totalSpend) / 1e9).toFixed(2)}B (${supplier.percentOfTotal}%)`);
    });

    // Verify Commodity Breakdown
    const commodities = await prisma.commoditySpendBreakdown.findMany({
      orderBy: { totalSpend: 'desc' }
    });
    console.log(`\n✓ Commodity Spend Breakdown: ${commodities.length} segments`);
    const totalCommoditySpend = commodities.reduce((sum, c) => sum + Number(c.totalSpend), 0);
    console.log(`  Total Spend: R${(totalCommoditySpend / 1e9).toFixed(2)}B`);
    commodities.slice(0, 5).forEach(commodity => {
      console.log(`  - ${commodity.segmentTitle}: R${(Number(commodity.totalSpend) / 1e9).toFixed(2)}B (${commodity.percentOfTotal}%)`);
    });

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('  All Data Verified Successfully!');
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('✗ Verification failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

verifyImport().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
