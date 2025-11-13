/**
 * Import Procurement Payment Transactions from CSV
 *
 * This script imports BAS/CSD payment data from the Procurement Payments Dashboard
 * into the ProTenders database for analysis and insights.
 *
 * Usage:
 * npm run import:payments [-- --file=path/to/file.csv] [--batch-size=1000] [--clear]
 */

import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { prisma } from '../src/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

interface CSVRow {
  Province: string;
  Department: string;
  Fiscal_Year: string;
  'Supplier Name': string;
  'SCoA Item Posting Level': string;
  'UNSPSC Family Title': string;
  'Class Title': string;
  'Total Transaction Amount': string;
}

// Parse command line arguments
const args = process.argv.slice(2);
const getArg = (name: string, defaultValue?: string): string | undefined => {
  const arg = args.find(a => a.startsWith(`--${name}=`));
  return arg ? arg.split('=')[1] : defaultValue;
};
const hasFlag = (name: string): boolean => args.includes(`--${name}`);

const csvFilePath = getArg('file', 'data/Procurement_Spend_Transaction_List(in).csv');
const batchSize = parseInt(getArg('batch-size', '1000')!, 10);
const clearExisting = hasFlag('clear');
const dryRun = hasFlag('dry-run');

// Province code mapping
const provinceCodeMap: Record<string, string> = {
  'GAUTENG': 'GP',
  'WESTERN CAPE': 'WC',
  'KWAZULU NATAL': 'KZN',
  'EASTERN CAPE': 'EC',
  'FREE STATE': 'FS',
  'LIMPOPO': 'LP',
  'MPUMALANGA': 'MP',
  'NORTHERN CAPE': 'NC',
  'NORTH WEST': 'NW',
  'NATIONAL': 'NAT',
};

// Extract department code from full department name
function extractDepartmentCode(department: string): string | null {
  // Format: "GP:  HEALTH" or "NAT:  JUSTICE & CONSTITUTIONAL DEVELOPMENT"
  const match = department.match(/^([A-Z]+):\s+(.+)$/);
  return match ? match[1] : null;
}

// Normalize supplier name for better matching
function normalizeSupplierName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\(pty\)\s*ltd/gi, '(pty) ltd')
    .replace(/\(pty\)/gi, '(pty)')
    .replace(/pty\s*ltd/gi, 'pty ltd');
}

// Parse amount from "R 123456.78" format
function parseAmount(amountStr: string): number {
  return parseFloat(amountStr.replace(/^R\s*/, '').replace(/,/g, ''));
}

async function main() {
  console.log('🚀 Procurement Payment Import Script');
  console.log('=====================================\n');

  const absolutePath = path.resolve(csvFilePath);
  console.log(`📁 Input file: ${absolutePath}`);
  console.log(`📊 Batch size: ${batchSize}`);
  console.log(`🧹 Clear existing: ${clearExisting ? 'YES' : 'NO'}`);
  console.log(`🏃 Dry run: ${dryRun ? 'YES' : 'NO'}\n`);

  // Check if file exists
  if (!fs.existsSync(absolutePath)) {
    console.error(`❌ Error: File not found: ${absolutePath}`);
    process.exit(1);
  }

  // Clear existing data if requested
  if (clearExisting && !dryRun) {
    console.log('🧹 Clearing existing payment data...');
    const deleted = await prisma.procurementPayment.deleteMany({});
    console.log(`✅ Deleted ${deleted.count} existing records\n`);
  }

  // Read and parse CSV
  console.log('📖 Reading CSV file...');
  const fileContent = fs.readFileSync(absolutePath, 'utf-8');

  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as CSVRow[];

  console.log(`✅ Parsed ${records.length} records from CSV\n`);

  if (records.length === 0) {
    console.log('⚠️  No records to import. Exiting.');
    return;
  }

  // Generate batch ID
  const batchId = `import-${Date.now()}`;
  console.log(`📦 Batch ID: ${batchId}\n`);

  // Process in batches
  const totalBatches = Math.ceil(records.length / batchSize);
  let successCount = 0;
  let errorCount = 0;

  console.log(`🔄 Processing ${records.length} records in ${totalBatches} batches...\n`);

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const batchNumber = Math.floor(i / batchSize) + 1;

    console.log(`📦 Batch ${batchNumber}/${totalBatches} (${batch.length} records)...`);

    if (dryRun) {
      console.log(`   [DRY RUN] Would insert ${batch.length} records`);
      successCount += batch.length;
      continue;
    }

    try {
      const data = batch.map(row => ({
        province: row.Province.trim(),
        department: row.Department.trim(),
        fiscalYear: row.Fiscal_Year.trim(),
        supplierName: row['Supplier Name']?.trim() || 'Unknown',
        scoaItem: row['SCoA Item Posting Level'].trim(),
        unspscFamily: row['UNSPSC Family Title'].trim(),
        classTitle: row['Class Title'].trim(),
        transactionAmount: new Decimal(parseAmount(row['Total Transaction Amount'])),
        supplierNameNorm: normalizeSupplierName(row['Supplier Name'] || 'Unknown'),
        provinceCode: provinceCodeMap[row.Province.trim().toUpperCase()] || null,
        departmentCode: extractDepartmentCode(row.Department.trim()),
        importBatch: batchId,
      }));

      await prisma.procurementPayment.createMany({
        data,
        skipDuplicates: false,
      });

      successCount += batch.length;
      console.log(`   ✅ Inserted ${batch.length} records`);
    } catch (error) {
      errorCount += batch.length;
      console.error(`   ❌ Error inserting batch:`, error);

      // Continue with next batch instead of failing completely
      console.log(`   ⏭️  Continuing with next batch...`);
    }
  }

  console.log('\n=====================================');
  console.log('📊 Import Summary');
  console.log('=====================================');
  console.log(`✅ Successfully imported: ${successCount.toLocaleString()} records`);
  console.log(`❌ Failed: ${errorCount.toLocaleString()} records`);
  console.log(`📦 Batch ID: ${batchId}`);

  if (!dryRun) {
    const totalInDb = await prisma.procurementPayment.count();
    console.log(`💾 Total records in database: ${totalInDb.toLocaleString()}`);
  }

  console.log('\n🎉 Import complete!\n');
}

main()
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
