# Phase 2: Deep Filtering System - December 2025

**Status:** Planning Phase
**Target Implementation:** December 2025
**Priority:** High (200+ tenders daily requires better filtering)

---

## Quick Start

This folder contains comprehensive planning documentation for Phase 2 of ProTenders development: implementing a world-class deep filtering system.

### Documents in This Folder

1. **[deep-filtering-system.md](./deep-filtering-system.md)** - Main planning document (70+ pages)
   - Current state analysis
   - eTenders competitive analysis
   - Gap analysis (what we're missing)
   - Proposed 3-tier filter architecture
   - Database schema enhancements
   - UI/UX recommendations
   - 4-week implementation roadmap
   - Technical considerations & performance
   - Success metrics

2. **[ui-mockups.md](./ui-mockups.md)** - Visual design mockups (ASCII art)
   - Desktop layout (sidebar + results)
   - Mobile layout (bottom sheet drawer)
   - Detailed component designs (multi-select, date picker, value slider)
   - Loading states & empty states
   - Accessibility features

3. **[etenders-categories.json](./etenders-categories.json)** - All 91 detailed categories from eTenders.gov.za

4. **[etenders-provinces.json](./etenders-provinces.json)** - All 10 provinces (including "National")

5. **[etenders-organs-of-state.json](./etenders-organs-of-state.json)** - All 877 organs of state

6. **[etenders-organs-by-type.json](./etenders-organs-by-type.json)** - Organs classified by type:
   - Local Municipalities (159)
   - District Municipalities (44)
   - Metro Municipalities (8)
   - National Departments (12)
   - Provincial Departments (19)
   - State-Owned Enterprises (37)
   - SETAs (21)
   - Agencies/Authorities (141)
   - Other (436)

7. **[extract-etenders-data.js](./extract-etenders-data.js)** - Node.js script to extract data from `/etenders.html`

---

## Executive Summary

**The Challenge:**
- ProTenders receives 200+ new tenders daily
- Current filter system only supports 3 basic categories (goods, services, works)
- Users struggle to find relevant tenders for their specific business

**The Opportunity:**
- Our database already contains rich data (91 detailed categories captured via enrichment)
- eTenders.gov.za shows what's possible (877 organs of state, 10 tender types, advanced filters)
- We can build a BETTER filtering system than eTenders with modern UI/UX

**The Solution:**
- **Tier 1 Filters (Essential):** 91 categories, 10 provinces, closing date range, status tabs, sort options
- **Tier 2 Filters (Enhanced):** 877 organs of state (classified by type), tender types, eSubmission, briefing filters
- **Tier 3 Filters (Premium):** Value ranges, delivery location, data quality score, document availability

**Business Impact:**
- 70% reduction in time to find relevant tenders
- 2x increase in filter usage (from 1.5 to 3.5 filters per search)
- 40% of users create saved filter presets
- 20% increase in premium subscriptions (driven by Tier 3 filters)

---

## Key Findings

### What We Already Have ✅

- **detailedCategory field** - Already capturing all 91 categories via enrichment!
- **province field** - Indexed and populated
- **tenderType field** - Exists but needs normalization
- **Strong database foundation** - Well-indexed with composite indexes
- **Enrichment system** - Captures briefing details, contacts, documents

### What We're Missing ❌

- **Organ of State Classification** - No field for municipality/department/SOE type
- **Value Range Filtering** - No min/max estimated value fields
- **Municipality Granularity** - Province only, no city/district
- **eSubmission Flag** - No boolean for electronic submission capability
- **Advanced UI Components** - No multi-select with search, no filter chips, no mobile drawer
- **Filter Counts** - No aggregation/faceted search for result counts
- **Saved Presets** - No way to save and quickly re-apply filter combinations

### The Gap (Current vs Proposed)

| Feature | Current | Proposed | Impact |
|---------|---------|----------|--------|
| Categories | 3 basic | 91 detailed | 30x more granularity |
| Buyer Filtering | Free text only | 877 organs classified | Precise targeting |
| UI Components | Basic badges | Multi-select with search | Handles 877 options |
| Mobile Experience | Basic responsive | Bottom sheet drawer | Native app feel |
| Filter Presets | None | Save & share | 40% adoption target |
| Performance | Good (300ms) | Maintain <500ms | Caching + indexes |

---

## Implementation Timeline

### **Week 1: Data Enrichment & Schema (Dec 1-7)**
- Enhance Prisma schema with new filter fields
- Run database migration (add columns + indexes)
- Create backfill script (classify organs, normalize tender types, extract values)
- Backfill existing 49,000+ tender records
- Validate data quality (>95% classification accuracy)

**Deliverables:** Enhanced schema, classified data, performance benchmarks

### **Week 2: API Enhancement (Dec 8-14)**
- Update `/api/search` with 20+ new filter parameters
- Create `/api/search/facets` endpoint (with Redis caching)
- Implement filter presets API (CRUD operations)
- Add validation & error handling
- Load testing (100 concurrent requests)

**Deliverables:** Enhanced search API, faceted search, presets API, API docs

### **Week 3: UI Implementation - Tier 1 & 2 (Dec 15-21)**
- Redesign FilterPanel component architecture
- Build FilterMultiSelect with virtual scrolling (for 877 organs)
- Implement Status Tabs, filter chips, date range picker
- Create mobile-responsive bottom sheet drawer
- Add keyboard navigation & accessibility

**Deliverables:** Complete Tier 1 & 2 UI, mobile drawer, accessible components

### **Week 4: Polish, Premium & Testing (Dec 22-28)**
- Implement Tier 3 premium filters (value slider, quality score)
- Build filter presets UI (save, load, edit, delete)
- Polish animations & loading states
- Comprehensive testing (integration, accessibility, cross-browser)
- Deploy to production (gradual rollout)

**Deliverables:** Tier 3 filters, presets UI, production deployment, user docs

---

## Quick Links

### Read First
- [Executive Summary](./deep-filtering-system.md#executive-summary)
- [Gap Analysis](./deep-filtering-system.md#3-gap-analysis)
- [4-Week Roadmap](./deep-filtering-system.md#8-implementation-roadmap)

### Reference Data
- [All 91 Categories](./etenders-categories.json)
- [All 877 Organs of State](./etenders-organs-of-state.json)
- [Organs by Type](./etenders-organs-by-type.json)

### Design & Architecture
- [UI Mockups](./ui-mockups.md)
- [Database Schema Changes](./deep-filtering-system.md#5-database-schema-enhancements)
- [Component Architecture](./deep-filtering-system.md#61-component-architecture)

### Technical Details
- [Performance Considerations](./deep-filtering-system.md#9-technical-considerations)
- [API Enhancements](./deep-filtering-system.md#7-api-enhancements)
- [Success Metrics](./deep-filtering-system.md#10-success-metrics)

---

## How This Data Was Extracted

The `/etenders.html` file in the project root was analyzed using the `extract-etenders-data.js` script to extract:

1. **Categories** - Parsed from `<select id="categorieslist">` with 91 `<option>` elements
2. **Provinces** - Parsed from `<select id="provincelist">` with 10 options
3. **Organs of State** - Parsed from `<select id="departments">` with 877 options
4. **Classification** - Organs automatically classified by keywords (municipality, department, SOE, SETA, etc.)

**Run the extraction:**
```bash
cd Plans/Phase2-December
node extract-etenders-data.js
```

**Output:**
```
✅ Extraction Complete!

📊 Statistics:
   - Categories: 91
   - Provinces: 10
   - Organs of State: 877

🏛️  Organs by Type:
   - Local Municipalities: 159
   - District Municipalities: 44
   - Metro Municipalities: 8
   - National Departments: 12
   - Provincial Departments: 19
   - State-Owned Enterprises: 37
   - SETAs: 21
   - Agencies/Authorities/Boards: 141
   - Public Entities: 0
   - Other: 436

📁 Files created in Plans/Phase2-December/
```

---

## Key Decisions to Make

Before starting implementation, decide:

1. **Scope:** Implement all 3 tiers in December, or launch Tier 1+2 first (MVP)?
2. **Pricing:** Should Tier 3 premium filters be subscription-gated immediately?
3. **Performance:** Which filter counts to pre-calculate vs calculate on-demand?
4. **Prioritization:** Mobile-first or desktop-first implementation?
5. **UX:** Collapsible advanced filters (like eTenders) or always visible?

**Recommendation:** Start with Tier 1+2 MVP (Dec 1-21), soft-launch Tier 3 for feedback (Dec 22-28), full premium rollout in January.

---

## Success Criteria

**Must-Have (Launch Blockers):**
- ✅ All 91 categories filterable
- ✅ 877 organs of state classified and searchable
- ✅ Multi-select with search for large lists (>100 options)
- ✅ Mobile-responsive drawer UI
- ✅ Search API response < 500ms (p95)
- ✅ Zero data loss during migration

**Nice-to-Have (Post-Launch):**
- Filter presets with >40% adoption
- Filter count badges (faceted search)
- AI-powered filter recommendations
- Shareable filter links
- Filter analytics dashboard

**Success Metrics (30 days post-launch):**
- 2x increase in avg filters per search (1.5 → 3.0)
- 85% of searches use at least 1 advanced filter
- 40% of active users create at least 1 preset
- 15% increase in 30-day user retention
- 20% increase in premium conversions

---

## Questions?

For questions about this plan, contact:
- Development Team (architecture, implementation)
- Product Team (prioritization, scope)
- UX/UI Team (design, mockups)

**Next Steps:**
1. Review planning documents
2. Approve scope & timeline
3. Assign resources (dev, design, QA)
4. Kick off Week 1 (Schema + Data Enrichment)

---

**Last Updated:** November 2025
**Version:** 1.0 (Planning Phase)
**Status:** Ready for Review & Approval
