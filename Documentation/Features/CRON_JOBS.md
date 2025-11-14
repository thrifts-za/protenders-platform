# Cron Jobs & Automated Syncs

ProTenders Platform uses a two-tier cron strategy for optimal data freshness and quality:

## Overview

1. **30-Minute Incremental Sync** (GitHub Actions)
   - Fast updates throughout the day
   - Pulls new tenders from last 24 hours
   - Enriches up to 300 new tenders per run (dynamic)

2. **Daily Comprehensive Sync** (Vercel Cron - 23:00 SAST)
   - End-of-day data quality check
   - Re-enriches missing categories
   - Ensures 100% enrichment coverage

---

## 1. 30-Minute Incremental Sync (GitHub Actions)

### Schedule
Runs **every 30 minutes**, 24/7

### Configuration
**File:** `.github/workflows/scheduled-jobs.yml`

```yaml
schedule:
  - cron: "*/30 * * * *"  # Every 30 minutes
```

### Endpoint
```
POST /api/cron/sync?mode=daily&incremental=1&requireEnrichment=1
```

### Parameters
- `mode=daily` - Syncs last 24 hours of tenders
- `incremental=1` - Incremental update mode
- `requireEnrichment=1` - Only creates new records if enrichment succeeds

### What It Does
1. Fetches all tenders from OCDS API (last 24 hours)
2. **Dynamic enrichment limit:**
   - Estimates new tender count from first page sample
   - Sets enrichment limit = MAX(estimated new, 300)
   - Example: If 150 new tenders, enriches all 150
   - Example: If 400 new tenders, enriches 400 (overrides base 300)
3. For each tender:
   - Queries eTenders API for detailed category
   - Extracts contact info, briefing details, documents
   - Saves all enrichment data to database
4. Skips creating new records without enrichment data

### Expected Behavior
- **Average tenders/day:** 200-300
- **Tenders per 30min:** ~4-13 new tenders
- **Enrichment success rate:** 60-95% (higher for recent tenders)
- **Runtime:** 1-3 minutes per run

### Environment Variables Required
```bash
ENABLE_ENRICHMENT="true"           # CRITICAL: Must be true
MAX_ENRICHMENT_PER_RUN="300"       # Base limit (dynamically adjusted)
ENRICH_SEARCH_STRATEGY="hybrid"    # Use 8-strategy hybrid search
ENRICH_USE_TITLE="true"            # Enable title-based fallback
CRON_SECRET="your-secret-here"     # For authentication
```

---

## 2. Daily Comprehensive Sync (Vercel Cron)

### Schedule
Runs **daily at 23:00 SAST (21:00 UTC)**

### Configuration
**File:** `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/sync?mode=comprehensive&requireEnrichment=1",
      "schedule": "0 21 * * *"
    }
  ]
}
```

### Endpoint
```
POST /api/cron/sync?mode=comprehensive&requireEnrichment=1
```

### Parameters
- `mode=comprehensive` - End-of-day quality assurance mode
- `requireEnrichment=1` - Only creates new records if enrichment succeeds

### What It Does
1. Fetches all tenders from today (00:00 - 23:59 SAST)
2. **Smart enrichment limit:**
   - Counts ALL tenders from today missing `detailedCategory`
   - Sets limit = MIN(missing count + 50, 1000)
   - Example: 250 missing categories → limit = 300
3. For each tender:
   - **New tenders:** Full enrichment as usual
   - **Existing tenders:** Re-enriches if missing `detailedCategory`
   - Queries eTenders API with hybrid search (8 fallback strategies)
   - Saves all enrichment data
4. Final quality check - logs coverage statistics

### Expected Behavior
- **Tenders processed:** All from today (200-300)
- **Re-enrichment:** Only tenders missing categories
- **Enrichment limit:** Up to 1000 (enough for full day)
- **Runtime:** 5-15 minutes
- **Coverage goal:** 90%+ of today's tenders categorized

### Why 23:00 SAST?
- After business hours (most tenders published by now)
- Before midnight (ensures same-day coverage)
- Catches any stragglers from incremental syncs
- Prepares clean data for next day

---

## Enrichment Process

Both cron jobs use the same enrichment function with hybrid search:

### enrichTenderFromEtenders()
**Location:** `src/lib/enrichment/etendersEnricher.ts`

**Strategy:** 8-attempt hybrid search
1. Tender number (published status)
2. Alphanumeric tokens from title (published)
3. Compound query - first 2 strong tokens (published)
4. Full title tokens (published)
5. Tender number (all statuses) ← **Critical for old tenders**
6. Alphanumeric tokens (all statuses)
7. Compound query (all statuses)
8. Full title tokens (all statuses)

**Data Extracted:**
- `detailedCategory` - Specific tender category
- `province` - Geographic location
- `contactPerson`, `contactEmail`, `contactTelephone`
- `deliveryLocation` - Where service/goods delivered
- `specialConditions` - Special requirements
- Briefing info: `hasBriefing`, `briefingCompulsory`, `briefingDate`, `briefingTime`, `briefingVenue`, `briefingMeetingLink`
- `tenderType` - RFQ, RFP, RFB, etc.
- `documents` - Array of downloadable PDFs with URLs

---

## Monitoring & Troubleshooting

### Check Cron Job Status

**GitHub Actions:**
```bash
# View recent runs
https://github.com/YOUR_ORG/protenders-platform/actions
```

**Vercel Cron:**
```bash
# View logs in Vercel dashboard
https://vercel.com/YOUR_ORG/protenders-platform/deployments
# Filter by: "Cron Jobs"
```

### Check Database Coverage

```sql
-- Overall enrichment coverage
SELECT
  COUNT(*) as total_tenders,
  COUNT(detailedCategory) as with_category,
  ROUND(COUNT(detailedCategory)::numeric / COUNT(*) * 100, 2) as coverage_pct
FROM "OCDSRelease";

-- Today's coverage
SELECT
  COUNT(*) as total_today,
  COUNT(detailedCategory) as categorized_today,
  ROUND(COUNT(detailedCategory)::numeric / COUNT(*) * 100, 2) as coverage_pct
FROM "OCDSRelease"
WHERE DATE("publishedAt") = CURRENT_DATE;

-- Missing categories from today
SELECT ocid, "tenderTitle", "publishedAt"
FROM "OCDSRelease"
WHERE DATE("publishedAt") = CURRENT_DATE
  AND "detailedCategory" IS NULL
ORDER BY "publishedAt" DESC;
```

### Expected Success Rates

| Tender Age | Expected Success Rate |
|------------|----------------------|
| Current month | 90-95% |
| 1 month ago | 60-70% |
| 2-3 months ago | 50-65% |
| 4-6 months ago | 40-60% |
| 7-12 months ago | 30-50% |
| 12+ months ago | 20-40% |

**Why lower for older tenders?**
- Tenders get removed from eTenders after closing
- Status changes to non-published
- Hybrid search with all statuses helps, but some are completely removed

---

## Common Issues

### Issue: Low enrichment success rate (<50%)

**Possible causes:**
- `ENABLE_ENRICHMENT=false` in production
- `ENRICH_SEARCH_STRATEGY="simple"` instead of "hybrid"
- `ENRICH_USE_TITLE="false"` disables title fallback
- eTenders API is down or rate-limiting

**Fix:**
```bash
# Check production environment variables
ENABLE_ENRICHMENT="true"
ENRICH_SEARCH_STRATEGY="hybrid"
ENRICH_USE_TITLE="true"
MAX_ENRICHMENT_PER_RUN="300"
```

### Issue: Cron job timing out (5min limit)

**Possible causes:**
- Too many tenders to process
- eTenders API is slow
- Rate limiting delay too high

**Fix:**
- Increase `MAX_ENRICHMENT_PER_RUN` gradually
- Check eTenders API response times
- Consider splitting into multiple smaller runs

### Issue: Duplicate runs (both GitHub & Vercel running)

**Current setup:**
- GitHub Actions: Every 30 minutes (incremental)
- Vercel Cron: Daily at 23:00 (comprehensive)

**This is intentional!** They serve different purposes:
- GitHub = Frequent updates
- Vercel = Daily quality check

If you want only one, disable either in `.github/workflows/scheduled-jobs.yml` or `vercel.json`

---

## Manual Triggers

### Trigger GitHub Actions Manually
1. Go to Actions tab
2. Select "Scheduled Jobs" workflow
3. Click "Run workflow"
4. Choose branch and parameters

### Trigger Vercel Cron Manually
```bash
curl -X POST "https://YOUR_DOMAIN.com/api/cron/sync?mode=comprehensive&requireEnrichment=1&secret=YOUR_CRON_SECRET"
```

### Test Locally
```bash
# Set environment variables
source .env.local

# Run sync endpoint
curl -X POST "http://localhost:3000/api/cron/sync?mode=daily&incremental=1&requireEnrichment=1&secret=$CRON_SECRET"
```

---

## Future Improvements

### Potential Enhancements
1. **Smart retry for failed enrichments**
   - Queue tenders that failed enrichment
   - Retry during low-traffic hours

2. **Enrichment metrics dashboard**
   - Track success rates over time
   - Alert if success rate drops below threshold

3. **Adaptive enrichment limits**
   - Increase limit during high-traffic periods
   - Decrease during API issues

4. **Backfill strategy**
   - Monthly job to catch historical data
   - Use `scripts/backfill-by-month.ts`

---

## Related Scripts

### Backfill Missing Categories (Month by Month)
```bash
# Process October 2025
npx tsx scripts/backfill-by-month.ts --start-month 2025-10 --end-month 2025-10

# See: scripts/README-BACKFILL-BY-MONTH.md
```

### Backfill Specific Date Range
```bash
# Process last 30 days
npx tsx scripts/backfill-detailed-category-only.ts --from-date 2025-10-08 --limit 1000
```

---

## Summary

| Aspect | 30-Min Incremental | Daily Comprehensive |
|--------|-------------------|---------------------|
| **Schedule** | Every 30 minutes | Daily at 23:00 SAST |
| **Purpose** | Fast updates | Quality assurance |
| **Mode** | `daily` | `comprehensive` |
| **Enrichment Limit** | 300 (dynamic) | 1000 (dynamic) |
| **Date Range** | Last 24 hours | Today only |
| **Re-enriches Existing** | No | Yes (if missing category) |
| **Expected Runtime** | 1-3 minutes | 5-15 minutes |
| **Platform** | GitHub Actions | Vercel Cron |

Both jobs ensure ProTenders has fresh, well-categorized tender data with comprehensive enrichment details!
