#!/usr/bin/env tsx
/**
 * Backfill Detailed Category Only
 *
 * Lightweight script to populate the detailedCategory field for all tenders that are missing it.
 * This script ONLY fetches and updates the category field, making it much faster than full enrichment.
 *
 * Usage:
 *   npx tsx scripts/backfill-detailed-category-only.ts [options]
 *
 * Options:
 *   --limit <n>          Max records to process (default: unlimited)
 *   --delay <ms>         API delay in milliseconds (default: 350)
 *   --batch-size <n>     Records per batch (default: 500)
 *   --from-date <date>   Only process tenders from this date forward (YYYY-MM-DD)
 *   --to-date <date>     Only process tenders up to this date (YYYY-MM-DD)
 *   --dry-run            Test mode - no database updates
 *   --time-budget <min>  Max runtime in minutes (default: unlimited)
 *
 * Examples:
 *   # Process all missing categories
 *   npx tsx scripts/backfill-detailed-category-only.ts
 *
 *   # Process only last 30 days, max 1000 records
 *   npx tsx scripts/backfill-detailed-category-only.ts --from-date 2025-01-08 --limit 1000
 *
 *   # Dry run to see what would be updated
 *   npx tsx scripts/backfill-detailed-category-only.ts --limit 100 --dry-run
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { PrismaClient } from '@prisma/client';
import { queryEtendersByTenderNo } from '../src/lib/enrichment/etendersEnricher';
import { RATE_LIMIT_DELAY_ETENDERS_MS } from '../src/lib/enrichment/constants';

const prisma = new PrismaClient();

// Parse command-line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options: {
    limit?: number;
    delay: number;
    batchSize: number;
    fromDate?: Date;
    toDate?: Date;
    dryRun: boolean;
    timeBudget?: number;
  } = {
    delay: RATE_LIMIT_DELAY_ETENDERS_MS,
    batchSize: 500,
    dryRun: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];

    switch (arg) {
      case '--limit':
        options.limit = parseInt(next, 10);
        i++;
        break;
      case '--delay':
        options.delay = parseInt(next, 10);
        i++;
        break;
      case '--batch-size':
        options.batchSize = parseInt(next, 10);
        i++;
        break;
      case '--from-date':
        options.fromDate = new Date(next);
        i++;
        break;
      case '--to-date':
        options.toDate = new Date(next);
        i++;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--time-budget':
        options.timeBudget = parseInt(next, 10) * 60 * 1000; // Convert minutes to ms
        i++;
        break;
    }
  }

  return options;
}

// Derive tender number from raw OCDS data
function deriveTenderNumber(raw: any): string | null {
  if (!raw) return null;

  // Try to extract from title using common patterns
  const title = raw?.tender?.title || '';
  if (typeof title === 'string') {
    // Match patterns like: RFQ-123, RFP/2024/001, etc.
    const match = title.match(/\b(RFQ|RFP|RFB|RFT|RFI|RFA|RFPQ|RFBQ|EOI)[-_\s:/]*([A-Z0-9/\.-]{3,})/i);
    if (match) {
      return match[0].replace(/\s+/g, '');
    }

    // Try to match tender number pattern
    const numMatch = title.match(/([A-Z0-9/\.-]{3,})[-_\s:/]*(RFQ|RFP|RFB|RFT|RFI|RFA|RFPQ|RFBQ|EOI)\b/i);
    if (numMatch) {
      return numMatch[0].replace(/\s+/g, '');
    }
  }

  // Fallback to tender.id
  const tenderId = raw?.tender?.id;
  if (tenderId != null) {
    return String(tenderId);
  }

  return null;
}

// Delay helper
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main backfill function
async function backfillDetailedCategory() {
  const options = parseArgs();
  const startTime = Date.now();

  console.log('🏁 Starting detailedCategory-only backfill...');
  console.log('Options:', {
    limit: options.limit || 'unlimited',
    delay: `${options.delay}ms`,
    batchSize: options.batchSize,
    fromDate: options.fromDate?.toISOString().split('T')[0] || 'any',
    toDate: options.toDate?.toISOString().split('T')[0] || 'any',
    dryRun: options.dryRun,
    timeBudget: options.timeBudget ? `${options.timeBudget / 60000}min` : 'unlimited',
  });
  console.log();

  // Build query filter
  const where: any = {
    detailedCategory: null,
  };

  if (options.fromDate || options.toDate) {
    where.date = {};
    if (options.fromDate) where.date.gte = options.fromDate;
    if (options.toDate) where.date.lte = options.toDate;
  }

  // Count total records to process
  const totalCount = await prisma.oCDSRelease.count({ where });
  console.log(`📊 Found ${totalCount.toLocaleString()} tenders without detailedCategory\n`);

  if (totalCount === 0) {
    console.log('✅ All tenders already have detailedCategory!');
    return;
  }

  let totalProcessed = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;
  let totalFailed = 0;
  let batchNumber = 0;

  // Multi-pass loop: keep processing until no more records or limit reached
  while (true) {
    // Check time budget
    if (options.timeBudget && (Date.now() - startTime) > options.timeBudget) {
      console.log('\n⏱️  Time budget exceeded. Stopping...');
      break;
    }

    // Check if we've hit the limit
    if (options.limit && totalProcessed >= options.limit) {
      console.log('\n🎯 Limit reached. Stopping...');
      break;
    }

    // Fetch next batch
    const batchLimit = options.limit
      ? Math.min(options.batchSize, options.limit - totalProcessed)
      : options.batchSize;

    const batch = await prisma.oCDSRelease.findMany({
      where,
      select: {
        ocid: true,
        date: true,
        tenderTitle: true,
        json: true,
      },
      orderBy: { date: 'desc' },
      take: batchLimit,
    });

    if (batch.length === 0) {
      console.log('\n✅ No more records to process!');
      break;
    }

    batchNumber++;
    const totalBatches = Math.ceil((options.limit || totalCount) / options.batchSize);
    console.log(`\n📦 Batch ${batchNumber}/${totalBatches} (${batch.length} records):`);

    let batchProcessed = 0;
    let batchUpdated = 0;
    let batchSkipped = 0;
    let batchFailed = 0;

    for (let i = 0; i < batch.length; i++) {
      const record = batch[i];

      // Check cancellation flag every 10 records
      if (i % 10 === 0) {
        const cancelConfig = await prisma.config.findUnique({
          where: { key: 'detailedcategory_backfill_cancel' },
        });
        if (cancelConfig?.value === 'true') {
          console.log('\n🛑 Cancellation requested. Stopping...');
          await prisma.config.update({
            where: { key: 'detailedcategory_backfill_cancel' },
            data: { value: 'false' },
          });
          return;
        }
      }

      try {
        // Parse raw JSON to derive tender number
        let raw: any = null;
        try {
          raw = JSON.parse(record.json);
        } catch (e) {
          // Ignore parse errors
        }

        // Derive tender number
        const tenderNumber = deriveTenderNumber(raw) || record.tenderTitle || record.ocid;

        // Query eTenders API
        const etendersRow = await queryEtendersByTenderNo(
          tenderNumber,
          options.delay,
          {
            buyerName: raw?.buyer?.name,
            title: raw?.tender?.title,
            tenderIdHint: raw?.tender?.id,
          }
        );

        if (etendersRow?.category?.trim()) {
          const category = etendersRow.category.trim();

          if (!options.dryRun) {
            // Update only the detailedCategory field
            await prisma.oCDSRelease.update({
              where: {
                ocid_date: {
                  ocid: record.ocid,
                  date: record.date,
                },
              },
              data: {
                detailedCategory: category,
              },
            });
          }

          batchUpdated++;
          totalUpdated++;
        } else {
          batchSkipped++;
          totalSkipped++;
        }

        batchProcessed++;
        totalProcessed++;

        // Progress log every 50 records
        if (batchProcessed % 50 === 0) {
          const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
          console.log(
            `  ✅ Processed ${batchProcessed}/${batch.length} | ` +
            `Updated: ${batchUpdated} | Skipped: ${batchSkipped} | Failed: ${batchFailed} | ` +
            `Elapsed: ${elapsed}min`
          );
        }

      } catch (error: any) {
        batchFailed++;
        totalFailed++;
        console.error(`  ❌ Failed for ${record.ocid}:`, error.message);
      }
    }

    // Batch summary
    console.log(
      `  📊 Batch complete: ${batchUpdated}/${batch.length} updated, ` +
      `${batchSkipped} skipped, ${batchFailed} failed`
    );
  }

  // Final summary
  const elapsedMin = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  const elapsedHr = (parseFloat(elapsedMin) / 60).toFixed(1);

  console.log('\n' + '='.repeat(60));
  console.log('🎉 Backfill complete!');
  console.log('='.repeat(60));
  console.log(`Total processed:  ${totalProcessed.toLocaleString()}`);
  console.log(`Total updated:    ${totalUpdated.toLocaleString()}`);
  console.log(`Total skipped:    ${totalSkipped.toLocaleString()}`);
  console.log(`Total failed:     ${totalFailed.toLocaleString()}`);
  console.log(`Runtime:          ${elapsedMin}min (${elapsedHr}h)`);
  console.log(`Success rate:     ${((totalUpdated / totalProcessed) * 100).toFixed(1)}%`);

  if (options.dryRun) {
    console.log('\n⚠️  DRY RUN - No changes were made to the database');
  }

  console.log('='.repeat(60));
}

// Run the script
backfillDetailedCategory()
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
