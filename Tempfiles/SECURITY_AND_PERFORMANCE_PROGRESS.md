# Security & Performance Optimization Progress Report

**Date:** 2025-01-09
**Project:** ProTenders Platform
**Goal:** Address critical security vulnerabilities and performance bottlenecks

---

## 🎯 Objectives

### Security (Phase 1)
- Fix 9 CRITICAL vulnerabilities
- Secure 42 admin API endpoints
- Remove exposed credentials
- Add security headers

### Performance (Phase 2)
- Reduce tender page load from 3-5s to <1s
- Optimize database queries (eliminate N+1)
- Implement caching strategy
- Improve bundle size

---

## ✅ COMPLETED

### 1. Auth Middleware Created
**File:** `/src/lib/auth-middleware.ts`
- `requireAuth()` - Require any authenticated user
- `requireAdmin()` - Require admin role
- `withAuth()` - Wrapper for user endpoints
- `withAdmin()` - Wrapper for admin endpoints

**Usage Example:**
```typescript
import { requireAdmin } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 }
    );
  }

  // Protected logic here...
}
```

---

### 2. Admin Endpoints Secured (5/42)
**Protected Endpoints:**
- ✅ `/api/admin/health` - System health check
- ✅ `/api/admin/jobs` - Background job logs
- ✅ `/api/admin/stats` - Dashboard statistics
- ✅ `/api/admin/config` (GET + PUT) - Platform configuration

**Remaining (37 endpoints):**
- `/api/admin/alerts/*`
- `/api/admin/analytics/*`
- `/api/admin/audit`
- `/api/admin/buyers`
- `/api/admin/documents/*`
- `/api/admin/enrichment/*`
- `/api/admin/feedback/*`
- `/api/admin/jobs/*` (sub-routes)
- `/api/admin/mail/*`
- `/api/admin/suppliers`
- `/api/admin/sync/*`
- `/api/admin/tenders/*`
- `/api/admin/users/*`
- `/api/admin/metrics`

---

### 3. Database Credentials Sanitized
**File:** `/.env.example`
- ✅ Removed production database credentials
- ✅ Replaced with placeholder values
- ✅ Added note to increase connection_limit for production
- ✅ Removed exposed deploy hooks

**Before:**
```bash
DATABASE_URL="postgresql://protender_database_user:B2fmbMsc5QW03YrnRVOOQVQuawY1uBgg@dpg-d41gqlmr433s73dvl3cg-a.frankfurt-postgres.render.com/protender_database?connection_limit=10&pool_timeout=20&connect_timeout=30"
```

**After:**
```bash
DATABASE_URL="postgresql://your_db_user:your_db_password@your-host.render.com/your_database?connection_limit=10&pool_timeout=20&connect_timeout=30"
```

⚠️ **ACTION REQUIRED:** Rotate the exposed database password immediately!

---

### 4. JWT Secret Enforcement
**Files Modified:**
- ✅ `/src/app/api/admin/auth/login/route.ts`
- ✅ `/src/app/api/admin/auth/logout/route.ts`
- ✅ `/src/app/api/admin/auth/me/route.ts`

**Change:**
```typescript
// OLD (INSECURE):
const JWT_SECRET = process.env.JWT_SECRET || "tender-finder-jwt-secret-change-in-production";

// NEW (SECURE):
if (!process.env.JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is not set. This is required for security.');
}
const JWT_SECRET = process.env.JWT_SECRET;
```

**Impact:** Application will now fail to start if JWT_SECRET is not configured, preventing production deployment with weak secrets.

---

## 🚧 IN PROGRESS

### 5. Secure Remaining Admin Endpoints (37 remaining)
**Status:** 5/42 completed (12%)

**Next Batch Priority:**
1. `/api/admin/tenders/route.ts` - Tender catalog
2. `/api/admin/tenders/[ocid]/route.ts` - Tender details
3. `/api/admin/suppliers/route.ts` - Supplier data
4. `/api/admin/users/route.ts` - User management
5. `/api/admin/users/[id]/route.ts` - User operations
6. `/api/admin/metrics/route.ts` - Operational metrics
7. `/api/contact/route.ts` (GET) - Contact submissions
8. `/api/contact/[id]/route.ts` (PATCH, DELETE) - Contact management

**Pattern to Apply:**
```typescript
import { requireAdmin } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 }
    );
  }
  // ... rest of handler
}
```

---

## ⏳ PENDING - HIGH PRIORITY SECURITY

### 6. Remove Development Auth Bypass
**File:** `/src/auth.config.ts` (lines 46-58)
**Risk:** CRITICAL

**Current Code:**
```typescript
// Fallback: Allow any email/password for development if no user exists
if (process.env.NODE_ENV === 'development') {
  const isAdmin = email.toLowerCase().includes('admin');
  return {
    id: email,
    email,
    name: email.split('@')[0],
    role: (isAdmin ? 'admin' : 'user') as string,
    adminToken: isAdmin ? 'dev-admin-token' : undefined,
  } as any;
}
```

**Recommended Fix:**
```typescript
// ONLY allow dev bypass in local development
if (process.env.NODE_ENV === 'development' && process.env.VERCEL_ENV !== 'production' && !process.env.VERCEL_ENV) {
  console.warn('⚠️  DEV MODE: Using development authentication bypass');
  const isAdmin = email.toLowerCase().includes('admin');
  return {
    id: email,
    email,
    name: email.split('@')[0],
    role: (isAdmin ? 'admin' : 'user') as string,
    adminToken: isAdmin ? 'dev-admin-token' : undefined,
  } as any;
}
```

---

### 7. Add Security Headers
**File:** `/next.config.mjs`
**Risk:** HIGH

**Required Headers:**
```javascript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.clarity.ms https://www.clarity.ms; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://ocds-api.etenders.gov.za https://www.etenders.gov.za;",
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=()',
        },
        // Only in production:
        ...(process.env.NODE_ENV === 'production' ? [{
          key: 'Strict-Transport-Security',
          value: 'max-age=31536000; includeSubDomains',
        }] : []),
      ],
    },
  ];
},
```

---

### 8. Strengthen Password Requirements
**File:** `/src/app/api/auth/register/route.ts` (line 18)
**Risk:** HIGH

**Current:** `password: z.string().min(6)`

**Recommended:**
```typescript
const passwordSchema = z.string()
  .min(12, "Password must be at least 12 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

const registerSchema = z.object({
  email: z.string().email(),
  password: passwordSchema,
  name: z.string().min(1).optional(),
  securityQuestion: z.string().optional(),
  securityAnswer: z.string().optional(),
});
```

---

### 9. Add NEXTAUTH_SECRET Validation
**File:** `/src/auth.config.ts` (line 118)
**Risk:** HIGH

**Current:**
```typescript
secret: process.env.NEXTAUTH_SECRET,
```

**Recommended:**
```typescript
// At top of file
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('FATAL: NEXTAUTH_SECRET environment variable is not set. Generate one with: openssl rand -base64 32');
}

// In config
secret: process.env.NEXTAUTH_SECRET,
```

---

### 10. Add Input Validation to Admin Endpoints
**Risk:** MEDIUM

**Create:** `/src/lib/validation/admin-schemas.ts`
```typescript
import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).max(1000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const searchSchema = z.object({
  search: z.string().max(200).optional(),
  category: z.string().max(100).optional(),
  status: z.enum(['active', 'closed', 'all']).optional(),
  province: z.string().max(100).optional(),
  ...paginationSchema.shape,
});

export const tenderFilterSchema = z.object({
  search: z.string().max(200).optional(),
  buyer: z.string().max(200).optional(),
  category: z.string().max(100).optional(),
  status: z.enum(['active', 'planned', 'complete', 'cancelled', 'all']).optional(),
  ...paginationSchema.shape,
});
```

**Apply to endpoints:**
```typescript
import { searchSchema } from '@/lib/validation/admin-schemas';

export async function GET(request: NextRequest) {
  await requireAdmin();

  const params = Object.fromEntries(request.nextUrl.searchParams);
  const validated = searchSchema.parse(params); // Throws if invalid

  // Use validated.page, validated.limit, etc.
}
```

---

## ⏳ PENDING - PERFORMANCE OPTIMIZATIONS

### 11. Add Slug Field to Database
**File:** `/prisma/schema.prisma`
**Impact:** 1500-2500ms reduction per page load

**Schema Change:**
```prisma
model OCDSRelease {
  // ... existing fields

  // Add slug for fast lookups
  slug String? @unique @map("slug")

  // Add enrichment cache
  enrichedAt DateTime? @map("enriched_at")
  briefingFlags Json? @map("briefing_flags")
  documentUrls Json? @map("document_urls")

  @@index([slug])
}
```

**Migration Required:** Yes (see #12)

---

### 12. Create Slug Backfill Script
**File:** `/scripts/backfill-slugs.ts` (to be created)
**Purpose:** Populate slug field for existing 50,000+ records

**Script Template:**
```typescript
import { prisma } from '../src/lib/prisma';
import { generateSlug } from '../src/lib/utils/slug';

async function backfillSlugs() {
  const batchSize = 100;
  let processed = 0;

  while (true) {
    const releases = await prisma.oCDSRelease.findMany({
      where: { slug: null },
      take: batchSize,
      select: {
        id: true,
        ocid: true,
        tenderTitle: true,
        tenderDisplayTitle: true,
        tenderDescription: true,
      },
    });

    if (releases.length === 0) break;

    for (const release of releases) {
      const title = release.tenderDisplayTitle || release.tenderTitle;
      const description = release.tenderDescription;
      const textForSlug = description && description.length > 10 ? description : title;

      if (textForSlug) {
        const slug = generateSlug(textForSlug) + '-' + release.ocid;

        await prisma.oCDSRelease.update({
          where: { id: release.id },
          data: { slug },
        });
      }
    }

    processed += releases.length;
    console.log(`✅ Processed ${processed} releases`);
  }

  console.log(`🎉 Backfill complete! Total: ${processed}`);
}

backfillSlugs().catch(console.error);
```

**Run:**
```bash
npm run tsx scripts/backfill-slugs.ts
```

---

### 13. Optimize findTenderBySlugOrId
**File:** `/src/lib/utils/tender-lookup.ts`
**Impact:** 1000-1800ms reduction

**Current Problem:** Fetches 1000 records, loops in memory

**Optimized Version:**
```typescript
export async function findTenderBySlugOrId(slugOrId: string): Promise<OCDSRelease | null> {
  // Try direct OCID lookup first (most common)
  let release = await prisma.oCDSRelease.findUnique({
    where: { ocid: slugOrId },
  });

  if (release) return release;

  // Try slug lookup (after migration)
  release = await prisma.oCDSRelease.findUnique({
    where: { slug: slugOrId },
  });

  if (release) return release;

  // Try ID lookup (UUID)
  release = await prisma.oCDSRelease.findUnique({
    where: { id: slugOrId },
  });

  return release;
}
```

**No more loops!** Direct database queries with indexes.

---

### 14. Implement Database Caching
**Files:** Multiple API routes
**Impact:** 300-600ms reduction

**Pattern:**
```typescript
import { unstable_cache } from 'next/cache';

const getCachedTender = unstable_cache(
  async (id: string) => {
    return await findTenderBySlugOrId(id);
  },
  ['tender-by-id'],
  {
    revalidate: 3600, // 1 hour
    tags: ['tenders'],
  }
);

export async function GET(request: NextRequest, { params }) {
  const { id } = await params;
  const tender = await getCachedTender(id);
  // ...
}
```

**Apply to:**
- `/src/app/api/tenders/[id]/route.ts`
- `/src/app/api/search/route.ts`
- `/src/lib/utils/tender-lookup.ts`

---

### 15. Cache-First Enrichment Strategy
**File:** `/src/app/api/tenders/[id]/route.ts`
**Impact:** 500-1000ms reduction

**Current:** Always calls external API (200-1000ms)

**Optimized:**
```typescript
// Check if enrichment is fresh (< 24 hours old)
const isEnrichmentFresh = release.enrichedAt &&
  (Date.now() - new Date(release.enrichedAt).getTime()) < 24 * 60 * 60 * 1000;

if (isEnrichmentFresh && release.briefingFlags && release.documentUrls) {
  // Use cached enrichment data
  return NextResponse.json({
    ...transformedTender,
    briefingFlags: release.briefingFlags,
    documentUrls: release.documentUrls,
  });
}

// Otherwise, enrich in background (don't block response)
if (!isEnrichmentFresh) {
  enrichTenderInBackground(release.id, release.tenderNumber).catch(console.error);
}
```

---

## 📊 PROGRESS SUMMARY

### Security Progress
- ✅ **Completed:** 4/9 critical fixes (44%)
- 🚧 **In Progress:** 1/9 (securing endpoints)
- ⏳ **Pending:** 4/9

### Performance Progress
- ✅ **Completed:** 0/5 optimizations (0%)
- ⏳ **Pending:** 5/5 (awaiting security completion)

### Endpoint Security
- ✅ **Secured:** 5/42 admin endpoints (12%)
- ⏳ **Remaining:** 37/42 (88%)

---

## 🎯 NEXT STEPS (Priority Order)

1. **Secure remaining 37 admin endpoints** (2-3 hours)
2. **Remove development auth bypass** (15 min)
3. **Add security headers** (30 min)
4. **Strengthen password requirements** (15 min)
5. **Add NEXTAUTH_SECRET validation** (10 min)
6. **Create slug migration** (30 min)
7. **Run slug backfill script** (1-2 hours)
8. **Optimize tender lookup** (30 min)
9. **Implement caching** (1-2 hours)
10. **Deploy and test** (1 hour)

**Estimated Total Time Remaining:** 8-12 hours

---

## ⚠️ CRITICAL ACTIONS REQUIRED

1. **Rotate Database Password:** The production database password was exposed in `.env.example` and committed to git. Change it immediately in Render dashboard and update Vercel environment variables.

2. **Set JWT_SECRET:** Application will not start without this. Generate with:
   ```bash
   openssl rand -base64 64
   ```

3. **Set NEXTAUTH_SECRET:** Generate with:
   ```bash
   openssl rand -base64 32
   ```

4. **Test Admin Auth:** After securing endpoints, verify that:
   - Unauthenticated requests return 401
   - Non-admin users return 403
   - Admin users can access normally

---

## 📝 TESTING CHECKLIST

### Security Tests
- [ ] Admin endpoints return 401 without auth
- [ ] Non-admin users get 403 on admin endpoints
- [ ] Strong passwords enforced on registration
- [ ] App fails to start without JWT_SECRET
- [ ] App fails to start without NEXTAUTH_SECRET
- [ ] Security headers present in responses
- [ ] No development bypass in production

### Performance Tests
- [ ] Tender page loads in <1s
- [ ] No 1000-record queries in logs
- [ ] Cache hit rate >80% for tender lookups
- [ ] TTFB <200ms for cached pages
- [ ] LCP <2.5s

---

**Last Updated:** 2025-01-09
**Next Review:** After completing endpoint security
