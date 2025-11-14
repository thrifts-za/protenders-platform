# ProTenders Data & ETL Guide
**OCDS Data Synchronization & Enhanced Field Extraction**

**Last Updated:** November 3, 2024
**Version:** 2.0 (Enhanced Fields + Next.js Migration)
**Status:** 🟢 Active

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Data Sources](#data-sources)
3. [Enhanced Database Schema](#enhanced-database-schema)
4. [OCDS Sync Process](#ocds-sync-process)
5. [Enhanced Field Extraction](#enhanced-field-extraction)
6. [Data Quality & Validation](#data-quality--validation)
7. [ETL Operations](#etl-operations)
8. [Troubleshooting](#troubleshooting)

---

## 📊 Overview

### What is OCDS?

**OCDS** (Open Contracting Data Standard) is an international standard for publishing procurement data. South Africa's National Treasury provides tender data via the OCDS API.

**Official API:** `https://ocds-api.etenders.gov.za/api/v1`

###

 ProTenders ETL Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                OCDS API (etenders.gov.za)                    │
│             22,000+ tenders (2021-present)                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Sync Job (Every 6 hours)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Data Extraction & Normalization                 │
│  • Parse OCDS JSON releases                                  │
│  • Extract 30+ fields (12 new enhanced fields)               │
│  • Normalize data formats                                    │
│  • Calculate data quality scores                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              PostgreSQL Database (Render)                    │
│  • OCDSRelease table (main tender data)                      │
│  • Indexed for fast search                                   │
│  • Full-text search enabled                                  │
│  • Connection: dpg-d41gqlmr433s73dvl3cg-a                    │
└─────────────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                 Next.js Application                          │
│  • Search & filter tenders                                   │
│  • Display tender details                                    │
│  • AI intelligence layer                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🌐 Data Sources

### Primary Source: OCDS API

**Base URL:** `https://ocds-api.etenders.gov.za/api/v1`

**Key Endpoints:**

1. **Get Releases by Date Range**
   ```
   GET /releases?releaseDate_gte=2024-01-01&releaseDate_lte=2024-12-31&limit=1000
   ```

2. **Get Single Release**
   ```
   GET /release/{ocid}
   ```

3. **Get Tender Package**
   ```
   GET /package/{ocid}
   ```

**Response Format:**
```json
{
  "releases": [
    {
      "ocid": "ocds-etenders-za-125566",
      "id": "ocds-etenders-za-125566-2024-01-15",
      "date": "2024-01-15T10:30:00Z",
      "tag": ["tender"],
      "initiationType": "tender",
      "parties": [...],
      "buyer": {...},
      "tender": {
        "id": "125566",
        "title": "Supply and delivery of office furniture",
        "description": "...",
        "status": "active",
        "procurementMethod": "open",
        "procurementMethodDetails": "Open Tender",
        "mainProcurementCategory": "goods",
        "value": {
          "amount": 2500000,
          "currency": "ZAR"
        },
        "tenderPeriod": {
          "startDate": "2024-01-15T00:00:00Z",
          "endDate": "2024-02-15T11:00:00Z"
        },
        "enquiryPeriod": {
          "endDate": "2024-02-10T11:00:00Z"
        },
        "documents": [...],
        "deliveryLocations": [...],
        "selectionCriteria": {...}
      }
    }
  ]
}
```

### Secondary Source: HTML Scraping (Optional)

**URL Pattern:** `https://www.etenders.gov.za/Tenders/Details/{tenderId}`

**Use Case:** Extract fields not available in OCDS API (briefing sessions)

**Note:** Currently not used in Next.js app, but available if needed.

---

## 💾 Enhanced Database Schema

### OCDSRelease Model (Prisma Schema)

**File:** `prisma/schema.prisma`

```prisma
model OCDSRelease {
  id        String   @id @default(cuid())
  ocid      String   @unique
  releaseId String?

  // Basic Information
  title         String?
  description   String?  @db.Text
  buyerName     String?
  buyerId       String?
  buyerIdentifier String?

  // Classification
  category      String?  // goods, services, works

  // Financial
  value         Decimal? @db.Decimal(15, 2)
  currency      String?  @default("ZAR")

  // Dates
  publishedAt   DateTime?
  updatedAt     DateTime  @updatedAt
  closingAt     DateTime?
  createdAt     DateTime  @default(now())

  // Status
  status        String?   // active, cancelled, awarded, etc.

  // Submission
  submissionMethods String[]

  // Documents
  documents     Json?

  // Source Data
  tender        Json?
  parties       Json?
  awards        Json?

  // ============================================
  // ✨ ENHANCED FIELDS (Added Nov 2024)
  // ============================================

  // Tender Classification
  tenderType           String?   // Open Tender, RFQ, RFP, etc.

  // Geographic
  province             String?   // Gauteng, Western Cape, etc.
  deliveryLocation     String?   // Full delivery address/description

  // Requirements & Conditions
  specialConditions    String?   @db.Text

  // Contact Information
  contactPerson        String?
  contactEmail         String?
  contactTelephone     String?

  // Additional Dates
  enquiryDeadline      DateTime?

  // Briefing Sessions (from HTML scraping - optional)
  briefingDate         String?
  briefingTime         String?
  briefingVenue        String?
  briefingMeetingLink  String?

  // Data Quality
  dataQualityScore     Int?      // 0-100

  // ============================================
  // INDEXES for Performance
  // ============================================

  @@index([ocid])
  @@index([status])
  @@index([closingAt(sort: Desc)])
  @@index([publishedAt(sort: Desc)])
  @@index([category])
  @@index([buyerName])

  // New indexes for enhanced fields
  @@index([province])
  @@index([tenderType])
  @@index([enquiryDeadline])
  @@index([province, status])
  @@index([tenderType, closingAt(sort: Desc)])

  @@map("ocds_releases")
}
```

### Field Descriptions

| Field | Type | Source | Description |
|-------|------|--------|-------------|
| **ocid** | String | OCDS API | Unique tender identifier |
| **title** | String | `tender.title` | Tender title |
| **description** | Text | `tender.description` | Full tender description |
| **buyerName** | String | `buyer.name` or `parties[role=buyer].name` | Procuring entity name |
| **category** | String | `tender.mainProcurementCategory` | goods/services/works |
| **value** | Decimal | `tender.value.amount` | Estimated contract value |
| **publishedAt** | DateTime | `date` | Publication date |
| **closingAt** | DateTime | `tender.tenderPeriod.endDate` | Tender closing date |
| **status** | String | `tender.status` | active/cancelled/awarded |
| **submissionMethods** | String[] | `tender.submissionMethod` | electronic/email/physical |
| **tenderType** ✨ | String | `tender.procurementMethodDetails` | Open Tender, RFQ, RFP, etc. |
| **province** ✨ | String | `parties[role=procuringEntity].address.region` | SA Province |
| **deliveryLocation** ✨ | String | `tender.deliveryLocations[].description` | Delivery address |
| **specialConditions** ✨ | Text | `tender.eligibilityCriteria` | Special requirements |
| **contactPerson** ✨ | String | `parties.contactPoint.name` | Contact person name |
| **contactEmail** ✨ | String | `parties.contactPoint.email` | Contact email |
| **contactTelephone** ✨ | String | `parties.contactPoint.telephone` | Contact phone |
| **enquiryDeadline** ✨ | DateTime | `tender.enquiryPeriod.endDate` | Enquiry deadline |

✨ = Enhanced fields added November 2024

---

## 🔄 OCDS Sync Process

### Sync Job Architecture

**File (Vite - to migrate):** `apps/api/src/jobs/sync.ts`
**File (Next.js - target):** `src/app/api/cron/sync/route.ts`

### Sync Workflow

```typescript
// Simplified sync workflow
async function syncOCDSData() {
  // 1. Determine date range
  const fromDate = getLastSyncDate() || '2024-01-01';
  const toDate = new Date().toISOString().split('T')[0];

  // 2. Fetch releases from OCDS API
  const releases = await fetchOCDSReleases(fromDate, toDate);

  // 3. Process each release
  for (const release of releases) {
    // 3a. Normalize data (extract all fields)
    const normalized = normalizeRelease(release);

    // 3b. Upsert to database
    await prisma.oCDSRelease.upsert({
      where: { ocid: release.ocid },
      update: normalized,
      create: normalized,
    });
  }

  // 4. Update sync state
  await updateLastSyncDate(toDate);

  return {
    processed: releases.length,
    fromDate,
    toDate,
  };
}
```

### Running Sync Jobs

**Development:**
```bash
# Sync last 7 days
npm run sync:run

# Sync specific date range
FROM=2024-01-01 TO=2024-12-31 npm run sync:run:range

# Sync with custom page size
PAGE_SIZE=5000 npm run sync:run
```

**Production (Automatic):**
- Vercel Cron: Runs every 6 hours via `/api/cron/sync`
- GitHub Actions: Scheduled workflow
- External Cron: cron-job.org hits endpoint

**Manual Trigger (Production):**
```bash
# Hit cron endpoint with secret
curl -X GET "https://protenders.co.za/api/cron/sync" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## ✨ Enhanced Field Extraction

### Tender Type Extraction

**Algorithm:**
```typescript
function extractTenderType(tender: any): string | null {
  // Priority 1: Use procurementMethodDetails (most specific)
  if (tender.procurementMethodDetails) {
    return tender.procurementMethodDetails;
  }

  // Priority 2: Map procurementMethod to common types
  const method = tender.procurementMethod?.toLowerCase();
  if (!method) return null;

  const typeMapping = {
    'open': 'Open Tender',
    'selective': 'Selective Tender',
    'limited': 'Limited Tender',
    'direct': 'Direct Procurement',
    'request for quotation': 'RFQ',
    'request for proposals': 'RFP',
    'request for information': 'RFI',
  };

  for (const [key, value] of Object.entries(typeMapping)) {
    if (method.includes(key)) {
      return value;
    }
  }

  return tender.procurementMethod;
}
```

**Results (Nov 2024 testing):**
- ✅ 176/176 tenders (100%) have tender type populated
- Common values: "Open Tender", "RFQ", "RFP", "Selective Tender"

### Province Extraction

**Algorithm:**
```typescript
function extractProvince(release: any): string | null {
  // Find procuring entity or buyer in parties array
  const procuringEntity = release.parties?.find((party: any) =>
    party.roles?.includes('procuringEntity') ||
    party.roles?.includes('buyer')
  );

  if (!procuringEntity) return null;

  // Extract province from address
  const province = procuringEntity.address?.region;

  // Normalize province names
  const provinceMapping = {
    'gauteng': 'Gauteng',
    'western cape': 'Western Cape',
    'kwazulu-natal': 'KwaZulu-Natal',
    'kzn': 'KwaZulu-Natal',
    'eastern cape': 'Eastern Cape',
    'free state': 'Free State',
    'limpopo': 'Limpopo',
    'mpumalanga': 'Mpumalanga',
    'northern cape': 'Northern Cape',
    'north west': 'North West',
  };

  const normalized = province?.toLowerCase();
  return provinceMapping[normalized] || province;
}
```

**Results (Nov 2024 testing):**
- ⚠️ 0/176 tenders (0%) - Province not in OCDS API for SA tenders
- **Workaround:** Extract from buyer name or use manual classification

### Contact Information Extraction

**Algorithm:**
```typescript
function extractContactInfo(release: any): ContactInfo {
  const procuringEntity = release.parties?.find((party: any) =>
    party.roles?.includes('procuringEntity') ||
    party.roles?.includes('buyer')
  );

  if (!procuringEntity?.contactPoint) {
    return { person: null, email: null, telephone: null };
  }

  const contact = procuringEntity.contactPoint;

  return {
    person: contact.name || null,
    email: contact.email || null,
    telephone: contact.telephone || contact.faxNumber || null,
  };
}
```

**Results (Nov 2024 testing):**
- ⚠️ 0/176 tenders (0%) - Contact info not in OCDS API for SA tenders
- **Workaround:** Use buyer email from tender documents or manual entry

### Delivery Location Extraction

**Algorithm:**
```typescript
function extractDeliveryLocation(tender: any): string | null {
  if (!tender.deliveryLocations?.length) return null;

  const locations = tender.deliveryLocations
    .map((loc: any) => {
      // Priority 1: Use description
      if (loc.description) return loc.description;

      // Priority 2: Build from address
      if (loc.address) {
        const parts = [
          loc.address.streetAddress,
          loc.address.locality,
          loc.address.region,
          loc.address.countryName,
        ].filter(Boolean);
        return parts.join(', ');
      }

      return null;
    })
    .filter(Boolean);

  return locations.length > 0 ? locations.join('; ') : null;
}
```

### Data Quality Score

**Algorithm:**
```typescript
function calculateDataQualityScore(normalized: NormalizedTender): number {
  const criticalFields = [
    'title', 'description', 'buyerName', 'closingAt',
    'publishedAt', 'category', 'status'
  ];

  const enhancedFields = [
    'tenderType', 'province', 'deliveryLocation',
    'contactPerson', 'contactEmail', 'contactTelephone',
    'enquiryDeadline', 'specialConditions'
  ];

  const allFields = [...criticalFields, ...enhancedFields];

  const filledFields = allFields.filter(
    field => normalized[field] != null && normalized[field] !== ''
  ).length;

  return Math.round((filledFields / allFields.length) * 100);
}
```

**Score Interpretation:**
- **90-100%**: Excellent - All fields populated
- **70-89%**: Good - Most fields available
- **50-69%**: Fair - Basic fields only
- **< 50%**: Poor - Missing critical information

---

## 🔍 Data Quality & Validation

### Field Availability Report (Nov 2024)

Based on real testing with 176 tenders (Nov 1-3, 2024):

| Field | Availability | Source | Notes |
|-------|--------------|--------|-------|
| Tender Number | 100% | OCDS API | Always present |
| Title | 100% | OCDS API | Always present |
| Description | 98% | OCDS API | Rarely missing |
| Buyer Name | 100% | OCDS API | Always present |
| Category | 95% | OCDS API | Usually present |
| Value | 85% | OCDS API | Sometimes estimated |
| Closing Date | 100% | OCDS API | Always present |
| Published Date | 100% | OCDS API | Always present |
| Status | 100% | OCDS API | Always present |
| Documents | 90% | OCDS API | Usually present |
| **Tender Type** ✅ | **100%** | **OCDS API** | **Enhanced extraction** |
| **Enquiry Deadline** ⚠️ | **15%** | **OCDS API** | **Rarely populated** |
| **Delivery Location** ⚠️ | **20%** | **OCDS API** | **Sometimes available** |
| **Special Conditions** ⚠️ | **10%** | **OCDS API** | **Rarely populated** |
| Province ❌ | 0% | - | Not in SA OCDS API |
| Contact Person ❌ | 0% | - | Not in SA OCDS API |
| Contact Email ❌ | 0% | - | Not in SA OCDS API |
| Contact Phone ❌ | 0% | - | Not in SA OCDS API |
| Briefing Details ❌ | 0% | HTML Scraping | Requires scraper |

### Validation Rules

```typescript
// Validation in normalizer
function validateNormalizedData(data: NormalizedTender): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Critical validations
  if (!data.ocid) errors.push('Missing OCID');
  if (!data.title) errors.push('Missing title');
  if (!data.buyerName) warnings.push('Missing buyer name');
  if (!data.closingAt) warnings.push('Missing closing date');

  // Date validations
  if (data.closingAt && data.publishedAt) {
    if (new Date(data.closingAt) < new Date(data.publishedAt)) {
      errors.push('Closing date before published date');
    }
  }

  // Value validations
  if (data.value && data.value < 0) {
    errors.push('Negative tender value');
  }

  return { valid: errors.length === 0, errors, warnings };
}
```

---

## 🛠️ ETL Operations

### Quick Reference Commands

```bash
# ==========================================
# SYNC OPERATIONS
# ==========================================

# Sync recent tenders (last 7 days)
npm run sync:run

# Sync specific date range
FROM=2024-10-01 TO=2024-10-31 npm run sync:run:range

# Sync with larger page size (faster)
PAGE_SIZE=5000 npm run sync:run

# ==========================================
# DATABASE OPERATIONS
# ==========================================

# Generate Prisma client after schema changes
npx prisma generate

# Apply migrations
npx prisma migrate deploy

# Push schema changes (dev)
npx prisma db push

# View database in Prisma Studio
npx prisma studio

# ==========================================
# DATA INSPECTION
# ==========================================

# Count total tenders
SELECT COUNT(*) FROM "ocds_releases";

# Count by status
SELECT status, COUNT(*) FROM "ocds_releases" GROUP BY status;

# Count with tender type
SELECT COUNT(*) FROM "ocds_releases" WHERE "tenderType" IS NOT NULL;

# Count by province
SELECT province, COUNT(*) FROM "ocds_releases"
WHERE province IS NOT NULL GROUP BY province;

# Data quality distribution
SELECT
  CASE
    WHEN "dataQualityScore" >= 90 THEN 'Excellent (90-100%)'
    WHEN "dataQualityScore" >= 70 THEN 'Good (70-89%)'
    WHEN "dataQualityScore" >= 50 THEN 'Fair (50-69%)'
    ELSE 'Poor (<50%)'
  END as quality_tier,
  COUNT(*) as count
FROM "ocds_releases"
WHERE "dataQualityScore" IS NOT NULL
GROUP BY quality_tier;
```

### Backfilling Enhanced Fields

If you have existing tenders without enhanced fields:

```bash
# 1. Update schema
npx prisma db push

# 2. Re-sync recent data (will update existing records)
FROM=2024-01-01 TO=2024-12-31 npm run sync:run:range

# 3. Verify enhanced fields populated
# Run SQL query to check counts
```

---

## 🐛 Troubleshooting

### Issue: Sync Job Fails

**Symptoms:**
- Error: "Failed to fetch OCDS API"
- Timeout errors
- Network errors

**Solutions:**
1. Check OCDS API status: `curl https://ocds-api.etenders.gov.za/api/v1/releases?limit=1`
2. Check network connectivity
3. Reduce PAGE_SIZE if timeout: `PAGE_SIZE=100 npm run sync:run`
4. Add retry logic with exponential backoff

### Issue: Missing Fields After Sync

**Symptoms:**
- `tenderType` is null
- `province` is null
- Other enhanced fields missing

**Solutions:**
1. Check OCDS API response - field may not exist
2. Update normalizer logic to handle missing data
3. Use fallback values or mark as "Unknown"

### Issue: Database Connection Errors

**Symptoms:**
- "Can't reach database server"
- "Too many connections"

**Solutions:**
1. Check `DATABASE_URL` in `.env.local`
2. For Render: Verify database connection using `render psql dpg-d41gqlmr433s73dvl3cg-a`
3. Close Prisma connections properly: `await prisma.$disconnect()`
4. Check Render dashboard for database status and connection limits

### Issue: Slow Sync Performance

**Symptoms:**
- Sync takes >10 minutes
- API timeouts

**Solutions:**
1. Increase `PAGE_SIZE`: `PAGE_SIZE=2000 npm run sync:run`
2. Use date range to sync incrementally
3. Add database indexes (already in schema)
4. Use batch upserts instead of individual inserts

---

## 📊 Statistics & Insights

### Current Database Stats (Example)

```sql
-- Total tenders
SELECT COUNT(*) as total_tenders FROM "ocds_releases";
-- Result: 48,052

-- Active tenders
SELECT COUNT(*) as active_tenders FROM "ocds_releases"
WHERE status = 'active' AND "closingAt" > NOW();
-- Result: 2,247

-- Tenders by category
SELECT category, COUNT(*) as count FROM "ocds_releases"
WHERE category IS NOT NULL GROUP BY category ORDER BY count DESC;
-- Results:
-- goods: 25,840
-- works: 15,612
-- services: 6,600

-- Enhanced field population
SELECT
  COUNT(*) FILTER (WHERE "tenderType" IS NOT NULL) as with_type,
  COUNT(*) FILTER (WHERE province IS NOT NULL) as with_province,
  COUNT(*) FILTER (WHERE "contactEmail" IS NOT NULL) as with_email
FROM "ocds_releases";
-- Results:
-- with_type: 48,052 (100%)
-- with_province: 0 (0% - not in SA OCDS API)
-- with_email: 0 (0% - not in SA OCDS API)
```

---

## 📋 Conclusion

The ProTenders ETL pipeline provides:

1. ✅ **Automated OCDS Sync** - Every 6 hours
2. ✅ **Enhanced Field Extraction** - 12 new fields added (Nov 2024)
3. ✅ **100% Tender Type Coverage** - Successfully extracted
4. ✅ **Data Quality Scoring** - Automatic quality assessment
5. ⚠️ **Known Limitations** - Province/contact info not in SA OCDS API
6. ✅ **Scalable Architecture** - Handles 48K+ tenders efficiently

**Next Steps:**
- Implement HTML scraping for missing fields (optional)
- Add manual province classification
- Enhance data quality with external sources

---

**Document Owner:** Data Team
**Last Updated:** November 3, 2024
**Database:** PostgreSQL (Prisma ORM)
**Status:** 🟢 Production Ready

---

*This is a living document. Update as ETL processes evolve.*
