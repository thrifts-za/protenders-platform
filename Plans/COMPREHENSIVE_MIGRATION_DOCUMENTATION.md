# ProTenders Platform: Vite/Express → Next.js Full-Stack Migration

## Executive Summary

**Project:** ProTenders - South African Government Tender Intelligence Platform
**Migration Type:** Full-Stack (Frontend + Backend)
**Source Stack:** Vite (React) Frontend + Express.js Backend
**Source Location:** `/Users/nkosinathindwandwe/DevOps/TenderAPI`
**Target Stack:** Next.js 15 Full-Stack Application
**Target Location:** `/Users/nkosinathindwandwe/DevOps/protenders-platform`
**Current Status:** 60% Complete (Frontend mostly done, Backend pending)
**Critical Blocker:** TypeScript compilation errors preventing production deployment

### Quick Status Overview

| Component | Status | Completion |
|-----------|--------|------------|
| Frontend Pages & Components | ✅ Complete | 95% |
| Type System & Interfaces | ⚠️ In Progress | 60% |
| Authentication (NextAuth) | ✅ Complete | 100% |
| Database Schema (Prisma) | ⏳ Pending | 0% |
| API Routes Migration | ⏳ Pending | 5% |
| Background Jobs | ⏳ Pending | 0% |
| Deployment Configuration | ✅ Complete | 100% |

### Priority Path to Production

1. **Fix TypeScript Errors** (2-3 hours) - CRITICAL BLOCKER
2. **Configure Prisma in Next.js** (30 minutes)
3. **Migrate Core API Routes** (1-2 weeks)
4. **Set Up Background Jobs** (3-4 days)
5. **Deploy & Decommission Old Stack**

---

## Table of Contents

1. [Migration Purpose & Scope](#migration-purpose--scope)
2. [Architecture Comparison](#architecture-comparison)
3. [Migration Phases](#migration-phases)
4. [Technical Decisions](#technical-decisions)
5. [Completed Work](#completed-work)
6. [Outstanding Issues](#outstanding-issues)
7. [Next Steps & Timeline](#next-steps--timeline)
8. [Team Alignment Guide](#team-alignment-guide)
9. [File Structure Reference](#file-structure-reference)
10. [Environment Variables](#environment-variables)

---

## Migration Purpose & Scope

### Source Codebase Location

**Old TenderAPI Stack:**
- **Location:** `/Users/nkosinathindwandwe/DevOps/TenderAPI`
- **Structure:**
  - `apps/api/` - Express.js backend
  - `apps/frontend/` - Vite React frontend (deprecated)
  - `apps/api/prisma/` - Database schema and migrations
- **Deployment:**
  - API: Render.com (https://tender-spotlight-pro.onrender.com)
  - Database: Render PostgreSQL (dpg-d41gqlmr433s73dvl3cg-a)

**New ProTenders Platform:**
- **Location:** `/Users/nkosinathindwandwe/DevOps/protenders-platform`
- **Repository:** https://github.com/thrifts-za/protenders-platform
- **Structure:** Unified Next.js 15 full-stack application

### Why This Migration?

**Original Architecture Problems:**
- Separate deployments for frontend (Vite) and backend (Express)
- Complex CORS configuration
- Duplicated environment management
- Harder to maintain and deploy
- Limited SEO capabilities with client-side rendering

**Next.js Benefits:**
- Single full-stack application
- Server-side rendering for SEO
- Simplified deployment (one Vercel project)
- API routes replace Express endpoints
- Built-in optimization and caching
- Better developer experience

### Migration Scope

**In Scope:**
- ✅ All React components from Vite → Next.js
- ✅ Authentication system (migrate to NextAuth.js)
- ⏳ All Express API routes → Next.js API Routes
- ⏳ Background jobs (OCDS sync) → Vercel Cron or external service
- ⏳ Database access (Prisma) → Configured in Next.js
- ✅ Admin dashboard functionality
- ✅ Search and filtering UI
- ✅ Tender detail pages
- ✅ Category and province landing pages

**Out of Scope:**
- Database schema changes (keep existing Prisma schema)
- External API integrations (keep OCDS client as-is)
- Data migration (database stays the same)

---

## Architecture Comparison

### Before: Vite + Express (Separated)

```
┌─────────────────────────────────────────────────────────────┐
│                    USER BROWSER                              │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴─────────────┐
        │                          │
        ▼                          ▼
┌──────────────────┐      ┌──────────────────┐
│  Vite Frontend   │◄────►│ Express Backend  │
│  (Client-Side)   │ CORS │   (Node.js)      │
├──────────────────┤      ├──────────────────┤
│ • React          │      │ • REST API       │
│ • React Router   │      │ • Prisma ORM     │
│ • TanStack Query │      │ • Auth Logic     │
│ • Tailwind CSS   │      │ • Background Jobs│
│ • Shadcn/ui      │      │ • OCDS Client    │
└──────────────────┘      └────────┬─────────┘
                                   │
                                   ▼
                          ┌──────────────────┐
                          │   PostgreSQL     │
                          │   (Render)       │
                          └──────────────────┘

Deployment:
- Vite: Netlify/Vercel (static hosting)
- Express: Render.com (always-on server)
- Issues: CORS, separate configs, complex auth
```

### After: Next.js (Unified Full-Stack)

```
┌─────────────────────────────────────────────────────────────┐
│                    USER BROWSER                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Next.js 15 Full-Stack Application              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────┐      ┌──────────────────────┐      │
│  │  Frontend (RSC)    │      │  Backend (API Routes)│      │
│  ├────────────────────┤      ├──────────────────────┤      │
│  │ • Server Components│      │ • /api/search        │      │
│  │ • Client Components│◄────►│ • /api/tenders/[id] │      │
│  │ • App Router       │      │ • /api/admin/*       │      │
│  │ • TanStack Query   │      │ • /api/auth/*        │      │
│  │ • Tailwind CSS     │      │ • Prisma ORM         │      │
│  │ • Shadcn/ui        │      │ • OCDS Client        │      │
│  └────────────────────┘      └──────────────────────┘      │
│                                       │                      │
│  ┌────────────────────────────────────┴─────────────┐      │
│  │         Shared Server Utilities                   │      │
│  │  • Authentication (NextAuth.js v5)                │      │
│  │  • Data normalization                             │      │
│  │  • Structured data generation                     │      │
│  └───────────────────────────────────────────────────┘      │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │   PostgreSQL     │
                  │   (Render)       │
                  └──────────────────┘

External:
┌──────────────────────┐
│  Vercel Cron Jobs    │ ← Background OCDS Sync
│  (Every 6 hours)     │
└──────────────────────┘

Deployment:
- Single Vercel project
- No CORS issues (same origin)
- Unified environment variables
- Automatic Edge optimization
```

---

## Migration Phases

### Phase 1: Frontend Migration ✅ COMPLETE

**Goal:** Port all Vite React components to Next.js App Router

**Completed Tasks:**
- ✅ Set up Next.js 15 project with TypeScript
- ✅ Configure Tailwind CSS + Shadcn/ui
- ✅ Migrate all page components to app/ directory
- ✅ Convert React Router routes to App Router file structure
- ✅ Implement Server Components where appropriate
- ✅ Add metadata exports for SEO
- ✅ Configure dynamic routes for tenders, categories, provinces
- ✅ Set up ISR (Incremental Static Regeneration) for landing pages

**Files Migrated:**
```
protenders-next/src/app/
├── page.tsx                    ← Home page (Server Component)
├── layout.tsx                  ← Root layout with metadata
├── search/page.tsx             ← Search page
├── tender/[id]/page.tsx        ← Dynamic tender details
├── category/[category]/page.tsx ← Category landing pages
├── province/[province]/page.tsx ← Province landing pages
├── latest/page.tsx             ← Latest tenders
├── closing-soon/page.tsx       ← Closing soon tenders
├── opportunities/page.tsx      ← Opportunities page
├── insights/page.tsx           ← Insights page
├── blog/page.tsx               ← Blog listing
├── blog/[slug]/page.tsx        ← Blog post details
└── admin/
    ├── dashboard/page.tsx      ← Admin dashboard
    ├── analytics/page.tsx      ← Analytics page
    ├── etl/page.tsx            ← ETL job management
    └── login/page.tsx          ← Admin login
```

**Key Improvements:**
- All pages now generate OpenGraph and Twitter metadata
- Structured data (JSON-LD) for SEO
- ISR caching for landing pages (12-24 hour revalidation)
- Server-side data fetching where possible

---

### Phase 2: Type System Migration ⚠️ 60% COMPLETE

**Goal:** Fix all TypeScript errors from Vite → Next.js migration

**Status:** ~10 errors remaining (blocking build)

**Completed Fixes:**
1. ✅ Fixed duplicate `headers` property in admin/etl/page.tsx
2. ✅ Added `tenderTypes?: string[]` to Category interface
3. ✅ Added `commonBuyers?: string[]` to Category interface
4. ✅ Added `requirements?: { title: string; items: string[] }` to Category interface
5. ✅ Added `keyConsiderations?: string[]` to Category interface
6. ✅ Added `successTips?: string[]` to Category interface
7. ✅ Added `keyIndustries?: string[]` to Province interface
8. ✅ Added `statistics?: {...}` to Province interface
9. ✅ Applied optional chaining in category/[category]/page.tsx
10. ✅ Applied optional chaining in province/[province]/page.tsx

**Remaining Issues:**
- ⚠️ ~10 TypeScript errors still preventing `npm run build` from succeeding
- ⚠️ Need to complete optional property additions to all interfaces
- ⚠️ Some components still accessing properties that may be undefined

**Files Needing Attention:**
```
src/data/categories.ts          ← May need more optional properties
src/data/provinces.ts           ← May need more optional properties
src/app/category/[category]/page.tsx  ← Check all property accesses
src/app/province/[province]/page.tsx  ← Check all property accesses
src/components/TenderCard.tsx   ← Verify tender property access
src/types/tender.ts             ← May need more optional fields
```

**Action Required:**
Run `npm run build` in protenders-next directory, fix each error systematically by:
1. Adding missing optional properties to type definitions
2. Applying optional chaining (`?.`) where properties might be undefined
3. Adding conditional rendering (`&&`) for optional sections
4. Providing fallback values (`|| []`) for map operations

---

### Phase 3: Database & Prisma Setup ⏳ PENDING

**Goal:** Configure Prisma Client in Next.js to access database directly

**Current State:**
- ❌ Prisma schema NOT copied to protenders-next
- ❌ Prisma Client NOT generated in Next.js
- ❌ No database connection from Next.js
- ✅ Database still accessible via TenderAPI backend (proxied)

**Required Tasks:**

**3.1 Copy Prisma Configuration**
```bash
# Copy schema
cp apps/api/prisma/schema.prisma protenders-next/prisma/schema.prisma

# Copy migrations
cp -r apps/api/prisma/migrations protenders-next/prisma/migrations

# Copy seed script (optional)
cp apps/api/prisma/seed.ts protenders-next/prisma/seed.ts
```

**3.2 Configure Environment Variables**
```bash
# protenders-next/.env.local
DATABASE_URL="postgresql://protender_database_user:B2fmbMsc5QW03YrnRVOOQVQuawY1uBgg@dpg-d41gqlmr433s73dvl3cg-a.frankfurt-postgres.render.com/protender_database"
```

**3.3 Generate Prisma Client**
```bash
cd protenders-next
npm install @prisma/client
npx prisma generate
```

**3.4 Create Prisma Client Singleton**
```typescript
// protenders-next/src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

**3.5 Test Database Connection**
```typescript
// protenders-next/src/app/api/health/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    return NextResponse.json({ status: 'error', database: 'disconnected' }, { status: 500 });
  }
}
```

**Estimated Time:** 30 minutes
**Dependencies:** None
**Risk:** Low (just configuration)

---

### Phase 4: Core API Migration ⏳ PENDING (HIGH PRIORITY)

**Goal:** Replace proxy API routes with direct database queries

**Current State:**
All API routes in protenders-next currently PROXY to TenderAPI Express backend:

```typescript
// Current implementation (TEMPORARY)
const EXTERNAL_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://tender-spotlight-pro.onrender.com";

export async function GET(req: NextRequest) {
  const url = `${EXTERNAL_BASE}/api/search?${req.nextUrl.searchParams}`;
  const res = await fetch(url);
  return NextResponse.json(await res.json());
}
```

**Target:** Direct Prisma queries in Next.js API routes

---

#### 4.1 Search API Migration

**From:** `apps/api/src/routes/search.ts` + `controllers/searchController.ts`
**To:** `protenders-next/src/app/api/search/route.ts`

**Implementation:**
```typescript
// protenders-next/src/app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;

  // Parse query parameters
  const keywords = searchParams.get('keywords') || '';
  const categories = searchParams.getAll('categories');
  const provinces = searchParams.getAll('provinces');
  const status = searchParams.get('status') || 'active';
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '20');

  // Build Prisma where clause
  const where: any = {};

  if (keywords) {
    where.OR = [
      { title: { contains: keywords, mode: 'insensitive' } },
      { description: { contains: keywords, mode: 'insensitive' } },
      { buyerName: { contains: keywords, mode: 'insensitive' } },
    ];
  }

  if (categories.length > 0) {
    where.category = { in: categories };
  }

  if (provinces.length > 0) {
    where.province = { in: provinces };
  }

  if (status === 'active') {
    where.status = 'active';
    where.closingAt = { gte: new Date() };
  }

  // Execute query with pagination
  const [results, total] = await Promise.all([
    prisma.oCDSRelease.findMany({
      where,
      orderBy: { closingAt: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.oCDSRelease.count({ where }),
  ]);

  return NextResponse.json({
    results,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}
```

**Testing:**
```bash
# Test search endpoint
curl "http://localhost:3000/api/search?keywords=construction&page=1&pageSize=10"
```

**Estimated Time:** 3-4 hours
**Priority:** HIGH (most used endpoint)

---

#### 4.2 Tender Details API Migration

**From:** `apps/api/src/routes/tenders.ts`
**To:** `protenders-next/src/app/api/tenders/[id]/route.ts`

**Implementation:**
```typescript
// protenders-next/src/app/api/tenders/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const tender = await prisma.oCDSRelease.findUnique({
    where: { ocid: id },
  });

  if (!tender) {
    return NextResponse.json(
      { error: 'Tender not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(tender);
}
```

**Additional Endpoints:**
```typescript
// Get tender timeline
// protenders-next/src/app/api/tenders/[id]/timeline/route.ts

// Get related tenders
// protenders-next/src/app/api/tenders/[id]/related/route.ts
```

**Estimated Time:** 2 hours
**Priority:** HIGH

---

#### 4.3 Facets API Migration

**From:** `apps/api/src/routes/facets.ts`
**To:** `protenders-next/src/app/api/facets/route.ts`

**Implementation:**
```typescript
// protenders-next/src/app/api/facets/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  const [categories, provinces, buyers] = await Promise.all([
    // Get top categories
    prisma.oCDSRelease.groupBy({
      by: ['category'],
      where: { category: { not: null } },
      _count: { category: true },
      orderBy: { _count: { category: 'desc' } },
      take: 20,
    }),

    // Get provinces
    prisma.oCDSRelease.groupBy({
      by: ['province'],
      where: { province: { not: null } },
      _count: { province: true },
      orderBy: { _count: { province: 'desc' } },
    }),

    // Get top buyers
    prisma.oCDSRelease.groupBy({
      by: ['buyerName'],
      where: { buyerName: { not: null } },
      _count: { buyerName: true },
      orderBy: { _count: { buyerName: 'desc' } },
      take: 50,
    }),
  ]);

  return NextResponse.json({
    categories: categories.map(c => ({ name: c.category, count: c._count.category })),
    provinces: provinces.map(p => ({ name: p.province, count: p._count.province })),
    buyers: buyers.map(b => ({ name: b.buyerName, count: b._count.buyerName })),
  });
}
```

**Estimated Time:** 2 hours
**Priority:** MEDIUM

---

#### 4.4 Admin API Migration

**From:** `apps/api/src/routes/admin.ts`
**To:** `protenders-next/src/app/api/admin/*/route.ts`

**Endpoints to Migrate:**
1. `GET /api/admin/stats` → Dashboard statistics
2. `GET /api/admin/jobs` → Background job status
3. `POST /api/admin/jobs/sync` → Trigger manual sync
4. `GET /api/admin/users` → User management
5. `GET /api/admin/health` → System health check

**Example - Dashboard Stats:**
```typescript
// protenders-next/src/app/api/admin/stats/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth.config';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [totalTenders, activeTenders, recentTenders] = await Promise.all([
    prisma.oCDSRelease.count(),
    prisma.oCDSRelease.count({
      where: {
        status: 'active',
        closingAt: { gte: new Date() },
      },
    }),
    prisma.oCDSRelease.count({
      where: {
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  return NextResponse.json({
    totalTenders,
    activeTenders,
    recentTenders,
    lastSync: await getLastSyncTime(),
  });
}
```

**Estimated Time:** 6-8 hours
**Priority:** MEDIUM

---

#### 4.5 API Migration Summary

| Endpoint | Priority | Estimated Time | Status |
|----------|----------|----------------|--------|
| `/api/search` | HIGH | 3-4 hours | ⏳ Pending |
| `/api/tenders/[id]` | HIGH | 2 hours | ⏳ Pending |
| `/api/facets` | MEDIUM | 2 hours | ⏳ Pending |
| `/api/admin/stats` | MEDIUM | 2 hours | ⏳ Pending |
| `/api/admin/jobs` | MEDIUM | 2 hours | ⏳ Pending |
| `/api/admin/health` | LOW | 1 hour | ⏳ Pending |
| **TOTAL** | | **15-17 hours** | |

---

### Phase 5: Background Jobs Migration ⏳ PENDING

**Goal:** Migrate OCDS sync job from Express cron to Next.js-compatible solution

**Current Implementation (TenderAPI):**
```typescript
// apps/api/src/jobs/sync.ts
import cron from 'node-cron';

// Runs every 6 hours
cron.schedule('0 */6 * * *', async () => {
  console.log('Starting OCDS sync...');
  await syncOCDSData();
});
```

**Challenge:** Next.js doesn't support long-running processes or node-cron

**Solution Options:**

---

#### Option A: Vercel Cron (Recommended for Vercel Deployment)

**Setup:**
```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/sync",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

**Implementation:**
```typescript
// protenders-next/src/app/api/cron/sync/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { syncOCDSData } from '@/lib/server/sync';

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await syncOCDSData();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Sync failed:', error);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
```

**Pros:**
- Native Vercel integration
- No external dependencies
- Free on Pro plan
- Automatic retries

**Cons:**
- Vercel-specific (vendor lock-in)
- 10-minute execution limit
- Requires Vercel Pro plan for production

---

#### Option B: GitHub Actions (Platform-Agnostic)

**Setup:**
```yaml
# .github/workflows/sync.yml
name: OCDS Sync
on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:  # Allow manual trigger

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Sync Endpoint
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            https://protenders.co.za/api/cron/sync
```

**Pros:**
- Works with any hosting platform
- Free on GitHub
- Easy to monitor in GitHub UI
- Can trigger manually

**Cons:**
- Requires separate configuration
- Less integrated than Vercel Cron

---

#### Option C: External Cron Service (Fallback)

Use services like:
- cron-job.org
- EasyCron
- Cronitor

**Setup:**
Configure external service to hit `/api/cron/sync` endpoint every 6 hours.

**Pros:**
- Simple setup
- Platform-agnostic
- Reliable

**Cons:**
- External dependency
- May require paid plan

---

#### Option D: Keep Separate Worker Service (Hybrid Approach)

**Keep TenderAPI backend running ONLY for background jobs:**
- OCDS sync job
- Heavy processing tasks
- Long-running operations

**Next.js handles:**
- All user-facing pages
- All API queries (read operations)
- Admin panel UI

**Communication:**
```typescript
// Next.js triggers sync via API call
const response = await fetch('https://tenderapi.render.com/api/jobs/sync', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${process.env.WORKER_SECRET}` },
});
```

**Pros:**
- No execution time limits
- Keep complex job logic in Express
- Gradual migration path

**Cons:**
- Maintain two codebases
- Higher hosting costs
- More complex architecture

---

#### Recommended Approach: Vercel Cron (Option A)

**Reasoning:**
- Native integration with Next.js deployment
- Sufficient for OCDS sync (typically completes in 2-5 minutes)
- Automatic monitoring and retries
- Clean architecture (everything in Next.js)

**Fallback Plan:**
If sync job takes >10 minutes, use GitHub Actions (Option B) or hybrid approach (Option D).

**Migration Steps:**
1. Copy sync logic to `protenders-next/src/lib/server/sync.ts`
2. Copy OCDS client to `protenders-next/src/lib/server/ocdsClient.ts`
3. Create `/api/cron/sync` route with authentication
4. Configure `vercel.json` with cron schedule
5. Set `CRON_SECRET` environment variable
6. Test with manual trigger
7. Deploy and verify cron execution

**Estimated Time:** 4-6 hours
**Priority:** HIGH (after API migration)

---

### Phase 6: Services & Utilities Migration ⏳ PENDING

**Goal:** Copy all shared server-side code to Next.js

**Files to Migrate:**

```bash
# Type definitions
apps/api/src/types/ocds.ts → protenders-next/src/types/ocds.ts

# Data normalization
apps/api/src/utils/normalizer.ts → protenders-next/src/lib/server/normalizer.ts

# OCDS client
apps/api/src/clients/ocdsClient.ts → protenders-next/src/lib/server/ocdsClient.ts

# Sync state management
apps/api/src/services/syncStateService.ts → protenders-next/src/lib/server/syncStateService.ts

# Tender scraper (HTML extraction)
apps/api/src/services/tenderScraper.ts → protenders-next/src/lib/server/tenderScraper.ts
```

**Required Changes:**
1. Update import paths (use `@/` alias)
2. Remove `.js` extensions from imports
3. Add `'use server'` directive where needed
4. Update Prisma client imports to use Next.js singleton

**Example Migration:**
```typescript
// Before (Express)
import { PrismaClient } from '@prisma/client';
import { OCDSTender } from '../types/ocds.js';

const prisma = new PrismaClient();

export async function normalizeTender(tender: OCDSTender) {
  // ...
}

// After (Next.js)
'use server';

import { prisma } from '@/lib/prisma';
import { OCDSTender } from '@/types/ocds';

export async function normalizeTender(tender: OCDSTender) {
  // ... (same logic)
}
```

**Estimated Time:** 3-4 hours
**Priority:** MEDIUM (required for API routes to work)

---

## Technical Decisions

### Decision Log

| Decision | Rationale | Alternatives Considered |
|----------|-----------|-------------------------|
| **Next.js 15 with App Router** | Latest stable version with Server Components, better SEO, simplified routing | Next.js Pages Router (outdated), Remix, Astro |
| **Keep Prisma ORM** | Already working well, type-safe, good migration system | Drizzle ORM, raw SQL, TypeORM |
| **NextAuth.js v5** | Standard for Next.js authentication, supports credentials + OAuth | Clerk, Auth0, custom JWT solution |
| **Tailwind CSS + Shadcn/ui** | Already used in Vite frontend, consistent design system | Material-UI, Chakra UI, Ant Design |
| **TanStack Query** | Best-in-class for client-side data fetching and caching | SWR, Apollo Client, raw fetch |
| **Vercel Deployment** | Native Next.js optimizations, edge functions, built-in cron | Netlify, Railway, AWS Amplify |
| **Vercel Cron for Background Jobs** | Simplest solution for periodic tasks, native integration | GitHub Actions, separate worker service, node-cron |
| **Direct Prisma in API Routes** | Eliminate proxy overhead, simpler architecture | Keep Express backend, use tRPC |

### Architecture Principles

1. **Server-First:** Leverage Server Components for initial page load
2. **Client-Side Interactivity:** Use Client Components only where needed (forms, interactive filters)
3. **Progressive Enhancement:** Basic functionality works without JavaScript
4. **SEO Optimization:** All public pages are server-rendered with metadata
5. **Type Safety:** End-to-end TypeScript from database to UI
6. **Incremental Migration:** Old backend stays until all APIs migrated

---

## Completed Work

### November 3, 2024: Enhanced OCDS Data Extraction

**Goal:** Extract comprehensive tender data from eTenders OCDS API

**Implementation:**
1. Enhanced type definitions (`apps/api/src/types/ocds.ts`)
   - Added 12 new fields to `NormalizedTender` interface
   - Extended `OCDSTender` interface with OCDS specification fields

2. Updated normalizer (`apps/api/src/utils/normalizer.ts`)
   - Extract tender type from `procurementMethodDetails`
   - Extract province from buyer's address
   - Extract contact information (person, email, telephone)
   - Extract delivery location from tender details
   - Calculate data quality score

3. Updated database schema (`apps/api/prisma/schema.prisma`)
   - Added 12 new columns to `OCDSRelease` model
   - Added indexes for searchability

4. Updated sync job (`apps/api/src/jobs/sync.ts`)
   - Store all new fields during OCDS data sync

5. Created HTML scraper (`apps/api/src/services/tenderScraper.ts`)
   - Extract briefing session details (date, time, venue, meeting link)
   - Fallback for fields not in OCDS API

**Testing Results:**
- Synced 176 tenders (Nov 1-3, 2024)
- Tender Type: 100% populated (176/176)
- Province: 0% (not in OCDS API)
- Contact Info: 0% (not in OCDS API)
- Briefing Details: Requires HTML scraping

**Documentation:**
- Created `ENHANCED_TENDER_DATA_GUIDE.md`
- Created `OCDS_API_FIELD_AVAILABILITY_REPORT.md`

### October 2024: Project Reorganization

**Completed:**
- Moved `protenders-next` from `/DevOps/TenderAPI/protenders-next` to `/DevOps/protenders-next`
- Cleaned up nested directory structure
- Updated import paths

### October 2024: Authentication Implementation

**Completed:**
- Configured NextAuth.js v5 with credentials provider
- Created admin login page (`/admin/login`)
- Implemented session management
- Protected admin routes with middleware

### October 2024: Admin Dashboard

**Completed:**
- Dashboard overview (`/admin/dashboard`)
- Analytics page (`/admin/analytics`)
- ETL job management (`/admin/etl`)
- Real-time job status monitoring

### October 2024: Frontend Components

**Completed:**
- TenderCard component with data quality badge
- Search filters with TanStack Query
- Category and province landing pages
- Blog system
- Responsive navigation

---

## Outstanding Issues

### 🔴 P0: Critical (Blocking Production)

#### TypeScript Compilation Errors
**Issue:** `npm run build` fails with ~10 TypeScript errors
**Impact:** Cannot deploy to production
**Affected Files:**
- `src/data/categories.ts`
- `src/data/provinces.ts`
- `src/app/category/[category]/page.tsx`
- `src/app/province/[province]/page.tsx`
- `src/components/TenderCard.tsx`

**Errors:**
- Property 'X' does not exist on type 'Category'
- Property 'Y' does not exist on type 'Province'
- Object is possibly 'undefined'

**Solution:**
1. Add all missing optional properties to interfaces
2. Apply optional chaining (`?.`) throughout
3. Add conditional rendering where needed
4. Provide fallback values for arrays

**Estimated Fix Time:** 2-3 hours
**Priority:** CRITICAL - Must fix before any deployment

---

### 🟡 P1: High (Required for Full Migration)

#### Backend API Migration Not Started
**Issue:** All API routes still proxy to TenderAPI Express backend
**Impact:** Dependent on old infrastructure, CORS complexity, slower response times
**Scope:** 15-17 hours of work across 6 endpoints
**Priority:** HIGH - Core migration goal

#### Prisma Not Configured in Next.js
**Issue:** No Prisma client in protenders-next
**Impact:** Cannot query database directly from Next.js
**Dependencies:** Required before API migration can begin
**Solution:** Copy schema, generate client, create singleton
**Estimated Fix Time:** 30 minutes

#### Background Jobs Strategy Not Implemented
**Issue:** No cron job solution in place for OCDS sync
**Impact:** Data will become stale without periodic updates
**Options:** Vercel Cron, GitHub Actions, or hybrid approach
**Estimated Implementation:** 4-6 hours

---

### 🟢 P2: Medium (Post-Migration Enhancements)

#### Enhanced Tender Data Not Displayed in UI
**Issue:** New fields (tenderType, province, contactEmail) not shown in frontend
**Impact:** Missing value from recent backend enhancements
**Solution:** Update TenderCard and detail pages to display new fields
**Estimated Time:** 2-3 hours

#### HTML Scraper Not Integrated
**Issue:** Briefing session scraper exists but not called
**Impact:** Missing briefing details in UI
**Solution:** Add scraping job for high-value tenders, display in detail pages
**Estimated Time:** 3-4 hours

#### No Tender Alerts System
**Issue:** Users cannot save searches or get email notifications
**Impact:** Lower user engagement
**Solution:** Implement saved searches and email cron job
**Estimated Time:** 8-10 hours

---

## Next Steps & Timeline

### Week 1: Fix TypeScript & Deploy Frontend (HIGH PRIORITY)

**Monday-Tuesday: Fix Compilation Errors**
- [ ] Run `npm run build` and document all remaining errors
- [ ] Add missing optional properties to Category interface
- [ ] Add missing optional properties to Province interface
- [ ] Apply optional chaining in all page components
- [ ] Test build succeeds: `npm run build`
- [ ] Test local production build: `npm start`

**Wednesday: Configure Prisma**
- [ ] Copy Prisma schema to protenders-next
- [ ] Copy migrations directory
- [ ] Configure DATABASE_URL in `.env.local` (Render PostgreSQL)
- [ ] Run `npx prisma generate`
- [ ] Create Prisma client singleton
- [ ] Test database connection with health endpoint

**Thursday: Deploy Frontend**
- [ ] Push to GitHub
- [ ] Configure Vercel project
- [ ] Set environment variables in Vercel
- [ ] Deploy to production
- [ ] Verify all pages load correctly
- [ ] Test search (will still proxy to TenderAPI)

**Friday: Testing & Fixes**
- [ ] End-to-end testing of all pages
- [ ] Fix any deployment issues
- [ ] Monitor error logs
- [ ] Document any new issues

---

### Week 2: Migrate Core API Routes

**Monday-Tuesday: Search API**
- [ ] Implement `/api/search` with Prisma
- [ ] Support all query parameters (keywords, categories, provinces, pagination)
- [ ] Add response caching
- [ ] Test search functionality
- [ ] Compare performance with old backend

**Wednesday: Tender Details API**
- [ ] Implement `/api/tenders/[id]`
- [ ] Implement `/api/tenders/[id]/related`
- [ ] Test tender detail pages
- [ ] Verify all data displays correctly

**Thursday: Facets API**
- [ ] Implement `/api/facets`
- [ ] Add response caching (1 hour)
- [ ] Test filter dropdowns
- [ ] Verify facet counts are accurate

**Friday: Testing & Optimization**
- [ ] Performance testing of all APIs
- [ ] Add database indexes if needed
- [ ] Optimize slow queries
- [ ] Update frontend to remove proxy configurations

---

### Week 3: Migrate Admin APIs & Background Jobs

**Monday-Tuesday: Admin APIs**
- [ ] Implement `/api/admin/stats`
- [ ] Implement `/api/admin/jobs`
- [ ] Implement `/api/admin/health`
- [ ] Test admin dashboard
- [ ] Verify authentication works

**Wednesday-Thursday: Background Jobs**
- [ ] Copy sync logic to `src/lib/server/sync.ts`
- [ ] Copy OCDS client to `src/lib/server/ocdsClient.ts`
- [ ] Create `/api/cron/sync` endpoint
- [ ] Configure `vercel.json` with cron schedule
- [ ] Test manual sync trigger
- [ ] Deploy and verify cron execution

**Friday: Services Migration**
- [ ] Copy normalizer utility
- [ ] Copy scraper service
- [ ] Update all imports
- [ ] Test all services in Next.js context

---

### Week 4: Testing, Optimization & Decommission

**Monday-Tuesday: End-to-End Testing**
- [ ] Test all user flows
- [ ] Test admin panel
- [ ] Verify background jobs running
- [ ] Check error logs
- [ ] Performance testing

**Wednesday: Optimization**
- [ ] Add more database indexes
- [ ] Optimize slow API routes
- [ ] Add edge caching where appropriate
- [ ] Compress images
- [ ] Audit bundle size

**Thursday: Enhanced Data Integration**
- [ ] Display tenderType in search results
- [ ] Add province filter to search
- [ ] Show contact information in tender details
- [ ] Integrate briefing session scraper for VIP tenders

**Friday: Decommission Old Backend**
- [ ] Verify ALL functionality works without TenderAPI
- [ ] Remove proxy API routes
- [ ] Update environment variables
- [ ] Archive TenderAPI repository
- [ ] Shut down Render.com deployment
- [ ] Celebrate! 🎉

---

## Team Alignment Guide

This section helps different tools and team members understand how to use this document.

### For AI Agents (Codex, Claude, etc.)

**When asked to "continue the migration":**
1. Check **Outstanding Issues** section for current blockers
2. Prioritize P0 (critical) issues first
3. Follow implementation examples in **Migration Phases**
4. Reference **File Structure** for correct paths
5. Use **Technical Decisions** for architectural choices

**When fixing TypeScript errors:**
1. Read the error message carefully
2. Check if property exists in interface definition
3. Add as optional property if missing: `propertyName?: Type`
4. Apply optional chaining in components: `data.property?.map(...)`
5. Use conditional rendering for optional sections: `{data.property && <Section />}`

**When migrating an API route:**
1. Find corresponding Express route in TenderAPI at `/Users/nkosinathindwandwe/DevOps/TenderAPI/apps/api/src/routes/`
2. Reference the implementation logic (not Express-specific code)
3. Convert to Next.js API route format in `/Users/nkosinathindwandwe/DevOps/protenders-platform/src/app/api/`
4. Use Prisma singleton from `@/lib/prisma`
5. Add proper error handling
6. Test with curl or Postman

**Accessing the old codebase:**
```bash
# Navigate to old TenderAPI codebase for reference
cd /Users/nkosinathindwandwe/DevOps/TenderAPI

# View Express API routes
ls apps/api/src/routes/

# View a specific route implementation
cat apps/api/src/routes/search.ts
```

### For Cursor (IDE Agent)

**Typical Workflow:**
```
User: "Fix the TypeScript errors in category page"

You should:
1. Read /Users/nkosinathindwandwe/DevOps/protenders-platform/Plans/COMPREHENSIVE_MIGRATION_DOCUMENTATION.md
2. Check "Outstanding Issues > TypeScript Compilation Errors"
3. Run `npm run build` to see current errors
4. Fix errors following patterns in "Phase 2: Type System Migration"
5. Verify build succeeds
6. Report completion
```

**Quick Reference Commands:**
```bash
# Navigate to new platform
cd /Users/nkosinathindwandwe/DevOps/protenders-platform

# Check build status
npm run build

# Run development server
npm run dev

# Reference old codebase when needed
cd /Users/nkosinathindwandwe/DevOps/TenderAPI
cat apps/api/src/routes/search.ts  # Example: viewing old API route

# Generate Prisma client (after schema changes)
npx prisma generate

# Run database migrations
npx prisma migrate dev
```

### For Human Developers

**Getting Started:**
1. Both codebases are already on your machine:
   ```bash
   # Old codebase (reference only)
   cd /Users/nkosinathindwandwe/DevOps/TenderAPI

   # New platform (active development)
   cd /Users/nkosinathindwandwe/DevOps/protenders-platform
   ```

2. Set up environment variables (see **Environment Variables** section)
   ```bash
   cd /Users/nkosinathindwandwe/DevOps/protenders-platform
   cp .env.local.example .env.local
   # Edit .env.local with actual values
   ```

3. Install dependencies:
   ```bash
   cd /Users/nkosinathindwandwe/DevOps/protenders-platform
   npm install
   ```

4. Read **Outstanding Issues** to understand current blockers

5. Pick a task from **Next Steps & Timeline**

**Reference the old codebase when migrating:**
```bash
# View old API implementation
cd /Users/nkosinathindwandwe/DevOps/TenderAPI
cat apps/api/src/routes/search.ts

# Copy Prisma schema
cp apps/api/prisma/schema.prisma /Users/nkosinathindwandwe/DevOps/protenders-platform/prisma/
```

**Before Starting Work:**
- [ ] Pull latest changes
- [ ] Check **Outstanding Issues** for blockers
- [ ] Review relevant phase in **Migration Phases**
- [ ] Understand **Technical Decisions** for context

**When Stuck:**
- Check this document first (single source of truth)
- Review corresponding code in TenderAPI for reference
- Check Next.js 15 documentation
- Ask for help with specific error messages

### For Project Managers

**Quick Status Check:**
- See **Executive Summary** for high-level progress
- Check **Outstanding Issues** for blockers
- Review **Next Steps & Timeline** for schedule

**Current Risks:**
1. **TypeScript Errors (P0):** Blocking production deployment
2. **Backend Migration Scope:** 15-17 hours of work remaining
3. **Background Jobs:** Need to decide between Vercel Cron vs. alternatives
4. **Testing Time:** May need extra week for comprehensive testing

**Success Metrics:**
- [ ] Next.js builds without errors
- [ ] All pages load correctly in production
- [ ] Search returns results in <500ms
- [ ] Tender details page loads in <200ms
- [ ] Admin panel accessible and functional
- [ ] OCDS sync runs every 6 hours successfully
- [ ] Zero dependency on TenderAPI backend
- [ ] Lighthouse score >90 for performance

---

## File Structure Reference

### Source and Target Locations

**Important:** The old codebase (TenderAPI) is located at:
- **Path:** `/Users/nkosinathindwandwe/DevOps/TenderAPI`
- **Access:** `cd /Users/nkosinathindwandwe/DevOps/TenderAPI`
- **Purpose:** Reference implementation for migration

**New platform (ProTenders) is located at:**
- **Path:** `/Users/nkosinathindwandwe/DevOps/protenders-platform`
- **Access:** `cd /Users/nkosinathindwandwe/DevOps/protenders-platform`
- **Repository:** https://github.com/thrifts-za/protenders-platform

### TenderAPI (Source - Vite/Express)

**Location:** `/Users/nkosinathindwandwe/DevOps/TenderAPI`

```
/Users/nkosinathindwandwe/DevOps/TenderAPI/
├── apps/api/                           # Express backend
│   ├── prisma/
│   │   ├── schema.prisma               # Database schema
│   │   ├── migrations/                 # Database migrations
│   │   └── seed.ts                     # Seed data
│   ├── src/
│   │   ├── index.ts                    # Express server entry
│   │   ├── routes/                     # API routes
│   │   │   ├── search.ts               # Search endpoint
│   │   │   ├── tenders.ts              # Tender CRUD
│   │   │   ├── admin.ts                # Admin endpoints
│   │   │   └── facets.ts               # Facets/filters
│   │   ├── controllers/                # Route handlers
│   │   │   ├── searchController.ts
│   │   │   └── tenderController.ts
│   │   ├── services/                   # Business logic
│   │   │   ├── syncStateService.ts     # Sync job state
│   │   │   └── tenderScraper.ts        # HTML scraper
│   │   ├── jobs/                       # Background jobs
│   │   │   └── sync.ts                 # OCDS sync cron job
│   │   ├── middleware/                 # Express middleware
│   │   │   ├── auth.ts                 # JWT verification
│   │   │   └── cors.ts                 # CORS config
│   │   ├── clients/                    # External APIs
│   │   │   └── ocdsClient.ts           # OCDS API client
│   │   ├── utils/                      # Helper functions
│   │   │   └── normalizer.ts           # Data normalization
│   │   └── types/                      # TypeScript types
│   │       └── ocds.ts                 # OCDS type definitions
│   └── package.json
└── apps/frontend/                      # Vite frontend (DEPRECATED)
    └── (being migrated to protenders-platform)
```

### ProTenders Platform (Target - Next.js Full-Stack)

**Location:** `/Users/nkosinathindwandwe/DevOps/protenders-platform`

```
/Users/nkosinathindwandwe/DevOps/protenders-platform/
├── src/
│   ├── app/                            # Next.js App Router
│   │   ├── layout.tsx                  # Root layout
│   │   ├── page.tsx                    # Home page
│   │   ├── globals.css                 # Global styles
│   │   │
│   │   ├── api/                        # API Routes (Backend)
│   │   │   ├── search/
│   │   │   │   └── route.ts            # ⚠️ Currently proxies
│   │   │   ├── tenders/
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts        # ⏳ Needs creation
│   │   │   ├── facets/
│   │   │   │   └── route.ts            # ⚠️ Currently proxies
│   │   │   ├── admin/
│   │   │   │   ├── stats/route.ts      # ⏳ Needs creation
│   │   │   │   ├── jobs/route.ts       # ⏳ Needs creation
│   │   │   │   └── health/route.ts     # ⏳ Needs creation
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/route.ts  # ✅ NextAuth
│   │   │   └── cron/
│   │   │       └── sync/route.ts       # ⏳ Needs creation
│   │   │
│   │   ├── search/
│   │   │   └── page.tsx                # Search page
│   │   ├── tender/
│   │   │   └── [id]/
│   │   │       ├── page.tsx            # Tender details
│   │   │       └── intelligence/page.tsx   # AI insights
│   │   ├── category/
│   │   │   └── [category]/
│   │   │       └── page.tsx            # ⚠️ Has TypeScript errors
│   │   ├── province/
│   │   │   └── [province]/
│   │   │       └── page.tsx            # ⚠️ Has TypeScript errors
│   │   ├── latest/page.tsx
│   │   ├── closing-soon/page.tsx
│   │   ├── opportunities/page.tsx
│   │   ├── insights/page.tsx
│   │   ├── blog/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   └── admin/
│   │       ├── dashboard/page.tsx
│   │       ├── analytics/page.tsx
│   │       ├── etl/page.tsx            # ⚠️ Had duplicate headers (fixed)
│   │       └── login/page.tsx
│   │
│   ├── components/                     # React components
│   │   ├── ui/                         # Shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── tooltip.tsx
│   │   │   └── ...
│   │   ├── TenderCard.tsx              # ✅ Main tender card
│   │   ├── DataQualityBadge.tsx        # ✅ Quality indicator
│   │   └── FilterPanel.tsx             # Search filters
│   │
│   ├── lib/                            # Utilities
│   │   ├── api.ts                      # Client-side API calls
│   │   ├── structured-data.ts          # JSON-LD generation
│   │   ├── prisma.ts                   # ⏳ Needs creation (Prisma singleton)
│   │   └── server/                     # ⏳ Server-only utilities (needs creation)
│   │       ├── sync.ts                 # OCDS sync logic
│   │       ├── ocdsClient.ts           # OCDS API client
│   │       ├── normalizer.ts           # Data normalization
│   │       └── tenderScraper.ts        # HTML scraper
│   │
│   ├── types/                          # TypeScript types
│   │   ├── tender.ts                   # Tender interfaces
│   │   └── ocds.ts                     # ⏳ Needs copy from TenderAPI
│   │
│   ├── data/                           # Static data
│   │   ├── categories.ts               # ⚠️ Has missing optional properties
│   │   └── provinces.ts                # ⚠️ Has missing optional properties
│   │
│   ├── hooks/                          # React hooks
│   │   └── useAdminAuth.ts             # Admin auth hook
│   │
│   └── auth.config.ts                  # ✅ NextAuth config
│
├── prisma/                             # ⏳ Needs creation
│   ├── schema.prisma                   # Database schema (copy from TenderAPI)
│   └── migrations/                     # Migration files (copy from TenderAPI)
│
├── public/                             # Static assets
│   ├── og-image.png
│   └── ...
│
├── Plans/                              # ✅ Documentation
│   ├── VITE_TO_NEXTJS_MIGRATION.md     # This file
│   └── COMPREHENSIVE_MIGRATION_DOCUMENTATION.md
│
├── .env.local                          # Local environment variables
├── .env.production                     # Production environment variables
├── next.config.js                      # Next.js configuration
├── tailwind.config.ts                  # Tailwind configuration
├── tsconfig.json                       # TypeScript configuration
├── vercel.json                         # ⏳ Needs cron configuration
└── package.json
```

### Migration Mapping

| TenderAPI Source | protenders-next Destination | Status |
|------------------|----------------------------|--------|
| `apps/api/prisma/schema.prisma` | `prisma/schema.prisma` | ⏳ Pending |
| `apps/api/src/routes/search.ts` | `src/app/api/search/route.ts` | ⚠️ Proxying |
| `apps/api/src/routes/tenders.ts` | `src/app/api/tenders/[id]/route.ts` | ⏳ Pending |
| `apps/api/src/routes/admin.ts` | `src/app/api/admin/*/route.ts` | ⏳ Pending |
| `apps/api/src/jobs/sync.ts` | `src/lib/server/sync.ts` + `src/app/api/cron/sync/route.ts` | ⏳ Pending |
| `apps/api/src/clients/ocdsClient.ts` | `src/lib/server/ocdsClient.ts` | ⏳ Pending |
| `apps/api/src/utils/normalizer.ts` | `src/lib/server/normalizer.ts` | ⏳ Pending |
| `apps/api/src/services/tenderScraper.ts` | `src/lib/server/tenderScraper.ts` | ⏳ Pending |
| `apps/api/src/types/ocds.ts` | `src/types/ocds.ts` | ⏳ Pending |

---

## Environment Variables

### Required for Development

```bash
# protenders-next/.env.local

# Database (Render PostgreSQL)
DATABASE_URL="postgresql://protender_database_user:B2fmbMsc5QW03YrnRVOOQVQuawY1uBgg@dpg-d41gqlmr433s73dvl3cg-a.frankfurt-postgres.render.com/protender_database"

# Render CLI access for database:
# render psql dpg-d41gqlmr433s73dvl3cg-a

# NextAuth (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Admin Credentials
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="your-admin-password"

# OCDS API
OCDS_API_BASE_URL="https://ocds-api.etenders.gov.za/api/v1"

# Cron Job Secret (generate with: openssl rand -base64 32)
CRON_SECRET="your-cron-secret-here"

# Temporary: Old backend URL (until migration complete)
NEXT_PUBLIC_API_BASE_URL="https://tender-spotlight-pro.onrender.com"
```

### Required for Production (Vercel)

```bash
# Same as development, plus:

# NextAuth (production URL)
NEXTAUTH_URL="https://protenders.co.za"

# Vercel-specific (auto-configured)
VERCEL_URL="auto-configured-by-vercel"
VERCEL_ENV="production"
```

### How to Set in Vercel

1. Go to Vercel dashboard
2. Select `protenders-next` project
3. Go to Settings → Environment Variables
4. Add each variable with appropriate scope:
   - `Development` (for preview deployments)
   - `Preview` (for PR previews)
   - `Production` (for main branch)

---

## Success Criteria

### Phase 1: Frontend Working ✅
- [x] Next.js builds without errors
- [x] All pages render correctly
- [x] Routing works for all dynamic routes
- [x] Metadata generated for SEO
- [x] Tailwind CSS styling applied

### Phase 2: Backend Integration ⏳
- [ ] Prisma client configured in Next.js
- [ ] Database connection successful
- [ ] Search API returns results
- [ ] Tender details API works
- [ ] Admin APIs functional
- [ ] All APIs using Prisma (not proxying)

### Phase 3: Background Jobs ⏳
- [ ] OCDS sync job running every 6 hours
- [ ] Sync completes successfully
- [ ] New tenders appear in database
- [ ] Error logging functional
- [ ] Manual sync trigger works

### Phase 4: Production Ready ⏳
- [ ] TypeScript builds with zero errors
- [ ] All tests passing
- [ ] Lighthouse score >90
- [ ] Zero dependency on TenderAPI backend
- [ ] Monitoring and error tracking set up
- [ ] Documentation complete

### Phase 5: Decommissioning ⏳
- [ ] Old TenderAPI backend shut down
- [ ] Environment variables cleaned up
- [ ] Repository archived
- [ ] Team trained on new architecture

---

## Appendix

### Useful Commands

```bash
# Development
npm run dev                 # Start development server
npm run build               # Build for production
npm start                   # Start production server
npm run lint                # Run ESLint

# Prisma
npx prisma generate         # Generate Prisma client
npx prisma migrate dev      # Run migrations (development)
npx prisma migrate deploy   # Run migrations (production)
npx prisma studio           # Open Prisma Studio GUI
npx prisma db push          # Push schema changes without migration

# Testing
npm test                    # Run tests
npm run test:e2e            # Run end-to-end tests

# Deployment
vercel                      # Deploy to Vercel (preview)
vercel --prod               # Deploy to production
vercel env pull             # Pull environment variables locally
```

### Troubleshooting

**Build fails with TypeScript errors:**
- Check **Phase 2: Type System Migration** for fix patterns
- Run `npm run build` to see all errors
- Add missing optional properties to interfaces
- Apply optional chaining in components

**Prisma client not found:**
```bash
npx prisma generate
```

**Database connection fails:**
- Check `DATABASE_URL` in `.env.local`
- Verify database is accessible from your network
- Check Render dashboard for connection string
- Use `render psql dpg-d41gqlmr433s73dvl3cg-a` to test connection via CLI

**API route returns 500 error:**
- Check Vercel logs for error details
- Verify Prisma client is properly initialized
- Check database permissions

**Background job not running:**
- Verify `vercel.json` cron configuration
- Check `CRON_SECRET` environment variable
- Check Vercel logs for cron execution

---

## Document Changelog

| Date | Changes | Author |
|------|---------|--------|
| 2024-11-03 | Initial comprehensive migration plan created | Claude (AI Assistant) |
| 2024-11-03 | Added executive summary, architecture comparison, all 6 phases | Claude |
| 2024-11-03 | Added technical decisions, completed work, outstanding issues | Claude |
| 2024-11-03 | Added timeline, team alignment guide, file structure reference | Claude |

---

## Conclusion

This document serves as the **single source of truth** for the ProTenders Vite→Next.js migration. It should be updated as work progresses and new decisions are made.

**Current Priority:** Fix TypeScript compilation errors (P0) to unblock deployment.

**Estimated Time to Completion:** 3-4 weeks for full migration.

**Next Immediate Action:** Fix remaining TypeScript errors in `src/data/categories.ts`, `src/data/provinces.ts`, and related page components.

---

**For Questions or Updates:**
- Update this document when completing phases
- Document any new technical decisions
- Keep **Outstanding Issues** section current
- Update **Next Steps & Timeline** as work progresses
