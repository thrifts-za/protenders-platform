# Phase 2: Deep Filtering System - Comprehensive Plan

**Document Version:** 1.0
**Created:** November 2025
**Target Implementation:** December 2025
**Status:** Planning Phase

---

## Executive Summary

With 200+ tenders published daily, ProTenders requires a sophisticated deep filtering system to help users quickly find relevant opportunities for their business. This document outlines a comprehensive plan to implement an advanced filtering system inspired by eTenders.gov.za but with improved UI/UX.

**Key Objectives:**
- Enable precise filtering across 91 detailed categories
- Support filtering by 877 organs of state (municipalities, departments, SOEs)
- Implement advanced filters (value ranges, tender types, submission methods)
- Dramatically improve user experience with modern UI components
- Ensure high performance with proper indexing and caching

**Business Impact:**
- Reduce time to find relevant tenders by 70%
- Increase user engagement and retention
- Enable better-targeted tender alerts
- Differentiate ProTenders from competitors
- Support premium subscription tiers with advanced filters

---

## Table of Contents

1. [Current State Analysis](#1-current-state-analysis)
2. [eTenders Filtering Analysis](#2-etenders-filtering-analysis)
3. [Gap Analysis](#3-gap-analysis)
4. [Proposed Filter Architecture](#4-proposed-filter-architecture)
5. [Database Schema Enhancements](#5-database-schema-enhancements)
6. [UI/UX Design Recommendations](#6-uiux-design-recommendations)
7. [API Enhancements](#7-api-enhancements)
8. [Implementation Roadmap](#8-implementation-roadmap)
9. [Technical Considerations](#9-technical-considerations)
10. [Success Metrics](#10-success-metrics)

---

## 1. Current State Analysis

### 1.1 Existing Filter Implementation

**Location:** `/src/components/FilterPanel.tsx`

**Current Filter Capabilities:**
- **Keywords:** Basic text search
- **Categories:** 3 options only (goods, services, works)
- **Custom Category:** Free text input
- **Closing In Days:** Preset options (3, 7, 14, 30 days, Any)
- **Submission Methods:** 4 options (email, electronic, physical, other)
- **Buyer Name:** Free text search
- **Status:** 5 options (Any, active, planned, complete, cancelled)

**UI Components:**
- Basic input fields and select dropdowns
- Badge-based display for selected categories
- Simple layout without collapsible sections
- No multi-select with search capability
- No filter count indicators
- No mobile-optimized drawer

### 1.2 Current Database Schema

**Model:** `OCDSRelease` (Prisma Schema)

**Existing Filter-Related Fields:**
```prisma
buyerName            String?   // Indexed
mainCategory         String?   // Indexed (3 categories only)
closingAt            DateTime? // Indexed
submissionMethods    String?   // JSON array
status               String?   // Indexed
tenderType           String?   // Indexed
province             String?   // Indexed
deliveryLocation     String?
detailedCategory     String?   // Indexed ✅ (91 categories available!)
contactPerson        String?
contactEmail         String?
contactTelephone     String?
hasBriefing          Boolean?
briefingCompulsory   Boolean?
enquiryDeadline      DateTime?
```

**Existing Indexes:**
- Single-column indexes on: ocid, slug, closingAt, mainCategory, status, buyerName, province, tenderType, detailedCategory
- Composite indexes for common queries (status + closingAt, mainCategory + publishedAt, etc.)

### 1.3 Current Search API

**Endpoint:** `/src/app/api/search/route.ts`

**Supported Query Parameters:**
- `keywords` - Full-text search
- `categories` - Array of category names
- `province` - Single province
- `closingInDays` - Number
- `submissionMethods` - Array
- `buyer` - Buyer name substring
- `status` - Tender status
- `page` - Pagination
- `pageSize` - Results per page
- `publishedSince` - Date filter
- `sort` - latest, closingSoon, relevance

**Query Building:**
- Basic `where` clause construction
- Simple substring matching for buyer names
- Array containment for submission methods
- No faceted search / aggregation support
- No filter count pre-calculation

### 1.4 Current Strengths

✅ **Data Availability:** `detailedCategory` field already captures 91 categories from enrichment
✅ **Performance Foundation:** Well-indexed database with composite indexes
✅ **Enrichment System:** Captures province, tender type, briefing details, contacts
✅ **Fast Slug Lookups:** SEO-friendly URLs with unique index
✅ **Cache-First Strategy:** 24h TTL on enrichment data

### 1.5 Current Limitations

❌ **Limited Filter Options:** Only 3 basic categories vs 91 detailed
❌ **No Organ of State Classification:** Can't filter by municipality, department, SOE type
❌ **No Value Range Filtering:** Can't filter by estimated contract value
❌ **No Municipality Granularity:** Province only, no city/district filtering
❌ **Basic UI:** No multi-select with search, no filter chips, no mobile drawer
❌ **No Filter Counts:** Users don't know result distribution
❌ **No Saved Presets:** Can't quickly re-apply common filter combinations
❌ **No Faceted Search:** No aggregation/count for each filter option

---

## 2. eTenders Filtering Analysis

### 2.1 eTenders Filter Categories

**Extracted from:** `etenders.html` (November 2025)

#### 2.1.1 Categories (91 Total)

**Data File:** `etenders-categories.json`

**Sample Categories:**
- Accommodation
- Construction
- Computer programming, consultancy and related activities
- Financial and insurance activities
- Human health and social work activities
- Legal and accounting activities
- Manufacturing
- Professional, scientific and technical activities
- Security and investigation activities
- Supplies: Medical
- Services: Functional (Including Cleaning and Security Services)
- Transportation and storage

**Categorization Patterns:**
- **Industry-based:** Manufacturing, Mining, Agriculture
- **Service-based:** Professional Services, Consulting, Security
- **Supply-based:** Medical Supplies, Stationery, Computer Equipment
- **Function-based:** Building Services, Electrical Services, Civil Services

#### 2.1.2 Provinces (10 Total)

**Data File:** `etenders-provinces.json`

1. Eastern Cape
2. Free State
3. Gauteng
4. KwaZulu-Natal
5. Limpopo
6. Mpumalanga
7. **National** (important distinction!)
8. North West
9. Northern Cape
10. Western Cape

#### 2.1.3 Organs of State (877 Total)

**Data File:** `etenders-organs-of-state.json` and `etenders-organs-by-type.json`

**Breakdown by Type:**
- **Local Municipalities:** 159 (e.g., Abaqulusi, City of Cape Town, Johannesburg)
- **District Municipalities:** 44 (e.g., Amathole, Alfred Nzo, Amajuba)
- **Metro Municipalities:** 8 (e.g., City of Cape Town, eThekwini, Johannesburg)
- **National Departments:** 12 (e.g., Basic Education, Health, Defence)
- **Provincial Departments:** 19 (e.g., Gauteng Health, Western Cape Transport)
- **State-Owned Enterprises (SOEs):** 37 (e.g., Eskom, Transnet, SAA)
- **SETAs:** 21 (Sector Education and Training Authorities)
- **Agencies/Authorities/Boards:** 141 (e.g., SANRAL, Water Boards, Development Agencies)
- **Other:** 436 (Public entities, commissions, councils, etc.)

**Key Insight:** This classification allows users to target specific types of buyers (e.g., "Show me only tenders from municipalities" or "Only national departments").

#### 2.1.4 Tender Types (10 Types)

1. Request for Bid (Open-Tender)
2. Request for Bid (Limited-Tender)
3. Request for Quotation (RFQ)
4. Request for Information (RFI)
5. Request for Proposal (RFP)
6. Expression of Interest (EOI)
7. SITA Contract
8. Transversal Contract
9. Participation
10. Deviation

#### 2.1.5 Additional Filters

- **eSubmission Status:** Accepting / Not Accepting
- **Tender Number:** Free text search
- **MAAA Number:** Free text search (Mandatory Applicable Approved Awarding)
- **Supplier Name:** Free text search (for awarded tenders)
- **Status Tabs:** Currently Advertised, Awarded, Cancelled, Closed

### 2.2 eTenders UI/UX Patterns

**Quick Find vs Advanced Search:**
- Toggle between simple keyword search and advanced filters
- Visual distinction with eye icon (👁 = visible, 👁‍🗨 = hidden)
- Collapsible "Advanced Search" section

**Multi-Select Dropdowns:**
- Uses "Chosen" library (https://harvesthq.github.io/chosen/)
- Search within dropdown for large lists
- Multi-select with visual chips/badges
- Placeholder text: "-- Any Category(s) --"

**Status Tabs:**
- Visual pills/tabs at top of page
- Icons for each status (bullhorn, award, times-circle, lock)
- Active state highlighting
- Filters table results based on selected tab

**Results Table:**
- DataTables implementation with sorting
- Expandable rows (+ icon) for tender details
- Export to Excel/PDF buttons
- Pagination controls

**Visual Hierarchy:**
- Warning alerts explaining features
- Grouped filters in rows (Categories + Provinces, then Organs + Other)
- Clear section headings with h6 tags

### 2.3 eTenders Performance Considerations

**Observations:**
- Uses chosen-select for lazy loading large dropdowns
- DataTables for client-side result manipulation
- Status filtering via JavaScript (tab switching)
- No visible filter count indicators
- Full page reload on search submit (traditional form POST)

---

## 3. Gap Analysis

### 3.1 Data Gaps

| Feature | eTenders | ProTenders | Gap |
|---------|----------|-----------|-----|
| **Detailed Categories** | 91 categories | ✅ Field exists (`detailedCategory`) | ⚠️ Not exposed in UI (only 3 basic categories shown) |
| **Organs of State** | 877 buyers | ❌ Only `buyerName` string field | ❌ No classification (municipality, dept, SOE, etc.) |
| **Organ Type Classification** | Yes (9 types) | ❌ | ❌ Missing field and data |
| **Tender Types** | 10 types | ✅ `tenderType` field exists | ⚠️ Not categorized/normalized |
| **Municipality Type** | 3 types (Local, District, Metro) | ❌ | ❌ Missing classification |
| **Value Range** | Estimated value | ❌ | ❌ No min/max value fields |
| **eSubmission Flag** | Yes/No | ❌ | ❌ Missing boolean field |
| **MAAA Number** | Searchable | ❌ | ❌ Missing field |
| **Geographic Granularity** | Province + implied municipality | ✅ Province field | ⚠️ No city/municipality field |
| **Document Count** | Implicit | ❌ | ❌ Missing count field |

### 3.2 UI/UX Gaps

| Feature | eTenders | ProTenders | Gap |
|---------|----------|-----------|-----|
| **Multi-Select with Search** | ✅ Chosen library | ❌ Basic badges | ❌ Large lists difficult to navigate |
| **Filter Counts** | ❌ None | ❌ None | ➖ Both missing |
| **Advanced/Simple Toggle** | ✅ Collapsible | ❌ Always visible | ⚠️ Cluttered for basic users |
| **Filter Chips** | ❌ In dropdown only | ❌ None | ➖ Both missing |
| **Saved Filter Presets** | ❌ None | ❌ None | ➖ Both missing (opportunity!) |
| **Mobile Responsiveness** | ⚠️ Basic | ⚠️ Basic | ⚠️ Both need improvement |
| **Export Functionality** | ✅ Excel/PDF | ✅ CSV (page only) | ⚠️ Limited to current page |
| **Status Tabs** | ✅ Visual pills | ❌ Dropdown only | ❌ Less intuitive |
| **Loading States** | ⚠️ Full page reload | ✅ React states | ✅ ProTenders better |

### 3.3 Performance Gaps

| Feature | eTenders | ProTenders | Gap |
|---------|----------|-----------|-----|
| **Faceted Search / Aggregation** | ❌ | ❌ | ❌ Both missing (critical for filter counts) |
| **Indexes on Filter Fields** | Unknown | ✅ Comprehensive | ✅ ProTenders strong |
| **Caching Strategy** | Unknown | ✅ 24h enrichment cache | ✅ ProTenders strong |
| **Query Optimization** | Unknown | ✅ Composite indexes | ✅ ProTenders strong |
| **Lazy Loading** | ✅ Chosen library | ❌ Load all options | ❌ ProTenders loads all upfront |
| **Server-side Pagination** | ✅ | ✅ | ✅ Both have |

### 3.4 Feature Gaps (Opportunities for Differentiation)

**ProTenders Can Do Better:**

1. **Smart Filter Presets** - Save and quickly re-apply filter combinations
2. **Filter Counts in Real-Time** - Show "(23)" next to each filter option
3. **AI-Powered Recommendations** - "Based on your saved searches, you might be interested in..."
4. **Mobile-First Drawer UI** - Slide-out filter panel for mobile
5. **Visual Filter Chips** - Active filters shown as removable chips above results
6. **One-Click Filter Combos** - "Construction tenders in Gauteng closing this week"
7. **Filter Analytics** - "Most popular filters this week"
8. **Smart Defaults** - Remember user's last filter settings
9. **Negative Filters** - "Exclude certain categories or buyers"
10. **Bulk Actions** - "Save all filtered results to collection"

---

## 4. Proposed Filter Architecture

### 4.1 Three-Tier Filter System

#### **Tier 1: Essential Filters (MVP - Week 1-2)**

**Always Visible / Quick Access**

1. **Keywords** (Enhanced)
   - Full-text search with fuzzy matching
   - Search across title, description, buyer name
   - Highlight matches in results
   - Autocomplete suggestions

2. **Detailed Categories** (91 categories)
   - Multi-select dropdown with search
   - Grouped by parent category (Services, Supplies, Manufacturing, etc.)
   - Filter count next to each option
   - "Select All in Group" option

3. **Provinces** (10 options)
   - Multi-select with checkboxes
   - Visual map option (future enhancement)
   - Quick "All Provinces" toggle

4. **Closing Date Range**
   - Preset quick filters: "Next 7 days", "Next 30 days", "This week", "This month"
   - Custom date range picker
   - "Closing soon" urgent indicator

5. **Status Tabs** (Visual Pills)
   - Currently Advertised (active)
   - Awarded
   - Cancelled
   - Closed
   - All Statuses

6. **Sort Options**
   - Latest first (publishedAt DESC)
   - Closing soon (closingAt ASC)
   - Relevance (if keyword search)
   - Value (high to low) - future

#### **Tier 2: Enhanced Filters (Week 2-3)**

**Collapsible "Advanced Filters" Section**

7. **Organ of State** (877 options)
   - Multi-select with search
   - Grouped by type:
     - All Municipalities (211 total)
       - Local Municipalities (159)
       - District Municipalities (44)
       - Metro Municipalities (8)
     - National Departments (12)
     - Provincial Departments (19)
     - State-Owned Enterprises (37)
     - SETAs (21)
     - Agencies & Authorities (141)
     - Other Organs of State (436)
   - Quick filters: "All Municipalities", "All Departments", "All SOEs"
   - Filter count per group

8. **Tender Type** (10 types)
   - Multi-select checkboxes
   - Visual icons for each type
   - Common types first (RFQ, RFP, RFI, EOI)

9. **Municipality Type** (When "Municipalities" selected)
   - Radio buttons: Local, District, Metro, All
   - Filters the Organ of State list dynamically

10. **eSubmission Capability**
    - Checkbox: "Only tenders accepting electronic submission"
    - Badge on results showing eSubmission status

11. **Briefing Sessions**
    - Has Briefing (yes/no)
    - Compulsory Attendance (yes/no)
    - Upcoming Only (briefingDate >= today)

12. **Date Published**
    - Last 24 hours
    - Last 7 days
    - Last 30 days
    - Custom range

13. **Submission Method**
    - Electronic
    - Email
    - Physical
    - Portal
    - Other
    - Multi-select checkboxes

#### **Tier 3: Advanced/Premium Filters (Week 3-4)**

**Premium Features (Subscription Required)**

14. **Value Range**
    - Slider with min/max inputs
    - Preset ranges: <R100k, R100k-R1M, R1M-R10M, R10M+
    - Estimated value from tender details

15. **Delivery Location** (City/Region)
    - Grouped by province
    - Multi-select with search
    - Derived from `deliveryLocation` field

16. **Document Availability**
    - Has Documents (yes/no)
    - Document count filter (1+, 5+, 10+)

17. **Data Quality Score**
    - High (90-100%)
    - Medium (70-89%)
    - Low (<70%)
    - Based on field completeness

18. **Contact Availability**
    - Has Email (yes/no)
    - Has Phone (yes/no)

19. **Opportunity Score** (Future - AI-Powered)
    - Match score based on user profile
    - "High fit", "Medium fit", "Low fit"
    - Requires user business profile setup

20. **Negative Filters** (Exclude)
    - Exclude specific categories
    - Exclude specific buyers
    - Exclude specific provinces

### 4.2 Filter Preset System

**User-Saved Filter Combinations**

- **Save Current Filters** - Button to save active filter state
- **Name Your Preset** - "Construction tenders in Gauteng"
- **Quick Load** - Dropdown of saved presets
- **Share Presets** - Generate shareable link
- **Default Preset** - Auto-apply on login
- **Preset Library** - Common presets suggested by ProTenders
  - "Construction Projects"
  - "IT & Software Tenders"
  - "Security Services"
  - "Medical Supplies"
  - "Consulting Opportunities"

### 4.3 Smart Filters (Future Enhancement)

**AI-Powered Filter Recommendations**

- **"Similar to Saved"** - Find tenders like your saved ones
- **"Based on Your Business"** - Filter to your industry/size
- **"Trending This Week"** - Popular categories this week
- **"New Buyers"** - Tenders from buyers new to eTenders
- **"Repeat Opportunities"** - Recurring tender types

---

## 5. Database Schema Enhancements

### 5.1 New Fields for OCDSRelease Model

```prisma
model OCDSRelease {
  // ... existing fields ...

  // NEW: Organ of State Classification
  organOfStateType     String?   // "Local Municipality", "District Municipality", "Metro Municipality", "National Department", "Provincial Department", "SOE", "SETA", "Agency", "Other"
  municipalityType     String?   // "Local", "District", "Metro" (for municipalities only)
  organOfStateId       Int?      // FK to OrganOfState table (future normalization)

  // NEW: Tender Type Categorization
  tenderTypeCategory   String?   // Normalized: "RFQ", "RFP", "RFI", "EOI", "Contract", "Participation", "Deviation", "Other"
  procurementMethod    String?   // "open", "limited", "selective", "direct"

  // NEW: Value Range
  estimatedValueMin    Float?    // Minimum estimated contract value
  estimatedValueMax    Float?    // Maximum estimated contract value
  valueCurrency        String?   @default("ZAR")

  // NEW: eSubmission
  hasESubmission       Boolean?  @default(false)
  eSubmissionPortal    String?   // Portal URL if electronic submission available

  // NEW: Geographic Enhancement
  city                 String?   // Delivery city/town
  district             String?   // District within province

  // NEW: Document Tracking
  documentCount        Int?      @default(0)
  hasDocuments         Boolean?  @default(false)
  documentTypes        Json?     // Array of doc types ["Specification", "Terms", "Drawings"]

  // NEW: Data Quality
  dataQualityScore     Int?      // 0-100 calculated score

  // NEW: MAAA Number
  maaa Number           String?   // Mandatory Applicable Approved Awarding reference

  // ... existing fields ...

  // NEW INDEXES
  @@index([organOfStateType])
  @@index([municipalityType])
  @@index([tenderTypeCategory])
  @@index([estimatedValueMin, estimatedValueMax])
  @@index([hasESubmission])
  @@index([city])
  @@index([district])
  @@index([dataQualityScore])
  @@index([maaaNumber])

  // NEW COMPOSITE INDEXES
  @@index([organOfStateType, province])
  @@index([tenderTypeCategory, closingAt])
  @@index([detailedCategory, province, status])
  @@index([hasESubmission, status, closingAt])
}
```

### 5.2 New OrganOfState Reference Table (Future Normalization)

```prisma
// Future: Normalize buyer organizations for better filtering
model OrganOfState {
  id               Int       @id @default(autoincrement())
  name             String    @unique
  type             String    // "Local Municipality", "District Municipality", etc.
  municipalityType String?   // "Local", "District", "Metro"
  province         String?
  website          String?
  contactEmail     String?
  establishedYear  Int?
  isActive         Boolean   @default(true)
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  // Relations
  tenders          OCDSRelease[] // One-to-many: organization has many tenders

  @@index([type])
  @@index([province])
  @@index([municipalityType])
}
```

### 5.3 Enhanced SavedSearch Model

```prisma
model SavedSearch {
  id                   String    @id @default(uuid())
  userId               String
  name                 String    // User-given name for preset
  description          String?   // Optional description

  // Enhanced filter fields
  keywords             String?
  categories           String?   // JSON array (detailed categories)
  provinces            String?   // JSON array (multi-select)
  organOfStateTypes    String?   // JSON array
  municipalityTypes    String?   // JSON array
  tenderTypes          String?   // JSON array
  closingInDays        Int?
  closingDateFrom      DateTime?
  closingDateTo        DateTime?
  publishedSince       DateTime?
  submissionMethods    String?   // JSON array
  buyer                String?   // Free text
  organOfStateId       Int?      // FK to OrganOfState
  status               String?
  hasESubmission       Boolean?
  hasBriefing          Boolean?
  briefingCompulsory   Boolean?
  valueMin             Float?
  valueMax             Float?
  dataQualityMin       Int?      // Minimum quality score
  hasDocuments         Boolean?

  // Metadata
  isPreset             Boolean   @default(false) // User-saved preset
  isDefault            Boolean   @default(false) // Auto-apply on login
  isPublic             Boolean   @default(false) // Shareable link
  usageCount           Int       @default(0)     // Track usage
  alertFrequency       String    @default("none") // "none", "daily", "weekly"
  lastAlertSent        DateTime?
  lastUsedAt           DateTime?
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt

  user                 User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  alertLogs            AlertLog[]

  @@index([userId])
  @@index([isPreset])
  @@index([isPublic])
  @@index([usageCount])
}
```

### 5.4 Migration Strategy

**Phase 1: Add New Fields (Non-Breaking)**
```bash
npx prisma migrate dev --name add-filter-fields
```
- Add all new optional fields to OCDSRelease
- Add new indexes
- No data migration needed yet (all nullable)

**Phase 2: Backfill Data (Background Job)**
```typescript
// scripts/backfill-filter-data.ts
// Similar to slug backfill, process in batches:
// 1. Classify organOfStateType from buyerName
// 2. Categorize tenderType from existing field
// 3. Extract value ranges from tender.value
// 4. Calculate dataQualityScore
// 5. Count documents from enrichmentDocuments
```

**Phase 3: Create OrganOfState Table (Future)**
- Extract unique buyer names
- Classify and deduplicate
- Migrate to normalized table
- Update OCDSRelease with FK

---

## 6. UI/UX Design Recommendations

### 6.1 Component Architecture

**Proposed Structure:**

```
/src/components/filters/
├── FilterContainer.tsx          // Main container with state management
├── FilterHeader.tsx             // Status tabs + result count + sort
├── FilterSidebar.tsx            // Left sidebar (desktop) / drawer (mobile)
│   ├── QuickFilters.tsx         // Tier 1 filters always visible
│   ├── AdvancedFilters.tsx      // Tier 2 collapsible section
│   ├── PremiumFilters.tsx       // Tier 3 (with upgrade gate)
│   └── FilterPresets.tsx        // Saved filter dropdown
├── FilterChips.tsx              // Active filters as removable chips
├── FilterMultiSelect.tsx        // Reusable multi-select with search
├── FilterDateRange.tsx          // Date range picker
├── FilterValueRange.tsx         // Value slider/input
└── FilterMobileDrawer.tsx       // Mobile slide-out panel
```

### 6.2 FilterMultiSelect Component

**Key Features:**
- Search input at top
- Checkbox list with virtual scrolling (for large lists)
- "Select All" / "Clear All" buttons
- Grouped options with expand/collapse
- Filter count badges next to each option
- Loading skeleton while fetching counts

**Technology:**
- Shadcn/ui Command component (with Cmdk)
- Radix UI Popover for dropdown
- React Virtual for performance with 877+ organs

**Example:**
```tsx
<FilterMultiSelect
  label="Categories"
  options={categories}
  value={selectedCategories}
  onChange={setSelectedCategories}
  placeholder="Search categories..."
  showCounts={true}
  groupBy="parentCategory"
  maxHeight={400}
/>
```

### 6.3 Status Tabs (Replacing Dropdown)

**Design:**
```
┌─────────────────────────────────────────────────────────────┐
│ 🔔 Currently Advertised (1,234)  |  🏆 Awarded (456)        │
│ ❌ Cancelled (12)                |  🔒 Closed (89)          │
└─────────────────────────────────────────────────────────────┘
```

**Implementation:**
- Tabs component from Shadcn/ui
- Icon + label + count
- Active state with underline/highlight
- Responsive: horizontal scroll on mobile

### 6.4 Filter Chips (Active Filters)

**Design:**
```
Active Filters (7):  [Construction ×]  [Gauteng ×]  [Western Cape ×]
                    [Municipalities ×]  [Closing in 7 days ×]  [Clear All]
```

**Implementation:**
- Badge components with X button
- Click X to remove individual filter
- "Clear All" button to reset
- Animate in/out on filter changes
- Compact on mobile (show count + expand button)

### 6.5 Mobile-First Drawer

**Design:**
- Bottom sheet drawer on mobile (slides up)
- Filter icon in header (🔽 Filters • 3 active)
- Full-screen overlay when open
- Apply/Cancel buttons at bottom
- Preserve scroll position

**Implementation:**
- Radix UI Dialog or Vaul (bottom sheet)
- Swipe to close gesture
- Backdrop blur
- Smooth animations

### 6.6 Filter Preset Dropdown

**Design:**
```
┌────────────────────────────────┐
│ 💾 My Filter Presets           │
├────────────────────────────────┤
│ ⭐ Construction in Gauteng     │
│    IT & Software               │
│    Security Services           │
│    Medical Supplies            │
├────────────────────────────────┤
│ + Save Current Filters         │
│ 📚 Browse Preset Library       │
└────────────────────────────────┘
```

**Features:**
- Star icon for default preset
- Usage count indicator
- Edit/Delete on hover
- Shareable link icon
- Preset library (curated by ProTenders)

### 6.7 Loading States

**Filter Counts Loading:**
- Skeleton loader for counts
- "(Loading...)" next to options
- Progressive enhancement (show options first, counts later)

**Results Loading:**
- Skeleton cards for tender results
- "Applying filters..." message
- Progress indicator for slow queries

### 6.8 Empty States

**No Results:**
- Friendly message: "No tenders match your filters"
- Suggestions:
  - "Try removing some filters"
  - "Expand your date range"
  - "Search other provinces"
- Related tenders suggestion
- Save search for future alerts

**No Filters Active:**
- "Showing all tenders (Sort: Latest first)"
- Quick filter suggestions
- Featured tenders carousel

### 6.9 Accessibility

**WCAG 2.1 AA Compliance:**
- Keyboard navigation for all filters
- ARIA labels for screen readers
- Focus indicators
- High contrast mode support
- Skip to results link
- Clear error messages

---

## 7. API Enhancements

### 7.1 Enhanced Search Endpoint

**Endpoint:** `POST /api/search` (consider changing from GET for complex filters)

**Request Body:**
```typescript
interface SearchRequest {
  // Existing
  keywords?: string;
  categories?: string[]; // Now supports 91 detailed categories
  province?: string | string[]; // Now multi-select
  closingInDays?: number;
  submissionMethods?: string[];
  buyer?: string;
  status?: string;
  page?: number;
  pageSize?: number;
  publishedSince?: string;
  sort?: 'latest' | 'closingSoon' | 'relevance' | 'value';

  // NEW: Enhanced filters
  organOfStateTypes?: string[]; // ["Local Municipality", "SOE"]
  municipalityTypes?: string[]; // ["Metro", "Local"]
  tenderTypes?: string[]; // ["RFQ", "RFP"]
  closingDateFrom?: string;
  closingDateTo?: string;
  hasESubmission?: boolean;
  hasBriefing?: boolean;
  briefingCompulsory?: boolean;
  valueMin?: number;
  valueMax?: number;
  dataQualityMin?: number; // 0-100
  hasDocuments?: boolean;
  city?: string[];
  district?: string[];

  // NEW: Faceted search control
  includeFacets?: boolean; // Default: false (for performance)
  facetFields?: string[]; // ["detailedCategory", "province", "organOfStateType"]
}
```

**Response:**
```typescript
interface SearchResponse {
  results: Tender[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;

  // NEW: Faceted search results
  facets?: {
    detailedCategory?: { value: string; count: number }[];
    province?: { value: string; count: number }[];
    organOfStateType?: { value: string; count: number }[];
    tenderType?: { value: string; count: number }[];
    status?: { value: string; count: number }[];
    // ... other facets
  };

  // NEW: Applied filters summary
  appliedFilters?: {
    count: number;
    filters: { field: string; value: any }[];
  };
}
```

### 7.2 New Facets Endpoint

**Endpoint:** `GET /api/search/facets`

**Purpose:** Pre-calculate filter counts for all options (cached)

**Query Params:**
```typescript
?fields=detailedCategory,province,organOfStateType
&status=active
&closingAfter=2025-12-01
```

**Response:**
```json
{
  "facets": {
    "detailedCategory": [
      { "value": "Construction", "count": 234 },
      { "value": "IT Services", "count": 89 },
      { "value": "Security Services", "count": 67 }
    ],
    "province": [
      { "value": "Gauteng", "count": 456 },
      { "value": "Western Cape", "count": 234 }
    ],
    "organOfStateType": [
      { "value": "Local Municipality", "count": 345 },
      { "value": "SOE", "count": 123 }
    ]
  },
  "cachedAt": "2025-12-01T10:30:00Z",
  "ttl": 300 // seconds
}
```

**Caching Strategy:**
- Redis cache with 5-minute TTL
- Background job refreshes every 5 minutes
- Cache key includes active status + date range
- Invalidate on new tender import

### 7.3 Filter Presets Endpoints

**List User Presets:** `GET /api/filters/presets`
```json
{
  "presets": [
    {
      "id": "uuid",
      "name": "Construction in Gauteng",
      "filters": { /* saved filter state */ },
      "isDefault": true,
      "usageCount": 45,
      "lastUsedAt": "2025-11-30T08:00:00Z"
    }
  ]
}
```

**Save Preset:** `POST /api/filters/presets`
**Update Preset:** `PATCH /api/filters/presets/:id`
**Delete Preset:** `DELETE /api/filters/presets/:id`
**Apply Preset:** `GET /api/filters/presets/:id/apply` (returns filter state)

### 7.4 Performance Optimizations

**Query Building:**
```typescript
// Use Prisma's query builder with proper indexes
const where: Prisma.OCDSReleaseWhereInput = {
  AND: [
    // Status filter (indexed)
    status === 'active' ? { status: 'active' } : {},

    // Categories (indexed on detailedCategory)
    categories?.length > 0 ? { detailedCategory: { in: categories } } : {},

    // Provinces (indexed)
    provinces?.length > 0 ? { province: { in: provinces } } : {},

    // Organ types (indexed)
    organOfStateTypes?.length > 0 ? { organOfStateType: { in: organOfStateTypes } } : {},

    // Date range (indexed on closingAt)
    closingDateFrom ? { closingAt: { gte: new Date(closingDateFrom) } } : {},
    closingDateTo ? { closingAt: { lte: new Date(closingDateTo) } } : {},

    // Value range (indexed on estimatedValueMin, estimatedValueMax)
    valueMin !== undefined || valueMax !== undefined ? {
      AND: [
        valueMin !== undefined ? { estimatedValueMax: { gte: valueMin } } : {},
        valueMax !== undefined ? { estimatedValueMin: { lte: valueMax } } : {},
      ],
    } : {},

    // Boolean filters (indexed)
    hasESubmission !== undefined ? { hasESubmission } : {},
  ],
};

// Use select to only fetch needed fields
const tenders = await prisma.oCDSRelease.findMany({
  where,
  select: {
    id: true,
    ocid: true,
    slug: true,
    tenderTitle: true,
    buyerName: true,
    detailedCategory: true,
    closingAt: true,
    status: true,
    province: true,
    // ... only fields needed for tender cards
  },
  skip: (page - 1) * pageSize,
  take: pageSize,
  orderBy: sort === 'latest' ? { publishedAt: 'desc' } : { closingAt: 'asc' },
});
```

**Faceted Search with Prisma:**
```typescript
// Use groupBy for counts (requires PostgreSQL)
const categoryCounts = await prisma.oCDSRelease.groupBy({
  by: ['detailedCategory'],
  where: { status: 'active', closingAt: { gte: new Date() } },
  _count: { _all: true },
  orderBy: { _count: { _all: 'desc' } },
});

// Transform to facet format
const categoryFacets = categoryCounts.map(c => ({
  value: c.detailedCategory,
  count: c._count._all,
}));
```

**Parallel Queries:**
```typescript
// Fetch results and facets in parallel
const [results, totalCount, facets] = await Promise.all([
  prisma.oCDSRelease.findMany({ /* query */ }),
  prisma.oCDSRelease.count({ where }),
  includeFacets ? getFacets(where) : null,
]);
```

---

## 8. Implementation Roadmap

### **Week 1: Data Enrichment & Schema (Dec 1-7)**

**Goals:**
- Enhance database with new filter fields
- Backfill existing data with classifications
- Ensure data quality and completeness

**Tasks:**

**Monday - Tuesday: Schema Design**
- [x] Define new Prisma schema fields
- [x] Create migration scripts
- [ ] Write data validation rules
- [ ] Design organOfStateType classification logic
- [ ] Plan tenderType normalization

**Wednesday - Thursday: Migration & Backfill**
- [ ] Run Prisma migration (add new fields)
- [ ] Deploy migration to production database
- [ ] Create backfill script (similar to slug backfill)
  - Classify organOfStateType from buyerName
  - Normalize tenderType categories
  - Extract value ranges from JSON
  - Calculate dataQualityScore
  - Count documents
- [ ] Run backfill in batches (100 records at a time)
- [ ] Monitor for errors and edge cases

**Friday: Data Validation & Testing**
- [ ] Verify backfill results (spot checks)
- [ ] Check index performance (EXPLAIN ANALYZE queries)
- [ ] Test query performance with new fields
- [ ] Document classification rules
- [ ] Create data quality report

**Deliverables:**
- ✅ Enhanced Prisma schema
- ✅ All existing tenders classified
- ✅ New indexes created and optimized
- ✅ Data quality report (>95% classification accuracy)

---

### **Week 2: API Enhancement (Dec 8-14)**

**Goals:**
- Enhance search API with new filters
- Implement faceted search endpoint
- Add caching layer for performance
- Create filter presets API

**Tasks:**

**Monday - Tuesday: Search API Enhancement**
- [ ] Update `/api/search/route.ts` with new parameters
- [ ] Implement complex where clause building
- [ ] Add validation for new filter params
- [ ] Test query performance with various filter combinations
- [ ] Optimize slow queries (add explain plans)

**Wednesday: Faceted Search Endpoint**
- [ ] Create `/api/search/facets` endpoint
- [ ] Implement groupBy queries for counts
- [ ] Add Redis caching (5-minute TTL)
- [ ] Create background job to refresh cache
- [ ] Test with large datasets (10k+ tenders)

**Thursday: Filter Presets API**
- [ ] Create CRUD endpoints for SavedSearch
- [ ] Add validation for preset names
- [ ] Implement usage tracking (usageCount)
- [ ] Add default preset logic
- [ ] Test with multiple users

**Friday: Testing & Documentation**
- [ ] Write API integration tests
- [ ] Load test with 100 concurrent requests
- [ ] Document all new endpoints (OpenAPI/Swagger)
- [ ] Create API usage examples
- [ ] Performance benchmarking report

**Deliverables:**
- ✅ Enhanced search API with 20+ filter parameters
- ✅ Faceted search with caching (< 500ms response)
- ✅ Filter presets CRUD API
- ✅ API documentation
- ✅ Performance benchmarks

---

### **Week 3: UI Implementation - Tier 1 & 2 (Dec 15-21)**

**Goals:**
- Redesign FilterPanel component
- Implement multi-select components
- Add filter chips and status tabs
- Build mobile-responsive drawer

**Tasks:**

**Monday: Component Architecture**
- [ ] Create new component structure (/src/components/filters/)
- [ ] Set up FilterContainer with state management
- [ ] Design filter state shape (TypeScript interfaces)
- [ ] Implement URL sync (filters ↔ query params)

**Tuesday - Wednesday: Tier 1 Filters**
- [ ] Build FilterMultiSelect component (with search)
  - [ ] Virtual scrolling for large lists
  - [ ] Grouped options with expand/collapse
  - [ ] Filter count badges
- [ ] Implement Status Tabs (replacing dropdown)
- [ ] Create FilterDateRange component
- [ ] Add Keywords search with autocomplete
- [ ] Build Sort dropdown

**Thursday: Tier 2 Filters**
- [ ] Create AdvancedFilters collapsible section
- [ ] Implement Organ of State multi-select (877 options)
  - [ ] Group by type (Municipalities, Departments, SOEs, etc.)
  - [ ] Quick filter buttons ("All Municipalities")
- [ ] Add Tender Type checkboxes
- [ ] Build Municipality Type radio buttons
- [ ] Implement eSubmission checkbox
- [ ] Add Briefing filters

**Friday: Filter Chips & Mobile**
- [ ] Create FilterChips component (active filters)
  - [ ] Remove individual chip
  - [ ] Clear all button
  - [ ] Compact mode for mobile
- [ ] Build FilterMobileDrawer (bottom sheet)
  - [ ] Swipe to close
  - [ ] Apply/Cancel buttons
- [ ] Implement responsive breakpoints
- [ ] Test on mobile devices

**Deliverables:**
- ✅ Complete Tier 1 & 2 filter UI
- ✅ Mobile-responsive drawer
- ✅ Active filter chips
- ✅ Multi-select with search (877+ organs)
- ✅ Responsive on all screen sizes

---

### **Week 4: Polish, Premium Filters & Testing (Dec 22-28)**

**Goals:**
- Implement Tier 3 premium filters
- Add filter presets UI
- Polish UX and animations
- Comprehensive testing and bug fixes

**Tasks:**

**Monday: Tier 3 Premium Filters**
- [ ] Create PremiumFilters component (with upgrade gate)
- [ ] Build ValueRange slider component
- [ ] Implement Delivery Location multi-select
- [ ] Add Data Quality Score filter
- [ ] Create Document Availability filters
- [ ] Add Contact Availability checkboxes

**Tuesday: Filter Presets UI**
- [ ] Build FilterPresets dropdown component
- [ ] Implement "Save Current Filters" modal
  - [ ] Name input
  - [ ] Set as default checkbox
- [ ] Create preset card (with edit/delete)
- [ ] Add preset library modal (curated presets)
- [ ] Implement quick-load functionality

**Wednesday: UX Polish**
- [ ] Add loading skeletons for filter counts
- [ ] Implement smooth animations (filter chips, drawer)
- [ ] Create empty states (no results, no presets)
- [ ] Add keyboard navigation
- [ ] Implement focus management
- [ ] Add ARIA labels for accessibility

**Thursday: Integration Testing**
- [ ] Test all filter combinations (smoke tests)
- [ ] Test mobile responsiveness (iOS Safari, Chrome)
- [ ] Test keyboard navigation
- [ ] Screen reader testing (NVDA, VoiceOver)
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Performance testing (Lighthouse, Core Web Vitals)

**Friday: Bug Fixes & Deployment**
- [ ] Fix critical bugs from testing
- [ ] Optimize slow interactions
- [ ] Update documentation
- [ ] Deploy to staging
- [ ] Final QA review
- [ ] Deploy to production (gradual rollout)

**Deliverables:**
- ✅ Tier 3 premium filters
- ✅ Filter presets UI
- ✅ Polished UX with animations
- ✅ Accessibility compliant (WCAG 2.1 AA)
- ✅ Production deployment
- ✅ User documentation

---

### **Post-Launch: Monitoring & Iteration (Jan 2026)**

**Week 1 Post-Launch:**
- [ ] Monitor filter usage analytics (Mixpanel)
- [ ] Track most-used filters
- [ ] Identify slow queries (APM tools)
- [ ] Collect user feedback
- [ ] Fix reported bugs

**Week 2 Post-Launch:**
- [ ] Analyze filter performance metrics
- [ ] Optimize slow filter combinations
- [ ] A/B test filter UI variations
- [ ] Implement user suggestions
- [ ] Plan Phase 3 enhancements (AI-powered, smart defaults)

---

## 9. Technical Considerations

### 9.1 Performance

**Database Query Optimization:**
- ✅ Use composite indexes for common filter combinations
- ✅ Limit fields in SELECT (only needed for tender cards)
- ⚠️ Watch for N+1 queries in nested relations
- ✅ Use `skip` and `take` for pagination (not offset/limit)
- ✅ Implement cursor-based pagination for very large result sets

**Caching Strategy:**
- **Facet Counts:** Redis cache with 5-minute TTL (refreshed by cron job)
- **Filter Presets:** In-memory cache (user-specific, invalidate on update)
- **Tender Results:** No caching (real-time data critical)
- **Enrichment Data:** 24h TTL (already implemented)

**Frontend Optimization:**
- **Virtual Scrolling:** For large lists (877+ organs) using React Virtual
- **Debounced Search:** 300ms delay on keyword input
- **Lazy Loading:** Load filter counts only when dropdown opens
- **Code Splitting:** Split filter components into separate chunks
- **Memoization:** React.memo for filter option components

**Performance Targets:**
- Search API response < 500ms (p95)
- Facet API response < 200ms (p95) with cache
- Filter interaction < 100ms (instant feel)
- Page load time < 2s (LCP)
- Mobile drawer animation 60fps

### 9.2 Scalability

**Handling 200+ Tenders Daily:**
- Database size after 1 year: ~73,000 tenders
- Indexes will grow proportionally
- Plan for regular VACUUM ANALYZE (PostgreSQL)
- Monitor query performance monthly
- Consider partitioning by year if >100k tenders

**Faceted Search at Scale:**
- Facet counts become slow with large datasets
- Solution: Pre-calculate and cache every 5 minutes
- Background job uses materialized view or temp table
- Cache invalidation on new tender import

**Multi-Select with 877 Organs:**
- Virtual scrolling essential (render only visible items)
- Search/filter on client side (faster UX)
- Load in chunks if network payload too large

### 9.3 Data Quality

**Classification Accuracy:**
- organOfStateType: Use keyword matching + manual review
- Target: >95% accuracy
- Manual review for edge cases (436 "Other" organs)
- Feedback loop: Allow users to report misclassifications

**Value Range Extraction:**
- Parse from tender.value.amount (OCDS standard)
- Fallback: Extract from description with regex
- Handle ranges: "R100k - R500k"
- Store min and max separately

**Data Quality Score Calculation:**
```typescript
function calculateDataQualityScore(tender: OCDSRelease): number {
  let score = 0;
  const weights = {
    tenderTitle: 10,
    tenderDescription: 10,
    buyerName: 10,
    closingAt: 15,
    detailedCategory: 10,
    contactEmail: 10,
    contactTelephone: 5,
    province: 5,
    tenderType: 5,
    estimatedValue: 10,
    hasDocuments: 5,
    briefingDate: 5,
  };

  if (tender.tenderTitle) score += weights.tenderTitle;
  if (tender.tenderDescription && tender.tenderDescription.length > 50) score += weights.tenderDescription;
  if (tender.buyerName) score += weights.buyerName;
  if (tender.closingAt) score += weights.closingAt;
  if (tender.detailedCategory) score += weights.detailedCategory;
  if (tender.contactEmail) score += weights.contactEmail;
  if (tender.contactTelephone) score += weights.contactTelephone;
  if (tender.province) score += weights.province;
  if (tender.tenderType) score += weights.tenderType;
  if (tender.estimatedValueMin !== null) score += weights.estimatedValue;
  if (tender.hasDocuments) score += weights.hasDocuments;
  if (tender.briefingDate) score += weights.briefingDate;

  return Math.min(score, 100); // Cap at 100
}
```

### 9.4 Security

**API Rate Limiting:**
- Limit facet endpoint: 10 req/min per user (prevents abuse)
- Search endpoint: 60 req/min per user
- Presets: 30 req/min per user

**Input Validation:**
- Validate all filter parameters (type, range, enum values)
- Sanitize free-text inputs (buyer name, keywords)
- Prevent SQL injection (Prisma handles this, but double-check)

**Access Control:**
- Tier 3 filters require active subscription
- Check user.plan before returning premium filters
- Hide premium options for free users (with upgrade CTA)

### 9.5 Analytics & Monitoring

**Track Filter Usage:**
```typescript
// Mixpanel events (already implemented)
trackFilterChange('detailedCategory', 'Construction', true);
trackSearch(keywords, {
  categories: ['Construction', 'IT Services'],
  provinces: ['Gauteng'],
  organOfStateTypes: ['Local Municipality'],
  // ... all active filters
});
```

**Dashboard Metrics:**
- Most-used filter categories (top 10)
- Avg filters per search
- Filter combination patterns
- Most-saved presets
- Filter performance (slow queries)

**Alerting:**
- Search API latency > 1s (p95)
- Facet cache miss rate > 10%
- Database query time > 2s
- Error rate > 1%

---

## 10. Success Metrics

### 10.1 KPIs (Key Performance Indicators)

**User Engagement:**
- **Avg Filters per Search:** Increase from 1.5 to 3.5 (target: 2x improvement)
- **Filter Usage Rate:** 85% of searches use at least 1 advanced filter
- **Saved Presets:** 40% of active users create at least 1 preset
- **Preset Usage:** 50% of searches use saved presets (after creation)

**Search Quality:**
- **Results Relevance:** User feedback score > 4.0/5.0
- **Empty Results Rate:** Decrease from 15% to < 5%
- **Refinement Rate:** 30% of users refine filters after first search (healthy exploration)

**Performance:**
- **Search Response Time:** p95 < 500ms (currently ~300ms, target: maintain)
- **Facet Response Time:** p95 < 200ms (with caching)
- **Page Load Time:** LCP < 2.0s (currently 1.8s, target: maintain)
- **Mobile Performance:** Performance score > 90 (Lighthouse)

**Business Impact:**
- **User Retention:** 15% increase in 30-day retention
- **Session Duration:** 25% increase (users spend more time finding tenders)
- **Conversions:** 20% increase in saved tenders (better relevance)
- **Premium Upgrades:** 10% increase (driven by Tier 3 filters)

### 10.2 A/B Testing Plan

**Phase 1: Baseline (Dec 1-7)**
- Measure current filter usage
- Track search patterns
- Establish baseline metrics

**Phase 2: Gradual Rollout (Dec 22-28)**
- 10% of users get new filters (Dec 22-23)
- 25% of users (Dec 24-25)
- 50% of users (Dec 26-27)
- 100% of users (Dec 28)

**Phase 3: Comparison (Jan 2026)**
- Compare metrics: Old filters vs New filters
- Analyze user feedback
- Identify areas for improvement

### 10.3 User Feedback Collection

**In-App Surveys:**
- After 3 searches: "How helpful were the filters?" (1-5 stars)
- After saving preset: "Would you recommend this feature?" (NPS)
- Monthly: "What filter would you like to see added?" (open-ended)

**User Interviews:**
- 10 power users (use filters daily)
- 10 new users (first week)
- 10 free users (potential premium candidates)

**Analytics Events:**
- Filter opened (track which filters are most explored)
- Filter applied (track most-used values)
- Filter removed (track which filters are too narrow)
- Preset saved, loaded, edited, deleted
- Empty results (track filter combinations that yield no results)

---

## Appendices

### Appendix A: eTenders Data Files

Generated by `extract-etenders-data.js`:

1. **etenders-categories.json** - All 91 detailed categories with IDs
2. **etenders-provinces.json** - All 10 provinces with IDs
3. **etenders-organs-of-state.json** - All 877 organs of state with IDs
4. **etenders-organs-by-type.json** - Organs classified by type (9 categories)

### Appendix B: Prisma Migration Script

**File:** `prisma/migrations/YYYYMMDDHHMMSS_add_filter_fields/migration.sql`

```sql
-- Add new filter fields to OCDSRelease
ALTER TABLE "OCDSRelease" ADD COLUMN "organOfStateType" TEXT;
ALTER TABLE "OCDSRelease" ADD COLUMN "municipalityType" TEXT;
ALTER TABLE "OCDSRelease" ADD COLUMN "tenderTypeCategory" TEXT;
ALTER TABLE "OCDSRelease" ADD COLUMN "procurementMethod" TEXT;
ALTER TABLE "OCDSRelease" ADD COLUMN "estimatedValueMin" DOUBLE PRECISION;
ALTER TABLE "OCDSRelease" ADD COLUMN "estimatedValueMax" DOUBLE PRECISION;
ALTER TABLE "OCDSRelease" ADD COLUMN "valueCurrency" TEXT DEFAULT 'ZAR';
ALTER TABLE "OCDSRelease" ADD COLUMN "hasESubmission" BOOLEAN DEFAULT false;
ALTER TABLE "OCDSRelease" ADD COLUMN "eSubmissionPortal" TEXT;
ALTER TABLE "OCDSRelease" ADD COLUMN "city" TEXT;
ALTER TABLE "OCDSRelease" ADD COLUMN "district" TEXT;
ALTER TABLE "OCDSRelease" ADD COLUMN "documentCount" INTEGER DEFAULT 0;
ALTER TABLE "OCDSRelease" ADD COLUMN "hasDocuments" BOOLEAN DEFAULT false;
ALTER TABLE "OCDSRelease" ADD COLUMN "documentTypes" JSONB;
ALTER TABLE "OCDSRelease" ADD COLUMN "dataQualityScore" INTEGER;
ALTER TABLE "OCDSRelease" ADD COLUMN "maaaNumber" TEXT;

-- Create indexes for new fields
CREATE INDEX "OCDSRelease_organOfStateType_idx" ON "OCDSRelease"("organOfStateType");
CREATE INDEX "OCDSRelease_municipalityType_idx" ON "OCDSRelease"("municipalityType");
CREATE INDEX "OCDSRelease_tenderTypeCategory_idx" ON "OCDSRelease"("tenderTypeCategory");
CREATE INDEX "OCDSRelease_estimatedValueMin_estimatedValueMax_idx" ON "OCDSRelease"("estimatedValueMin", "estimatedValueMax");
CREATE INDEX "OCDSRelease_hasESubmission_idx" ON "OCDSRelease"("hasESubmission");
CREATE INDEX "OCDSRelease_city_idx" ON "OCDSRelease"("city");
CREATE INDEX "OCDSRelease_district_idx" ON "OCDSRelease"("district");
CREATE INDEX "OCDSRelease_dataQualityScore_idx" ON "OCDSRelease"("dataQualityScore");
CREATE INDEX "OCDSRelease_maaaNumber_idx" ON "OCDSRelease"("maaaNumber");

-- Composite indexes for common filter combinations
CREATE INDEX "OCDSRelease_organOfStateType_province_idx" ON "OCDSRelease"("organOfStateType", "province");
CREATE INDEX "OCDSRelease_tenderTypeCategory_closingAt_idx" ON "OCDSRelease"("tenderTypeCategory", "closingAt" DESC);
CREATE INDEX "OCDSRelease_detailedCategory_province_status_idx" ON "OCDSRelease"("detailedCategory", "province", "status");
CREATE INDEX "OCDSRelease_hasESubmission_status_closingAt_idx" ON "OCDSRelease"("hasESubmission", "status", "closingAt" DESC);
```

### Appendix C: Backfill Script Template

**File:** `scripts/backfill-filter-data.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function classifyOrganOfState(buyerName: string): Promise<string | null> {
  if (!buyerName) return null;

  const nameLower = buyerName.toLowerCase();

  // Classify by keywords
  if (nameLower.includes('local municipality')) return 'Local Municipality';
  if (nameLower.includes('district municipality')) return 'District Municipality';
  if (nameLower.includes('metro') || nameLower.includes('metropolitan')) return 'Metro Municipality';
  if (nameLower.includes('department of') || nameLower.startsWith('dept')) {
    // Check if national or provincial
    if (nameLower.includes('national') || !nameLower.match(/(western cape|eastern cape|gauteng|kwazulu|limpopo|mpumalanga|northern cape|north west|free state)/)) {
      return 'National Department';
    }
    return 'Provincial Department';
  }
  if (nameLower.includes('seta') || nameLower.includes('education and training authority')) return 'SETA';
  if (nameLower.includes('soc ltd') || nameLower.includes('limited') || nameLower.includes('(pty)')) return 'SOE';
  if (nameLower.includes('agency') || nameLower.includes('authority') || nameLower.includes('board') || nameLower.includes('commission')) return 'Agency';

  return 'Other';
}

async function categorizeTenderType(tenderType: string | null): Promise<string | null> {
  if (!tenderType) return null;

  const typeLower = tenderType.toLowerCase();

  if (typeLower.includes('rfq') || typeLower.includes('quotation')) return 'RFQ';
  if (typeLower.includes('rfp') || typeLower.includes('proposal')) return 'RFP';
  if (typeLower.includes('rfi') || typeLower.includes('information')) return 'RFI';
  if (typeLower.includes('eoi') || typeLower.includes('expression of interest')) return 'EOI';
  if (typeLower.includes('contract')) return 'Contract';
  if (typeLower.includes('bid')) return 'Bid';

  return 'Other';
}

async function backfillBatch(skip: number, batchSize: number) {
  const tenders = await prisma.oCDSRelease.findMany({
    where: {
      organOfStateType: null, // Only process records not yet classified
    },
    skip,
    take: batchSize,
    select: {
      id: true,
      buyerName: true,
      tenderType: true,
      json: true, // For value extraction
    },
  });

  console.log(`Processing batch: ${skip + 1} to ${skip + tenders.length}`);

  for (const tender of tenders) {
    // Classify organ of state
    const organType = await classifyOrganOfState(tender.buyerName || '');

    // Categorize tender type
    const tenderCategory = await categorizeTenderType(tender.tenderType);

    // Extract value from JSON
    let valueMin: number | null = null;
    let valueMax: number | null = null;
    try {
      const data = JSON.parse(tender.json);
      if (data.tender?.value?.amount) {
        valueMin = valueMax = parseFloat(data.tender.value.amount);
      }
    } catch (e) {
      // Ignore parse errors
    }

    // Update record
    await prisma.oCDSRelease.update({
      where: { id: tender.id },
      data: {
        organOfStateType: organType,
        tenderTypeCategory: tenderCategory,
        estimatedValueMin: valueMin,
        estimatedValueMax: valueMax,
      },
    });
  }

  console.log(`✓ Batch complete: ${tenders.length} processed`);
}

async function main() {
  const batchSize = 100;
  let skip = 0;
  let hasMore = true;

  while (hasMore) {
    const count = await prisma.oCDSRelease.count({
      where: { organOfStateType: null },
    });

    if (count === 0) {
      hasMore = false;
      console.log('✅ Backfill complete!');
      break;
    }

    await backfillBatch(skip, batchSize);
    skip += batchSize;

    // Wait 1 second between batches to avoid overloading DB
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

### Appendix D: Component Mockup (ASCII)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ProTenders - Search Tenders                                   [User ▼] │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ Status:  [🔔 Currently Advertised (1,234)] [🏆 Awarded (456)]         │
│          [❌ Cancelled (12)]              [🔒 Closed (89)]             │
│                                                                         │
│ Active Filters (5):  [Construction ×]  [Gauteng ×]  [Municipalities ×] │
│                      [Closing in 7 days ×]  [Clear All]                │
│                                                                         │
├─────────────────┬───────────────────────────────────────────────────────┤
│                 │                                                       │
│ 🔍 Quick Find   │ Showing 234 results • Sort: [Latest ▼]               │
│                 │                                                       │
│ Keywords:       │ ┌─────────────────────────────────────────────────┐ │
│ [Search...]     │ │ ⭐ Construction of New School Building          │ │
│                 │ │    City of Cape Town • Western Cape             │ │
│ Categories:     │ │    Closing: 2025-12-15 (7 days) • RFB          │ │
│ [Construction▼] │ │    Category: Construction • Value: R5.2M       │ │
│  (234 results)  │ │    📎 5 documents • 📧 Contact available        │ │
│                 │ └─────────────────────────────────────────────────┘ │
│ Provinces:      │                                                       │
│ ☑ Gauteng (89)  │ ┌─────────────────────────────────────────────────┐ │
│ ☑ W. Cape (67)  │ │ Supply and Delivery of Medical Equipment        │ │
│ ☐ KZN (45)      │ │    Gauteng Department of Health                 │ │
│ ☐ E. Cape (23)  │ │    Closing: 2025-12-18 (10 days) • RFQ         │ │
│                 │ │    Category: Supplies: Medical • Value: R2.1M   │ │
│ Closing:        │ │    📎 3 documents • 📧 Contact available        │ │
│ ◉ Next 7 days   │ └─────────────────────────────────────────────────┘ │
│ ○ Next 30 days  │                                                       │
│ ○ Custom range  │ [More results...]                                    │
│                 │                                                       │
│ ▶ Advanced      │ [1] 2 3 ... 24 [Next →]                              │
│   Filters       │                                                       │
│                 │                                                       │
│ 💾 My Presets ▼ │                                                       │
│  • Gauteng      │                                                       │
│    Construction │                                                       │
│  • IT Services  │                                                       │
│                 │                                                       │
└─────────────────┴───────────────────────────────────────────────────────┘
```

---

## Conclusion

This comprehensive plan outlines a 4-week implementation to transform ProTenders' filtering system from basic (3 categories) to world-class (91 categories, 877 organs of state, 20+ advanced filters).

**Key Success Factors:**
1. ✅ Data is already available (detailedCategory field populated)
2. ✅ Strong database foundation (indexes, enrichment)
3. ✅ Clear roadmap with realistic timelines
4. ✅ Differentiation opportunities (presets, mobile UX, AI-powered)
5. ✅ Measurable success metrics

**Next Steps:**
1. Review this plan with stakeholders
2. Prioritize features (can we cut scope for faster delivery?)
3. Assign resources (developers, designers, QA)
4. Kick off Week 1 (Schema + Data Enrichment)
5. Set up monitoring dashboard

**Questions for Decision:**
- Do we implement all 3 tiers in December, or launch Tier 1+2 first?
- Should premium filters (Tier 3) be subscription-gated immediately?
- Which filter counts should we pre-calculate vs calculate on-demand?
- Mobile-first or desktop-first implementation?

---

**Document Prepared By:** ProTenders Planning Team
**For Questions:** Contact development team or refer to extracted data files

**Files in This Folder:**
- `deep-filtering-system.md` (this document)
- `etenders-categories.json` (91 categories)
- `etenders-provinces.json` (10 provinces)
- `etenders-organs-of-state.json` (877 organs)
- `etenders-organs-by-type.json` (classified by 9 types)
- `extract-etenders-data.js` (data extraction script)
