# Backfill Detailed Category Script

## Overview

This script backfills the `detailedCategory` field for all tenders that are missing it. It's a lightweight, focused script that ONLY fetches and updates the category field from eTenders API, making it much faster than full enrichment.

## Current Status

- **Total tenders in database**: ~49,284
- **Tenders with detailedCategory**: 9 (0.02%)
- **Tenders missing detailedCategory**: ~49,275 (99.98%)

## Why This Script?

The 91 detailed categories from eTenders (like "Services: Building", "Construction", "Services: IT") enable:
- Category-specific tender pages
- Better search filtering
- Improved SEO and discoverability
- More accurate tender recommendations

## Usage

### Basic Usage (Process All Missing Categories)

```bash
npx tsx scripts/backfill-detailed-category-only.ts
```

**⚠️ Warning**: This will process ALL ~49K records. Estimated runtime: **4-5 hours**

### Recommended: Start Small

```bash
# Test with 10 records (dry run - no database changes)
npx tsx scripts/backfill-detailed-category-only.ts --limit 10 --dry-run

# Process last 30 days only
npx tsx scripts/backfill-detailed-category-only.ts --from-date 2025-01-08 --limit 1000

# Process in batches with time budget (2 hour limit)
npx tsx scripts/backfill-detailed-category-only.ts --time-budget 120
```

## Command-Line Options

| Option | Description | Default | Example |
|--------|-------------|---------|---------|
| `--limit <n>` | Max records to process | unlimited | `--limit 1000` |
| `--delay <ms>` | API delay in milliseconds | 350 | `--delay 500` |
| `--batch-size <n>` | Records per batch | 500 | `--batch-size 200` |
| `--from-date <date>` | Only process from this date | any | `--from-date 2025-01-01` |
| `--to-date <date>` | Only process up to this date | any | `--to-date 2025-02-01` |
| `--dry-run` | Test mode (no DB updates) | false | `--dry-run` |
| `--time-budget <min>` | Max runtime in minutes | unlimited | `--time-budget 120` |

## Examples

### 1. Dry Run Test (Recommended First Step)

```bash
# Test with 100 records to see what will happen
npx tsx scripts/backfill-detailed-category-only.ts --limit 100 --dry-run
```

### 2. Process Recent Tenders First

```bash
# Process tenders from last 60 days
npx tsx scripts/backfill-detailed-category-only.ts --from-date 2024-11-08
```

### 3. Time-Budgeted Batch Processing

```bash
# Run for 2 hours max, then stop (can resume later)
npx tsx scripts/backfill-detailed-category-only.ts --time-budget 120

# Run again later to continue where it left off
npx tsx scripts/backfill-detailed-category-only.ts --time-budget 120
```

### 4. Process All (Full Backfill)

```bash
# Process everything (will take 4-5 hours)
npx tsx scripts/backfill-detailed-category-only.ts
```

## Output Example

```
🏁 Starting detailedCategory-only backfill...
Options: { limit: 'unlimited', delay: '350ms', batchSize: 500, ... }

📊 Found 49,275 tenders without detailedCategory

📦 Batch 1/99 (500 records):
  ✅ Processed 50/500 | Updated: 47 | Skipped: 2 | Failed: 1 | Elapsed: 0.3min
  ✅ Processed 100/500 | Updated: 94 | Skipped: 4 | Failed: 2 | Elapsed: 0.6min
  ...
  📊 Batch complete: 456/500 updated, 42 skipped, 2 failed

📦 Batch 2/99 (500 records):
  ...

============================================================
🎉 Backfill complete!
============================================================
Total processed:  49,275
Total updated:    45,821
Total skipped:    3,210
Total failed:     244
Runtime:          285.4min (4.8h)
Success rate:     93.0%
============================================================
```

## How It Works

1. **Query Database**: Find tenders where `detailedCategory IS NULL`
2. **Extract Tender Number**: Parse tender number from title/ID
3. **Call eTenders API**: Query eTenders API with tender number
4. **Extract Category**: Get ONLY the `category` field from API response
5. **Update Database**: Set `detailedCategory` = category value
6. **Rate Limiting**: Wait 350ms between API calls
7. **Progress Tracking**: Log every 50 records processed
8. **Repeat**: Continue until no more records or limit reached

## Performance

- **Records to process**: ~49,275
- **API delay**: 350ms per record
- **Estimated time**: ~17,146 seconds ≈ 4.8 hours
- **Success rate**: ~90-95% (some tenders may not exist in eTenders)
- **Batch size**: 500 records per batch
- **Total batches**: ~99 batches

## Cancellation

To cancel a running backfill safely:

```bash
# In another terminal, set the cancellation flag
npx tsx -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
await prisma.config.upsert({
  where: { key: 'detailedcategory_backfill_cancel' },
  create: { key: 'detailedcategory_backfill_cancel', value: 'true' },
  update: { value: 'true' }
});
await prisma.\$disconnect();
console.log('✅ Cancellation requested');
"
```

The script will stop at the next checkpoint (every 10 records).

## Monitoring Progress

To check progress during execution:

```bash
# Check how many records still need processing
npx tsx -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const count = await prisma.oCDSRelease.count({
  where: { detailedCategory: null }
});
console.log('Remaining:', count);
await prisma.\$disconnect();
"
```

## Troubleshooting

### HTTP 500 Errors

Some tenders may return HTTP 500 from eTenders API. This is normal and means:
- The tender doesn't exist in eTenders system (e.g., it was deleted)
- The tender number format doesn't match eTenders expectations
- These are counted as "skipped" and can be ignored

### API Rate Limiting

If you see rate limiting errors:
- Increase the `--delay` parameter (e.g., `--delay 500`)
- Reduce `--batch-size` (e.g., `--batch-size 200`)

### Script Crashes

If the script crashes, you can simply re-run it:
- It will automatically resume from where it left off
- Already-processed records have `detailedCategory` set and will be skipped

## After Backfill

Once the backfill is complete, you can:

1. **Verify the results**:
```bash
npx tsx -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const total = await prisma.oCDSRelease.count();
const withCategory = await prisma.oCDSRelease.count({
  where: { detailedCategory: { not: null } }
});
console.log('Total:', total);
console.log('With category:', withCategory);
console.log('Percentage:', ((withCategory/total)*100).toFixed(2) + '%');
await prisma.\$disconnect();
"
```

2. **Create category-specific pages** in your Next.js app
3. **Add category filters** to search interface
4. **Build category navigation** for better UX

## Best Practices

1. **Always test with `--dry-run` first**
2. **Start with recent tenders** using `--from-date`
3. **Use time budgets** for long-running jobs (`--time-budget 120`)
4. **Monitor progress** in another terminal
5. **Run during off-peak hours** to minimize database load

## Support

For issues or questions:
- Check the script output for specific error messages
- Review the eTenders API logs for HTTP errors
- Contact the development team if persistent failures occur
