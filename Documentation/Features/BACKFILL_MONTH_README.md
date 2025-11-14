# Backfill by Month Script

## Overview

Process tenders month-by-month for better tracking, progress visibility, and easy resumability. This script is ideal for backfilling large datasets in manageable chunks.

## Usage

### Default: Process from Oct 2024 to Current Month

```bash
npx tsx scripts/backfill-by-month.ts
```

This will process all months from October 2024 to the current month.

### Process Specific Month Range

```bash
# Process August through October 2025
npx tsx scripts/backfill-by-month.ts --start-month 2025-08 --end-month 2025-10
```

### Process Single Month

```bash
# Process only October 2025
npx tsx scripts/backfill-by-month.ts --start-month 2025-10 --end-month 2025-10
```

### Dry Run (Test Mode)

```bash
# Test without making database changes
npx tsx scripts/backfill-by-month.ts --start-month 2025-10 --end-month 2025-10 --dry-run
```

## Command-Line Options

| Option | Description | Default | Example |
|--------|-------------|---------|---------|
| `--start-month <YYYY-MM>` | Start from this month | 2024-10 | `--start-month 2025-08` |
| `--end-month <YYYY-MM>` | End at this month | Current month | `--end-month 2025-10` |
| `--dry-run` | Test mode (no DB updates) | false | `--dry-run` |
| `--delay <ms>` | API delay in milliseconds | 350 | `--delay 500` |

## Output Example

```
🏁 Starting month-by-month backfill...
Options: { startMonth: '2025-08', endMonth: '2025-10', delay: '350ms', dryRun: false }

📋 Will process 3 months:
   1. 2025-08
   2. 2025-09
   3. 2025-10

======================================================================
📅 PROCESSING: 2025-08
======================================================================
📊 Total tenders: 1,234
✅ Already categorized: 800 (64.8%)
❌ Missing category: 434 (35.2%)

🔄 Starting backfill for 434 tenders...
  ⏳ 50/434 | Updated: 32 (64.0%) | Skipped: 18 | Elapsed: 1.2min
  ⏳ 100/434 | Updated: 68 (68.0%) | Skipped: 32 | Elapsed: 2.5min
  ...

✅ Month complete!
   Processed: 434
   Updated: 289
   Skipped: 145
   Success rate: 66.6%
   Time: 11.3min

📈 Progress: 1/3 months complete
   Total updated so far: 289
   Total skipped so far: 145
   Already categorized: 800

======================================================================
📅 PROCESSING: 2025-09
======================================================================
...

======================================================================
🎉 ALL MONTHS COMPLETE!
======================================================================
Months processed: 3
Total updated: 987
Total skipped: 456
Already categorized: 2,145
Grand total categorized: 3,132
Runtime: 45.2min (0.8h)
======================================================================
```

## Why Process by Month?

### Advantages

1. **Better Progress Tracking**: See exactly which months have been processed
2. **Easy to Resume**: If interrupted, just restart from the last incomplete month
3. **Performance Insights**: Compare success rates across different time periods
4. **Manageable Chunks**: Process one month at a time instead of all 49K tenders
5. **Skip Already Done**: Automatically skips months that are already 100% categorized

### Expected Success Rates by Month Age

| Month Age | Expected Success Rate |
|-----------|----------------------|
| Current month (Nov 2025) | 90-95% |
| 1 month ago (Oct 2025) | 60-70% |
| 2-3 months ago (Aug-Sep 2025) | 50-65% |
| 4-6 months ago (May-Jul 2025) | 40-60% |
| 7-12 months ago (Nov 2024 - Apr 2025) | 30-50% |
| 12+ months ago (Oct 2024) | 20-40% |

## Recommended Workflow

### Start with Recent Months (Highest Success Rate)

```bash
# Process last 3 months only
npx tsx scripts/backfill-by-month.ts --start-month 2025-08 --end-month 2025-11
```

### Then Work Backwards

```bash
# Process earlier months
npx tsx scripts/backfill-by-month.ts --start-month 2025-05 --end-month 2025-07
```

### Process Historical Data Last

```bash
# Process 2024 data
npx tsx scripts/backfill-by-month.ts --start-month 2024-10 --end-month 2024-12
```

## Monitoring Progress

The script shows real-time progress:
- **Per-month stats**: See how many tenders were processed vs already done
- **Success rate**: Track what % of tenders got categorized
- **Time estimates**: See how long each month takes
- **Grand totals**: Cumulative stats across all months

## Troubleshooting

### Month Shows 0% Success Rate

This might happen for very old months where tenders have been removed from eTenders. This is normal - the script will skip quickly and move to the next month.

### Script Crashes

Simply re-run with the same parameters. Already-processed tenders are skipped automatically.

### Want to Re-process a Month

First, manually clear the `detailedCategory` for that month, then run the script again for that specific month.

## Comparison with Other Scripts

| Script | Best For | Speed | Flexibility |
|--------|----------|-------|-------------|
| `backfill-by-month.ts` | Large datasets, tracking progress | Medium | High (month ranges) |
| `backfill-detailed-category-only.ts` | Custom date ranges, specific limits | Fast | Very High (many options) |
| `backfill-enrichment-all.ts` | Full enrichment (not just category) | Slow | Low (all-or-nothing) |

## Tips

1. **Run during off-peak hours** to minimize database load
2. **Start with a dry run** to estimate time and success rates
3. **Process recent months first** for immediate value (highest success rates)
4. **Monitor the first month** to ensure everything works as expected
5. **Check database after each month** to verify results

## Example: Complete Backfill Strategy

```bash
# Step 1: Test with current month (dry run)
npx tsx scripts/backfill-by-month.ts --start-month 2025-11 --end-month 2025-11 --dry-run

# Step 2: Process current month (real run)
npx tsx scripts/backfill-by-month.ts --start-month 2025-11 --end-month 2025-11

# Step 3: Process last 3 months
npx tsx scripts/backfill-by-month.ts --start-month 2025-08 --end-month 2025-10

# Step 4: Process remaining 2025 months
npx tsx scripts/backfill-by-month.ts --start-month 2025-01 --end-month 2025-07

# Step 5: Process 2024 historical data
npx tsx scripts/backfill-by-month.ts --start-month 2024-10 --end-month 2024-12
```

This gradual approach gives you immediate value (recent tenders) while building up historical coverage over time.
