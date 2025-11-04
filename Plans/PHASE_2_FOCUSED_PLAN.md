# Phase 2: API Routes Migration - Focused Plan

## Summary of Conflict Analysis

### Existing Routes Status

| Route | New Codebase | Old Codebase | Assessment |
|-------|--------------|--------------|------------|
| `/api/search` | ✅ Implemented | ✅ Full featured | **ENHANCE** - Add caching, logging, validation |
| `/api/tenders/[id]` | ✅ Basic | ✅ Full featured | **ENHANCE** - Add full features |
| `/api/facets` | ✅ Basic | ✅ Full featured | **ENHANCE** - Add all facet features |
| `/api/admin/jobs` | ✅ Basic | ✅ Full featured | **ENHANCE** - Add all job operations |

### Missing Features in Existing Routes

**Search Route** needs:
- ✅ Core search: Already implemented
- ❌ Caching layer (cacheService)
- ❌ Search logging/analytics
- ❌ Parameter validation schema

**Tenders Route** needs:
- ✅ Basic get by ID: Already implemented
- ❌ Timeline view (`/timeline`)
- ❌ Document analysis (`/analyze`)
- ❌ AI intelligence (`/intel`)

---

## Phase 2 Priority Order

### 🔥 CRITICAL (Must have for MVP)

**1. User & Alerts (Week 1)**
- `/api/alerts` - GET, POST, PUT, DELETE
- `/api/alerts/logs` - Alert execution logs
- `/api/savesearch` - Save search criteria
- `/api/me` - User profile
- `/api/user/saved` - Saved tenders CRUD
- `/api/user/preferences` - User preferences
- `/api/user/dashboard` - User dashboard

**Why critical:** Core user functionality - users need to save searches and get alerts.

### ⚡ HIGH (MVP enhancement)

**2. Enhanced Tender Data (Week 2)**
- `/api/tenders/:id/timeline` - Tender timeline
- `/api/tenders/:id/intel` - Basic intelligence
- `/api/suppliers/:name/summary` - Supplier info
- `/api/buyers/:name/metrics` - Buyer metrics
- `/api/recommendations/related` - Related tenders

**Why high:** Makes tenders more valuable with additional context.

**3. Insights & Stats (Week 2)**
- `/api/insights/top-buyers` - Top buyers
- `/api/insights/category-counts` - Category distribution
- `/api/insights/closing-value` - Value metrics
- `/api/insights/stats` - Overall stats

**Why high:** Provides market intelligence to users.

### 📊 MEDIUM (Nice to have)

**4. Admin Enhancements (Week 3)**
- `/api/admin/auth/login` - Admin login
- `/api/admin/auth/logout` - Admin logout
- `/api/admin/metrics` - Dashboard metrics
- `/api/admin/sync/state` - Sync state
- `/api/admin/tenders` - Tender catalog
- `/api/admin/buyers` - Buyer catalog
- `/api/admin/config` - Configuration
- `/api/admin/feedback` - Feedback management

**Why medium:** Admin features can wait until after user features.

**5. Document Routes (Week 3)**
- `/api/docs/:docId/view` - View document
- `/api/docs/:docId/download` - Download
- `/api/docs/:docId/metadata` - Metadata

**Why medium:** Documents are important but not critical for initial launch.

### 🎯 LOW (Future enhancement)

**6. Advanced AI Features (Week 4+)**
- All AI intelligence routes
- Document AI processing
- Vertex AI predictions
- Tender packs
- Analytics routes

**Why low:** Advanced features for later iterations.

---

## Phase 2A: Sprint 1 - User & Alerts (THIS SPRINT)

### Goals
- Enable users to save searches and create alerts
- Enable users to save/bookmark tenders
- Enable user preferences management
- Build foundation for authenticated API routes

### Routes to Implement

#### 1. Alerts System
```
POST /api/alerts          - Create new alert
GET /api/alerts           - List user alerts
PUT /api/alerts/:id       - Update alert
DELETE /api/alerts/:id    - Delete alert
GET /api/alerts/logs      - Alert execution logs
```

#### 2. Saved Searches
```
POST /api/savesearch     - Save search criteria (creates alert)
```

#### 3. User Management
```
GET /api/me                           - Get current user profile
GET /api/user/saved                   - List saved tenders
PUT /api/user/saved/:tenderId         - Save/bookmark tender
DELETE /api/user/saved/:tenderId      - Remove saved tender
GET /api/user/preferences             - Get user preferences
PUT /api/user/preferences             - Update preferences
GET /api/user/dashboard               - User dashboard with stats
```

### Technical Requirements

**Authentication:**
- Use existing NextAuth.js setup
- Add `getServerSession()` to routes
- Return 401 if not authenticated

**Database:**
- Use existing Prisma schema
- May need to add Alert, SavedTender, UserPreferences models

**Testing:**
- Test with Postman/curl
- Verify authentication works
- Verify CRUD operations

---

## Implementation Strategy

### Step 1: Check Database Schema
- Review existing Prisma schema
- Identify missing tables (Alert, SavedTender, etc.)
- Create migrations if needed

### Step 2: Create Alert Routes
- Start with GET /api/alerts (list)
- Then POST /api/alerts (create)
- Then PUT /api/alerts/:id (update)
- Then DELETE /api/alerts/:id (delete)
- Finally GET /api/alerts/logs

### Step 3: Create User Routes
- GET /api/me (profile)
- Saved tenders CRUD
- Preferences CRUD
- Dashboard

### Step 4: Test & Verify
- Test each route
- Build project
- Fix any errors

### Step 5: Commit
- Commit Phase 2A

---

## Success Criteria

✅ All alert routes functional
✅ All user routes functional
✅ Authentication working
✅ Database operations working
✅ Build succeeds with no errors
✅ Routes tested and working

---

## Next Steps After Phase 2A

1. Phase 2B: Enhanced Tender Data
2. Phase 2C: Insights & Stats
3. Phase 2D: Admin Enhancements
4. Phase 2E: Document Routes
5. Phase 2F: Advanced AI Features

---

Generated: 2025-11-04
Branch: migration-v2
Status: Ready to implement
