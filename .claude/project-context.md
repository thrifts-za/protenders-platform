# ProTenders Platform - Project Context
**Living Document - Updated with Every Milestone**

> 🔄 **Last Updated:** 2024-11-03 08:00 UTC
>
> 📍 **Current Phase:** Migration - TypeScript Fixes (P0 Critical)
>
> 👤 **Updated By:** Claude Code (AI Assistant)

---

## 🎯 Project Overview

**Name:** ProTenders Platform
**Type:** South African Government Tender Intelligence Platform
**Purpose:** Help businesses find and win government tenders

**Tech Stack:**
- Frontend: Next.js 15 (React Server Components)
- Backend: Next.js API Routes
- Database: PostgreSQL on Render
- Deployment: Vercel (Frontend) + Render (API/Database)
- Language: TypeScript

---

## 📂 Codebase Locations

### Active Development
```
Location: /Users/nkosinathindwandwe/DevOps/protenders-platform
Repository: https://github.com/thrifts-za/protenders-platform
Branch: migration/vite-to-nextjs
Status: Active Development
```

### Legacy Codebase (Reference Only)
```
Location: /Users/nkosinathindwandwe/DevOps/TenderAPI
Structure:
  - apps/api/ - Express.js backend
  - apps/frontend/ - Vite React (deprecated)
Status: Reference Only - DO NOT MODIFY
```

---

## 🔄 Migration Status

### Current State: 60% Complete

| Component | Status | Progress | Blocker |
|-----------|--------|----------|---------|
| Frontend Pages | ✅ Complete | 95% | None |
| Type System | ⚠️ In Progress | 60% | **TypeScript Errors** |
| Authentication | ✅ Complete | 100% | None |
| Database (Prisma) | ⏳ Pending | 0% | Needs configuration |
| API Routes | ⏳ Pending | 5% | Currently proxying |
| Background Jobs | ⏳ Pending | 0% | Not started |
| Deployment Config | ✅ Complete | 100% | None |

### Critical Blocker (P0)
**Issue:** TypeScript compilation errors (~10 errors)
**Impact:** Cannot build for production
**Files Affected:**
- src/data/categories.ts
- src/data/provinces.ts
- src/app/category/[category]/page.tsx
- src/app/province/[province]/page.tsx
- src/components/TenderCard.tsx

**Required Action:** Fix all TypeScript errors before proceeding

---

## 🏗️ Infrastructure (Render)

### Database
```
Service ID: dpg-d41gqlmr433s73dvl3cg-a
Region: Frankfurt, Germany
Connection: postgresql://protender_database_user:B2fmbMsc5QW03YrnRVOOQVQuawY1uBgg@dpg-d41gqlmr433s73dvl3cg-a.frankfurt-postgres.render.com/protender_database
CLI Access: render psql dpg-d41gqlmr433s73dvl3cg-a
```

### API Backend (Legacy Express.js)
```
Service ID: srv-d40dse95pdvs73fteuqg
URL: https://tender-spotlight-pro.onrender.com
Deploy Hook: https://api.render.com/deploy/srv-d40dse95pdvs73fteuqg?key=Wc4uy690_ZU
Status: Active (being migrated to Next.js)
```

---

## 📋 Current Sprint Tasks

### Week 1: Fix TypeScript & Deploy Frontend (IN PROGRESS)

**Priority:** P0 (Critical)

- [ ] **Monday-Tuesday: Fix TypeScript Errors**
  - [ ] Run `npm run build` and document all errors
  - [ ] Add missing optional properties to Category interface
  - [ ] Add missing optional properties to Province interface
  - [ ] Apply optional chaining in all page components
  - [ ] Test build succeeds
  - [ ] Test local production build

- [ ] **Wednesday: Configure Prisma**
  - [ ] Copy Prisma schema from TenderAPI
  - [ ] Copy migrations directory
  - [ ] Configure DATABASE_URL in .env.local
  - [ ] Run `npx prisma generate`
  - [ ] Create Prisma client singleton
  - [ ] Test database connection

- [ ] **Thursday: Deploy Frontend**
  - [ ] Push to GitHub
  - [ ] Configure Vercel project
  - [ ] Set environment variables
  - [ ] Deploy to production
  - [ ] Verify all pages load

- [ ] **Friday: Testing & Fixes**
  - [ ] End-to-end testing
  - [ ] Fix deployment issues
  - [ ] Monitor error logs

### Upcoming Weeks

**Week 2:** Migrate Core API Routes
**Week 3:** Admin APIs & Background Jobs
**Week 4:** Testing & Decommission Old Stack

---

## 🛠️ Key Commands

### Development
```bash
# Navigate to project
cd /Users/nkosinathindwandwe/DevOps/protenders-platform

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Database
```bash
# Access database via Render CLI
render psql dpg-d41gqlmr433s73dvl3cg-a

# Generate Prisma client
npx prisma generate

# Run migrations
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

### Git
```bash
# Current branch
git checkout migration/vite-to-nextjs

# Push changes
git add .
git commit -m "Description"
git push origin migration/vite-to-nextjs
```

### Reference Old Codebase
```bash
# View old API implementation
cd /Users/nkosinathindwandwe/DevOps/TenderAPI
cat apps/api/src/routes/search.ts

# Copy Prisma schema
cp apps/api/prisma/schema.prisma /Users/nkosinathindwandwe/DevOps/protenders-platform/prisma/
```

---

## 📚 Documentation

### Main Docs
- `Plans/COMPREHENSIVE_MIGRATION_DOCUMENTATION.md` - Complete migration guide
- `Plans/RENDER_CONFIGURATION.md` - Render infrastructure setup
- `Plans/DEPLOYMENT_GUIDE.md` - Deployment instructions
- `Plans/DATA_ETL_GUIDE.md` - Data sync and ETL processes
- `Plans/AI_MASTER_STRATEGY.md` - Future AI features

### This File
- **Purpose:** Living context for AI agents and developers
- **Update Frequency:** After every significant milestone
- **Update Rule:** MUST be updated before marking any phase complete

---

## 🎯 Next Immediate Actions

### 1. Fix TypeScript Errors (CRITICAL)
```bash
cd /Users/nkosinathindwandwe/DevOps/protenders-platform
npm run build
# Fix each error systematically
```

### 2. Configure Prisma
```bash
# Copy schema from old codebase
cp /Users/nkosinathindwandwe/DevOps/TenderAPI/apps/api/prisma/schema.prisma ./prisma/

# Generate client
npx prisma generate
```

### 3. Test Database Connection
```bash
# Test connection to Render PostgreSQL
render psql dpg-d41gqlmr433s73dvl3cg-a
```

---

## 🚨 Important Notes

### For AI Agents
1. **ALWAYS check this file first** before starting work
2. **Update this file** after completing any task
3. **Reference migration docs** for detailed instructions
4. **Use correct paths** - old codebase is at /DevOps/TenderAPI
5. **Follow the priority order** - P0 tasks first

### For Developers
1. This file reflects **current state**, not aspirational state
2. Update **immediately** after completing milestones
3. Keep it **concise** - link to detailed docs for depth
4. Mark blockers clearly with **CRITICAL** or **BLOCKER** tags

---

## 📊 Success Metrics

### Phase 1: TypeScript & Frontend (Current)
- [ ] Zero TypeScript errors
- [ ] npm run build succeeds
- [ ] All pages render in production
- [ ] Lighthouse score >90

### Phase 2: Backend Integration
- [ ] Prisma configured
- [ ] Database connection working
- [ ] Search API returns results
- [ ] No proxy dependencies

### Phase 3: Full Migration
- [ ] All API routes migrated
- [ ] Background jobs running
- [ ] Old backend decommissioned
- [ ] Zero production errors

---

## 🔄 Update Protocol

**When to update this file:**
1. ✅ After fixing critical bugs
2. ✅ After completing migration phases
3. ✅ After infrastructure changes
4. ✅ After deployment
5. ✅ When blockers are discovered or resolved

**How to update:**
1. Update "Last Updated" timestamp
2. Update "Current Phase"
3. Update task checklists
4. Update status tables
5. Commit with message: `Update project context: [what changed]`

---

**End of Context Document**
*Next update required after: TypeScript errors are fixed*
