#!/usr/bin/env tsx
/**
 * Backfill Detailed Category by Month
 *
 * Processes tenders month-by-month for better tracking and resumability.
 *
 * Usage:
 *   npx tsx scripts/backfill-by-month.ts [options]
 *
 * Options:
 *   --start-month <YYYY-MM>   Start from this month (default: 2024-10)
 *   --end-month <YYYY-MM>     End at this month (default: current month)
 *   --dry-run                 Test mode - no database updates
 *   --delay <ms>              API delay in milliseconds (default: 350)
 *
 * Examples:
 *   # Process from Oct 2024 to now
 *   npx tsx scripts/backfill-by-month.ts
 *
 *   # Process specific month range
 *   npx tsx scripts/backfill-by-month.ts --start-month 2025-08 --end-month 2025-10
 *
 *   # Dry run for October 2025
 *   npx tsx scripts/backfill-by-month.ts --start-month 2025-10 --end-month 2025-10 --dry-run
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { PrismaClient } from '@prisma/client';
import { enrichTenderFromEtenders } from '../src/lib/enrichment/etendersEnricher';
import { RATE_LIMIT_DELAY_ETENDERS_MS } from '../src/lib/enrichment/constants';

const prisma = new PrismaClient();

// Parse command-line arguments
function parseArgs() {
  const args = process.argv.slice(2);

  // Default to Oct 2024 through current month
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const options: {
    startMonth: string;
    endMonth: string;
    dryRun: boolean;
    delay: number;
  } = {
    startMonth: '2024-10',
    endMonth: currentMonth,
    dryRun: false,
    delay: RATE_LIMIT_DELAY_ETENDERS_MS,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];

    switch (arg) {
      case '--start-month':
        options.startMonth = next;
        i++;
        break;
      case '--end-month':
        options.endMonth = next;
        i++;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--delay':
        options.delay = parseInt(next, 10);
        i++;
        break;
    }
  }

  return options;
}

// Generate month range
function getMonthRange(startMonth: string, endMonth: string): Array<{ year: number; month: number; label: string }> {
  const [startYear, startMon] = startMonth.split('-').map(Number);
  const [endYear, endMon] = endMonth.split('-').map(Number);

  const months: Array<{ year: number; month: number; label: string }> = [];

  let year = startYear;
  let month = startMon;

  while (year < endYear || (year === endYear && month <= endMon)) {
    months.push({
      year,
      month,
      label: `${year}-${String(month).padStart(2, '0')}`
    });

    month++;
    if (month > 12) {
      month = 1;
      year++;
    }
  }

  return months;
}

// Get month boundaries
function getMonthBoundaries(year: number, month: number) {
  const startDate = new Date(year, month - 1, 1); // month is 1-indexed
  const endDate = new Date(year, month, 0, 23, 59, 59, 999); // last day of month

  return { startDate, endDate };
}

// Derive tender number from raw OCDS data
function deriveTenderNumber(raw: any): string | null {
  if (!raw) return null;

  const title = raw?.tender?.title || '';

  // Strategy: Use the FULL TITLE as the search query
  if (typeof title === 'string' && title.trim().length > 0) {
    return title.trim();
  }

  // Fallback to tender.id if no title
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

// Process one month
async function processMonth(
  year: number,
  month: number,
  label: string,
  options: { dryRun: boolean; delay: number }
) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`📅 PROCESSING: ${label}`);
  console.log('='.repeat(70));

  const { startDate, endDate } = getMonthBoundaries(year, month);

  // Count total and missing
  const total = await prisma.oCDSRelease.count({
    where: {
      publishedAt: {
        gte: startDate,
        lte: endDate
      }
    }
  });

  const missing = await prisma.oCDSRelease.count({
    where: {
      publishedAt: {
        gte: startDate,
        lte: endDate
      },
      detailedCategory: null
    }
  });

  const alreadyDone = total - missing;

  console.log(`📊 Total tenders: ${total}`);
  console.log(`✅ Already categorized: ${alreadyDone} (${((alreadyDone/total)*100).toFixed(1)}%)`);
  console.log(`❌ Missing category: ${missing} (${((missing/total)*100).toFixed(1)}%)`);

  if (missing === 0) {
    console.log(`✨ All tenders already categorized! Skipping...`);
    return { total, updated: 0, skipped: 0, alreadyDone };
  }

  console.log(`\n🔄 Starting backfill for ${missing} tenders...`);

  const monthStartTime = Date.now();
  let processed = 0;
  let updated = 0;
  let skipped = 0;

  // Process in batches
  const batchSize = 500;

  while (true) {
    const batch = await prisma.oCDSRelease.findMany({
      where: {
        publishedAt: {
          gte: startDate,
          lte: endDate
        },
        detailedCategory: null
      },
      select: {
        ocid: true,
        date: true,
        tenderTitle: true,
        json: true,
      },
      orderBy: { publishedAt: 'desc' },
      take: batchSize,
    });

    if (batch.length === 0) {
      break;
    }

    for (const record of batch) {
      try {
        // Parse raw JSON
        let raw: any = null;
        try {
          raw = JSON.parse(record.json);
        } catch (e) {
          // Ignore parse errors
        }

        // Derive tender number
        const tenderNumber = deriveTenderNumber(raw) || record.tenderTitle || record.ocid;

        // Query eTenders API with full hybrid search
        const enrichment = await enrichTenderFromEtenders(
          tenderNumber,
          options.delay,
          {
            buyerName: raw?.buyer?.name,
            title: raw?.tender?.title,
            tenderIdHint: raw?.tender?.id,
          }
        );

        if (enrichment?.detailedCategory?.trim()) {
          const category = enrichment.detailedCategory.trim();

          if (!options.dryRun) {
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

          updated++;
        } else {
          skipped++;
        }

        processed++;

        // Progress log every 50 records
        if (processed % 50 === 0) {
          const elapsed = ((Date.now() - monthStartTime) / 1000 / 60).toFixed(1);
          const rate = ((updated / processed) * 100).toFixed(1);
          console.log(
            `  ⏳ ${processed}/${missing} | Updated: ${updated} (${rate}%) | ` +
            `Skipped: ${skipped} | Elapsed: ${elapsed}min`
          );
        }

      } catch (error: any) {
        console.error(`  ❌ Error for ${record.ocid}:`, error.message);
      }
    }
  }

  const monthElapsed = ((Date.now() - monthStartTime) / 1000 / 60).toFixed(1);
  const successRate = processed > 0 ? ((updated / processed) * 100).toFixed(1) : '0.0';

  console.log(`\n✅ Month complete!`);
  console.log(`   Processed: ${processed}`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Success rate: ${successRate}%`);
  console.log(`   Time: ${monthElapsed}min`);

  if (options.dryRun) {
    console.log(`\n⚠️  DRY RUN - No changes were made to the database`);
  }

  return { total, updated, skipped, alreadyDone };
}

// Main function
async function main() {
  const options = parseArgs();
  const scriptStartTime = Date.now();

  console.log('🏁 Starting month-by-month backfill...');
  console.log('Options:', {
    startMonth: options.startMonth,
    endMonth: options.endMonth,
    delay: `${options.delay}ms`,
    dryRun: options.dryRun,
  });

  const months = getMonthRange(options.startMonth, options.endMonth);

  console.log(`\n📋 Will process ${months.length} months:`);
  months.forEach((m, i) => {
    console.log(`   ${i + 1}. ${m.label}`);
  });

  let totalUpdated = 0;
  let totalSkipped = 0;
  let totalAlreadyDone = 0;

  for (let i = 0; i < months.length; i++) {
    const m = months[i];
    const result = await processMonth(m.year, m.month, m.label, options);

    totalUpdated += result.updated;
    totalSkipped += result.skipped;
    totalAlreadyDone += result.alreadyDone;

    // Summary so far
    if (i < months.length - 1) {
      console.log(`\n📈 Progress: ${i + 1}/${months.length} months complete`);
      console.log(`   Total updated so far: ${totalUpdated}`);
      console.log(`   Total skipped so far: ${totalSkipped}`);
      console.log(`   Already categorized: ${totalAlreadyDone}`);
    }
  }

  const scriptElapsed = ((Date.now() - scriptStartTime) / 1000 / 60).toFixed(1);
  const scriptElapsedHr = (parseFloat(scriptElapsed) / 60).toFixed(1);

  console.log(`\n${'='.repeat(70)}`);
  console.log('🎉 ALL MONTHS COMPLETE!');
  console.log('='.repeat(70));
  console.log(`Months processed: ${months.length}`);
  console.log(`Total updated: ${totalUpdated}`);
  console.log(`Total skipped: ${totalSkipped}`);
  console.log(`Already categorized: ${totalAlreadyDone}`);
  console.log(`Grand total categorized: ${totalUpdated + totalAlreadyDone}`);
  console.log(`Runtime: ${scriptElapsed}min (${scriptElapsedHr}h)`);

  if (options.dryRun) {
    console.log(`\n⚠️  DRY RUN - No changes were made to the database`);
  }

  console.log('='.repeat(70));
}

// Run the script
main()
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
