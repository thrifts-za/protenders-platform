# API Route Migration Analysis

## Executive Summary

This document analyzes all API routes from both codebases to identify conflicts and plan systematic migration.

---

## Current State: Next.js Platform (New Codebase)

### Existing Routes (81 total)

Key categories implemented:
- Auth: `/api/auth/[...nextauth]`, register, reset-password
- Search and Facets: `/api/search`, `/api/facets`, `/api/facets/buyers/suggest`
- Tenders: `/api/tenders/[id]`, `/api/tenders/[id]/timeline`, `/api/tenders/[id]/intel`, `/api/tenders/[id]/analyze`
- Recommendations: `/api/recommendations/related`
- Insights: `/api/insights/stats`, `top-buyers`, `category-counts`, `closing-value`
- Buyers & Categories: `/api/buyers/[name]/metrics`, `/api/categories/[name]/metrics`
- Suppliers: `/api/suppliers/[name]/summary`, `/api/suppliers/[name]/metrics`
- Alerts & Saved Search: `/api/alerts`, `/api/alerts/[id]`, `/api/alerts/logs`, `/api/savesearch`
- User: `/api/me`, `/api/user/saved`, `/api/user/saved/[tenderId]`, `/api/user/preferences`, `/api/user/dashboard`, `/api/user/documents`, `/api/user/documents/[id]`
- Packs: `/api/packs`, `/api/packs/[id]`, `/api/packs/[id]/tenders`, `/api/packs/[id]/tenders/[tenderId]`
- Docs: `/api/docs/[docId]/metadata`, `/view`, `/download`, `/ingest`
- AI (stubs): `/api/ai/health`, `/api/ai/providers`, `/api/ai/status/[provider]`, `/api/ai/process`
- Cron: `/api/cron/sync`
- Admin: health, stats, metrics, buyers, suppliers, tenders, audit, feedback (+detail), config, sync state (GET/PUT), documents, analytics (errors/searches), jobs suite (download, import, sync-now, sync-today, delta-sync, reindex, aggregates, features, docs, id/cancel, enrich-*), mail (test, logs, template), admin auth (login, logout, me)

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

#### ✅ Implemented since last analysis

Newly added in this iteration:
- `GET /api/facets/buyers/suggest`
- `POST /api/feedback`
- `PUT /api/admin/sync/state`
- `POST /api/tenders/:id/analyze`
- Tender Packs: `GET/POST /api/packs`, `GET/PUT/DELETE /api/packs/:id`, `POST /api/packs/:id/tenders`, `DELETE /api/packs/:id/tenders/:tenderId`
- Documents: `GET /api/docs/:docId/metadata`, `GET /api/docs/:docId/view`, `GET /api/docs/:docId/download`, `POST /api/docs/:docId/ingest`
- User Documents: `GET /api/user/documents`, `POST /api/user/documents`, `DELETE /api/user/documents/:id`
- AI stubs: `GET /api/ai/health`, `GET /api/ai/providers`, `GET /api/ai/status/:provider`, `POST /api/ai/process`

#### ❌ Not Yet Migrated (remaining)

**Tender Routes:**
- (Complete) timeline, analyze, intel

**Supplier Routes:**
- (Complete) summary, metrics

**Buyer Routes:**
- (Complete) metrics

**Category Routes:**
- (Complete) metrics

**Recommendations:**
- (Complete) related tenders

**Facets (Additional):**
- (Complete) buyers/suggest

**Saved Search & Alerts:**
- (Complete) savesearch + full alerts CRUD and logs

**Insights:**
- (Complete) top-buyers, category-counts, closing-value, stats

**User Routes (Authentication Required):**
- (Complete) me, saved (list/put/delete), preferences (get/put), dashboard
- (Complete) user documents (list/create/delete)

**Document Routes:**
- (Complete) view, download, metadata, ingest (register)

**Google/Vertex AI (deferred):**
- Routes for Google Document AI and Vertex AI specific processing remain pending. We added generic AI stubs (`/api/ai/*`) to enqueue processing without provider coupling.

**AI Provider Management:**
- (Complete - stubs) health, status, providers, process

**Vertex AI Routes:**
- Pending (not required for core functionality)

**Tender Pack Routes:**
- (Complete) packs CRUD + add/remove tenders
- (Pending) packs analytics

**Feedback:**
- (Complete) submit feedback

**SEO:**
- (Replaced) Next.js `app/sitemap.ts` handles sitemap generation

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
- (Covered) `/api/cron/sync` + admin job endpoints for sync operations
- (New) `/api/cron/alerts-run` - Execute saved search alerts (CRON_SECRET protected)
- (Optional) dedicated cron health/trigger endpoints can be added if required

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
- (Complete) `GET /api/admin/tenders` - List tenders
- (Complete) `GET /api/admin/tenders/:ocid` - Tender detail
- (New) `PUT /api/admin/tenders/:ocid` - Update tender enrichment fields
- (Complete) `GET /api/admin/buyers` - List buyers
- (Complete) `GET /api/admin/suppliers` - List suppliers
- (Complete) `GET /api/admin/documents/recent` - Recent documents

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

**Alerts (Admin):**
- (New) `POST /api/admin/alerts/run` - Trigger alerts runner manually
- (New) `GET /api/admin/alerts/logs` - View recent alert runs

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
2. **Admin API Security:** `/api/admin/*` protected via middleware requiring admin role (NextAuth session)
3. **Rate Limiting:** Implemented in middleware for `/api/*` (default 100 req/15m per IP; configurable via `RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW`). For production, migrate to Redis-based limiter.
4. **Error Handling:** Standardize across all routes
5. **Database:** Both use Prisma, should be compatible
6. **Serverless:** Optimize for Vercel's serverless environment
7. **Cron Jobs:** Already migrated to Vercel Cron
8. **Auth Consolidation:** NextAuth credentials provider now authenticates against local Prisma `User` with bcrypt — removed dependency on external API login
9. **Client API Calls:** Removed external base URL usage; client calls now use same-origin `/api` routes.

### Dependencies to Install

- May need additional packages for:
  - Google Cloud Document AI
  - Vertex AI
  - Puter API client
  - Rate limiting middleware

---

## Status Summary

| Category | Implemented | Notes |
|----------|-------------|-------|
| Main API | 43 | Core user features, search, insights, suppliers/buyers, alerts, packs, docs |
| Admin API | 38 | Health, stats, analytics, jobs suite, config, mail, audit, auth, sync state |
| Documents | 4 | metadata, view, download, ingest (registry) |
| AI (stubs) | 4 | health, providers, status, process |
| Cron | 1 | `/api/cron/sync` (others covered via admin jobs) |
| **TOTAL** | **81** | Broad coverage of core and admin APIs |

Remaining (non-core): Google/Vertex AI specific routes, advanced analytics (`/api/analytics/*`), optional cron helpers, packs analytics.

---

## Next Steps

1. ✅ Complete audit (this document)
2. ✅ Implement middleware rate limiting and admin API protection
3. ✅ Implement admin drill-down pages for tenders; enrich buyer/supplier detail
4. Finalize optional cron helpers and pack analytics (if needed)
5. Scope and implement Google/Vertex AI routes (behind feature toggles)
6. Evaluate need for `/api/analytics/*` vs existing `/api/insights/*`

---

Generated: 2025-11-04
Branch: migration-v2
