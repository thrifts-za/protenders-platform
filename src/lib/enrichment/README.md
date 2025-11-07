# OCDS Enrichment Module

This module provides functionality to enrich OCDS tender data with additional fields from the eTenders site API.

## Overview

The enrichment process augments base OCDS tender data with:
- Geographic information (province, delivery location)
- Contact details (contact person, email, telephone)
- Briefing session information (date, time, venue, meeting link)
- Special conditions
- Tender type

## Architecture

### Components

1. **`etendersEnricher.ts`** - Main enrichment module
   - `queryEtendersByTenderNo()` - Query eTenders site API
   - `enrichFromEtendersRow()` - Convert API response to enrichment data
   - `enrichTenderFromEtenders()` - High-level enrichment function

2. **`constants.ts`** - Configuration constants
   - Rate limiting delays
   - HTTP timeouts
   - API endpoints
   - Retry attempts

3. **`validation.ts`** - Data validation utilities
   - Email validation
   - Phone number validation
   - Province normalization
   - Special conditions validation

## Usage

### Basic Usage

```typescript
import { enrichTenderFromEtenders } from '@/lib/enrichment/etendersEnricher';

const enrichment = await enrichTenderFromEtenders('RFP05/2025/2026');
if (enrichment) {
  console.log('Province:', enrichment.province);
  console.log('Contact:', enrichment.contactPerson);
  // ...
}
```

### In Cron Job

The cron job (`src/app/api/cron/sync/route.ts`) includes enrichment support with a feature flag:

```bash
# Enable enrichment in environment
ENABLE_ENRICHMENT=true
MAX_ENRICHMENT_PER_RUN=10
```

### In Backfill Script

The backfill script (`scripts/backfill-ocds-save.ts`) uses enrichment automatically:

```bash
npm run backfill:save -- --date=2025-11-04 --maxScrape=50
```

## Configuration

### Environment Variables

- `ENABLE_ENRICHMENT` - Enable/disable enrichment in cron (default: false)
- `MAX_ENRICHMENT_PER_RUN` - Maximum enrichments per cron run (default: 10)
- `OCDS_BASE_URL` - Base URL for OCDS API (default: https://ocds-api.etenders.gov.za)

### Constants

All rate limiting and timeout constants are in `constants.ts`:
- `RATE_LIMIT_DELAY_MS` - Delay between API calls (300ms)
- `HTTP_TIMEOUT_MS` - HTTP request timeout (60s)
- `MAX_RETRY_ATTEMPTS` - Maximum retry attempts (2)

## Error Handling

The module includes:
- Automatic retry with exponential backoff
- Timeout handling (60s)
- Error logging
- Graceful degradation (returns null on failure)

## Rate Limiting

The module respects rate limits:
- 300ms delay between eTenders API calls
- Configurable via `RATE_LIMIT_DELAY_MS` constant
- Automatic throttling in backfill scripts

## Data Validation

The validation module provides:
- Email format validation
- South African phone number validation
- Province name normalization
- Special conditions text cleaning

## Integration Points

### Cron Job (`src/app/api/cron/sync/route.ts`)
- Feature flag: `ENABLE_ENRICHMENT`
- Tracks enrichment metrics (count, success, failures)
- Logs enrichment statistics

### Backfill Script (`scripts/backfill-ocds-save.ts`)
- Automatic enrichment for all releases
- Scrape count tracking
- Error handling per release

### API Routes (`src/app/api/tenders/[id]/route.ts`)
- Returns enrichment fields in API response
- Includes all enrichment data in normalized tender format

## Testing

To test enrichment:

```bash
# Test backfill with enrichment
npm run backfill:save -- --date=2025-11-04 --maxScrape=5

# Enable enrichment in cron (set env var)
ENABLE_ENRICHMENT=true npm run dev
```

## Limitations

1. **Rate Limiting**: Enrichment is limited by eTenders API rate limits
2. **Tender Number Required**: Enrichment requires a valid tender number
3. **API Availability**: Depends on eTenders site API availability
4. **Data Quality**: Some fields may be missing or inconsistent

## Future Improvements

- [ ] Add caching for enrichment data
- [ ] Add OCR support for scanned documents
- [ ] Add table extraction for BOQs
- [ ] Add confidence scoring for extracted fields
- [ ] Add batch enrichment support

