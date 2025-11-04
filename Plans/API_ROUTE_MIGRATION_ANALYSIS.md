# API Route Migration Analysis

## Executive Summary

This document analyzes all API routes from both codebases to identify conflicts and plan systematic migration.

---

## Current State: Next.js Platform (New Codebase)

### Existing Routes (8 total)

| Route Path | Method | Status |
|------------|--------|--------|
| `/api/auth/[...nextauth]` | ALL | ✅ Complete (NextAuth.js) |
| `/api/admin/health` | GET | ✅ Complete |
| `/api/admin/jobs` | GET, POST | ✅ Complete |
| `/api/admin/stats` | GET | ✅ Complete |
| `/api/facets` | GET | ✅ Complete |
| `/api/search` | GET | ✅ Complete |
| `/api/tenders/[id]` | GET | ✅ Complete |
| `/api/cron/sync` | POST | ✅ Complete |

---

## Old TenderAPI Codebase (Express API)

### API Routes Overview

Total routes identified: **~100+ routes** across 4 modules:
1. **Main API Routes** (`/api/*`) - ~80 routes
2. **Admin Routes** (`/api/admin/*`) - ~20 routes
3. **Analytics Routes** (`/api/analytics/*`) - ~5 routes
4. **Document Routes** (`/api/docs/*`) - ~4 routes

---

## Detailed Route Analysis

### 1. Main API Routes (`/api/*`)

#### ✅ Already Migrated (Conflict Analysis)

| Old Route | New Route | Conflict? | Notes |
|-----------|-----------|-----------|-------|
| `GET /api/search` | `GET /api/search` | ⚠️ **CONFLICT** | Need to compare implementations |
| `GET /api/tenders/:id` | `GET /api/tenders/[id]` | ⚠️ **CONFLICT** | Need to compare implementations |
| `GET /api/facets` | `GET /api/facets` | ⚠️ **CONFLICT** | Need to compare implementations |

#### ❌ Not Yet Migrated (High Priority)

**Tender Routes:**
- `GET /api/tenders/:id/timeline` - Tender timeline view
- `GET /api/tenders/:id/analyze` - Document analysis
- `GET /api/tenders/:id/intel` - AI intelligence

**Supplier Routes:**
- `GET /api/suppliers/:name/summary` - Supplier overview
- `GET /api/suppliers/:name/metrics` - Supplier analytics

**Buyer Routes:**
- `GET /api/buyers/:name/metrics` - Buyer analytics

**Category Routes:**
- `GET /api/categories/:name/metrics` - Category analytics

**Recommendations:**
- `GET /api/recommendations/related` - Related tenders

**Facets (Additional):**
- `GET /api/facets/buyers/suggest` - Buyer autocomplete

**Saved Search & Alerts:**
- `POST /api/savesearch` - Save search criteria
- `GET /api/alerts` - Get user alerts
- `PUT /api/alerts/:id` - Update alert
- `DELETE /api/alerts/:id` - Delete alert
- `GET /api/alerts/logs` - Alert execution logs

**Insights:**
- `GET /api/insights/top-buyers` - Top buyers
- `GET /api/insights/category-counts` - Category distribution
- `GET /api/insights/closing-value` - Value by closing date
- `GET /api/insights/stats` - Overall stats

**User Routes (Authentication Required):**
- `GET /api/me` - User profile
- `GET /api/user/saved` - Saved tenders
- `PUT /api/user/saved/:tenderId` - Save tender
- `DELETE /api/user/saved/:tenderId` - Remove saved tender
- `GET /api/user/preferences` - Get preferences
- `PUT /api/user/preferences` - Update preferences
- `GET /api/user/dashboard` - User dashboard
- `GET /api/user/documents` - User documents (Puter)
- `POST /api/user/documents` - Upload document (Puter)

**Document Routes:**
- `GET /api/docs/:docId/view` - View document inline
- `GET /api/docs/:docId/download` - Download document
- `GET /api/docs/:docId/metadata` - Document metadata
- `POST /api/docs/:docId/ingest` - Trigger ingestion

**Google Document AI:**
- `POST /api/docs/:ocid/:docId/process` - Process with Document AI
- `GET /api/docs/:docId/insights` - Extract insights
- `GET /api/docs/processed` - Get processed docs

**AI Provider Management:**
- `GET /api/ai/health` - Health check all providers
- `GET /api/ai/status/:provider` - Provider status
- `GET /api/ai/providers` - Get recommended provider
- `POST /api/ai/process` - Process with AI

**Vertex AI Routes:**
- `POST /api/ai/vertex/init` - Initialize analysis
- `GET /api/ai/vertex/analytics` - Generate insights
- `POST /api/ai/vertex/predict/:ocid` - Predict success
- `GET /api/ai/vertex/trends` - Market trends

**Tender Pack Routes:**
- `POST /api/packs` - Create pack
- `POST /api/tenders/:id/pack` - Create from tender
- `GET /api/packs` - List packs
- `GET /api/packs/:packId` - Get pack
- `PUT /api/packs/:packId` - Update pack
- `DELETE /api/packs/:packId` - Delete pack
- `POST /api/packs/:packId/tenders/:tenderId` - Add tender
- `DELETE /api/packs/:packId/tenders/:tenderId` - Remove tender
- `GET /api/packs/:packId/analytics` - Pack analytics

**Feedback:**
- `POST /api/feedback` - Submit feedback

**SEO:**
- `GET /api/sitemap.xml` - Generate sitemap

**AI Intelligence (Advanced):**
- `POST /api/ai/process-historical-data` - Process historical
- `GET /api/ai/health` - AI health
- `GET /api/ai/tenders/:tenderId/opportunity-score` - Score
- `GET /api/ai/tenders/:tenderId/financial-intelligence` - Financial
- `GET /api/ai/tenders/:tenderId/competitor-intelligence` - Competitor
- `GET /api/ai/tenders/:tenderId/document-analysis` - Document
- `GET /api/ai/tenders/:tenderId/bid-strategy` - Strategy
- `GET /api/ai/tenders/:tenderId/intelligence` - Full intel
- `GET /api/ai/market-insights` - Market insights

**Multi-Million Dollar AI System:**
- `POST /api/ai/initialize` - Initialize AI
- `GET /api/ai/status` - AI status
- `POST /api/ai/tenders/:tenderId/analyze` - Analyze
- `GET /api/ai/market-insights` - Market insights

**Strategic AI System:**
- `POST /api/ai/strategic/initialize` - Initialize
- `GET /api/ai/strategic/status` - Status
- `POST /api/ai/strategic/tenders/:tenderId/analyze` - Analyze
- `GET /api/ai/strategic/tenders/:tenderId/intelligence` - Intel

**Cron Routes:**
- `POST /api/cron/delta-sync` - Delta sync
- `POST /api/cron/nightly-sync` - Nightly sync
- `GET /api/cron/health` - Health check
- `POST /api/cron/trigger-now` - Manual trigger

**Health:**
- `GET /api/health` - API health

---

### 2. Admin API Routes (`/api/admin/*`)

#### ✅ Already Migrated

| Old Route | New Route | Conflict? | Notes |
|-----------|-----------|-----------|-------|
| N/A | `GET /api/admin/health` | ✅ New only | Admin health check |
| `GET /api/admin/jobs` | `GET /api/admin/jobs` | ⚠️ **CONFLICT** | Need to compare |
| N/A | `GET /api/admin/stats` | ✅ New only | Admin stats |

#### ❌ Not Yet Migrated

**Auth Routes:**
- `POST /api/admin/auth/login` - Admin login
- `POST /api/admin/auth/logout` - Admin logout
- `GET /api/admin/auth/me` - Current admin user

**Dashboard:**
- `GET /api/admin/metrics` - Dashboard metrics

**Jobs (Additional):**
- `POST /api/admin/jobs/download` - Trigger download
- `POST /api/admin/jobs/import` - Trigger import
- `POST /api/admin/jobs/sync-now` - Sync now
- `POST /api/admin/jobs/sync-today` - Sync today
- `POST /api/admin/jobs/delta-sync` - Delta sync
- `POST /api/admin/jobs/reindex` - Reindex
- `POST /api/admin/jobs/aggregates` - Run aggregates
- `POST /api/admin/jobs/features` - Run features
- `POST /api/admin/jobs/docs` - Ingest docs
- `POST /api/admin/jobs/:id/cancel` - Cancel job

**Sync State:**
- `GET /api/admin/sync/state` - Get sync state

**Analytics:**
- `GET /api/admin/analytics/searches` - Search analytics
- `GET /api/admin/analytics/errors` - Error logs

**Catalog:**
- `GET /api/admin/tenders` - List tenders
- `GET /api/admin/tenders/:ocid` - Tender detail
- `GET /api/admin/buyers` - List buyers
- `GET /api/admin/suppliers` - List suppliers
- `GET /api/admin/documents/recent` - Recent documents

**Config & Mail:**
- `GET /api/admin/config` - Get config
- `PUT /api/admin/config/toggles` - Update toggles
- `GET /api/admin/mail/logs` - Mail logs
- `POST /api/admin/mail/test` - Test email
- `PUT /api/admin/mail/template` - Update template

**Audit:**
- `GET /api/admin/audit` - Audit logs

**Feedback:**
- `GET /api/admin/feedback` - All feedback
- `PATCH /api/admin/feedback/:id` - Update status

---

### 3. Analytics Routes (`/api/analytics/*`)

#### ❌ All Need Migration

- `GET /api/analytics/coverage` - Coverage stats
- `GET /api/analytics/category/:category` - Category stats
- `GET /api/analytics/buyer/:name` - Buyer stats
- `GET /api/analytics/dq/latest` - Latest DQ report
- `POST /api/analytics/dq/run` - Run DQ check

---

### 4. Document Routes (`/api/docs/*`)

#### ❌ All Need Migration

- `GET /api/docs/:docId/view` - View document
- `GET /api/docs/:docId/download` - Download document
- `POST /api/docs/:docId/ingest` - Ingest document
- `GET /api/docs/:docId/metadata` - Get metadata

---

## Migration Strategy

### Phase 2A: Conflict Resolution (Highest Priority)

**Step 1: Compare Existing Routes**
- Compare `/api/search` implementations
- Compare `/api/tenders/[id]` implementations
- Compare `/api/facets` implementations
- Compare `/api/admin/jobs` implementations

**Decision:** Merge or replace based on which has better implementation.

### Phase 2B: Core Functionality Routes

**Priority 1: Authentication & User Management**
- Migrate `/api/me` and user routes
- Ensure NextAuth.js integration
- Migrate saved tenders, preferences, dashboard

**Priority 2: Alerts & Saved Searches**
- Critical user feature
- Migrate alert CRUD operations
- Migrate alert logs

**Priority 3: Enhanced Tender Data**
- Timeline, analysis, intelligence
- Supplier & buyer metrics
- Category metrics
- Related tenders

### Phase 2C: Insights & Analytics

- Insights routes (top buyers, stats, etc.)
- Analytics routes (coverage, DQ, etc.)

### Phase 2D: Advanced AI Features

- AI intelligence routes
- Document AI processing
- Vertex AI predictions
- Strategic AI system

### Phase 2E: Admin Features

- Complete admin routes
- Sync state management
- Catalog management
- Config & mail
- Audit logs

### Phase 2F: Document Management

- Document proxy routes
- Google Document AI
- Puter integration

### Phase 2G: Additional Features

- Tender packs
- Feedback system
- SEO sitemap

---

## Migration Notes

### Key Considerations

1. **Authentication:** Old system uses cookie-session, new uses NextAuth.js
2. **Rate Limiting:** Need to implement in Next.js middleware
3. **Error Handling:** Standardize across all routes
4. **Database:** Both use Prisma, should be compatible
5. **Serverless:** Optimize for Vercel's serverless environment
6. **Cron Jobs:** Already migrated to Vercel Cron

### Dependencies to Install

- May need additional packages for:
  - Google Cloud Document AI
  - Vertex AI
  - Puter API client
  - Rate limiting middleware

---

## Status Summary

| Category | Total Routes | Migrated | Remaining | % Complete |
|----------|--------------|----------|-----------|------------|
| Main API | ~80 | 3 | ~77 | 4% |
| Admin API | ~20 | 3 | ~17 | 15% |
| Analytics | ~5 | 0 | ~5 | 0% |
| Documents | ~4 | 0 | ~4 | 0% |
| **TOTAL** | **~109** | **6** | **~103** | **6%** |

---

## Next Steps

1. ✅ Complete audit (this document)
2. Compare conflicting routes (search, tenders, facets, admin/jobs)
3. Create migration order based on dependencies
4. Start with Phase 2A: Conflict Resolution
5. Then proceed with Phase 2B: Core Functionality

---

Generated: 2025-11-04
Branch: migration-v2
