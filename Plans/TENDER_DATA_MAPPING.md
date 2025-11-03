# Tender Data Mapping Analysis

## Executive Summary

The OCDS API (`ocds-api.etenders.gov.za`) provides **partial data**. Rich fields like contact person, briefing sessions, and detailed requirements are only available on the eTenders website HTML and are NOT exposed via the OCDS API.

## Data Sources Comparison

### ✅ Available in OCDS API (What We Currently Have)

#### Core Tender Fields
- `ocid` - Open Contracting ID
- `id` - Release ID
- `date` - Release date
- `tag` - Release tags (e.g., ["compiled"])
- `initiationType` - Usually "tender"
- `language` - Usually "en-za"

#### Tender Object (`tender`)
- `id` - Tender number (e.g., "138900", "ARC/33/03/2024/3")
- `title` - Short title or tender number
- `description` - Full tender description
- `status` - Usually empty string ""
- `mainProcurementCategory` - "goods", "services", "works", or empty
- `additionalProcurementCategories` - Array of categories
- `value.amount` - Usually 0 (not disclosed)
- `value.currency` - "ZAR"
- `procurementMethod` - "open", "selective", etc.
- `procurementMethodDetails` - "Request for Bid(Open-Tender)", etc.
- `tenderPeriod.startDate` - Publication date
- `tender Period.endDate` - Closing date
- `documents[]` - Array of tender documents
  - `id` - Document UUID
  - `documentType` - "basic", "specifications", etc.
  - `title` - Document filename
  - `description` - Document description
  - `url` - Download URL
  - `datePublished` - Upload date
  - `dateModified` - Modification date
  - `format` - "pdf", "doc", etc.
  - `language` - "en"
- `procuringEntity.id` - Buyer ID
- `procuringEntity.name` - Buyer name
- `tenderers` - Always EMPTY array []

#### Buyer Object
- `id` - Buyer ID
- `name` - Buyer organization name

#### Planning Object
- `rationale` - Usually empty
- `budget.description` - Usually " - "
- `documents` - Usually empty array

#### Other Arrays (Always Empty in OCDS API)
- `parties` - Always EMPTY []
- `awards` - Always EMPTY []
- `contracts` - Always EMPTY []

### ❌ NOT Available in OCDS API (Only on eTenders Website)

These fields appear in the eTenders website HTML but are **NOT** in the OCDS API:

#### Contact Information (ENQUIRIES Section)
- Contact Person name
- Email address
- Telephone number
- Fax number

#### Briefing Session Details
- Is there a briefing session? (Yes/No)
- Is it compulsory? (Yes/No)
- Briefing Date and Time
- Briefing Venue address

#### Additional Details
- Province - Must be inferred from buyer name or address
- Place where goods/works/services are required - Not in OCDS
- Special Conditions - Sometimes in `eligibilityCriteria` but usually empty
- Exact tender type beyond `procurementMethodDetails`

## Current Database Storage

We store the **complete OCDS release** in:
- `OCDSRelease.json` field (full JSON)
- Plus denormalized fields for fast querying

**We ARE storing everything the OCDS API provides.**
**We are NOT missing any data from OCDS API.**

## What Our Tender Detail Page Currently Shows

### ✅ Correctly Mapped (From OCDS Data)
1. Tender Number → `tender.id`
2. Organ of State → `buyer.name` or `procuringEntity.name`
3. Tender Type → `tender.procurementMethodDetails`
4. Date Published → `date` or `tenderPeriod.startDate`
5. Closing Date → `tenderPeriod.endDate`
6. Description → `tender.description`
7. Estimated Value → `tender.value.amount`
8. Documents → `tender.documents[]`

### ⚠️ Partially Available (Requires Inference/Fallback)
1. **Province** - Not in OCDS, must infer from:
   - Buyer name (e.g., "Limpopo - Department of...")
   - Organization lookup table
   - Currently using best-effort text matching

2. **Place of Delivery** - Not reliably in OCDS
   - Sometimes in `items[].deliveryLocation.address`
   - Often missing entirely

3. **Special Conditions** - Rarely populated
   - `tender.eligibilityCriteria` - usually empty
   - `tender.otherRequirements` - usually empty

### ❌ Not Available (Requires Web Scraping)
1. **Contact Person** - Not in OCDS API
   - `contactPoint` object not populated
   - Would need to scrape from eTenders website

2. **Contact Email/Phone/Fax** - Not in OCDS API
   - Would need HTML scraping

3. **Briefing Session Details** - Not in OCDS API
   - No `tender.briefing` object in actual data
   - Would need HTML scraping

## Recommendations

### Immediate (Use Available OCDS Data Better)

1. **Enhance Document Display**
   - Show all documents with proper metadata
   - Group by document type
   - Show upload dates clearly

2. **Better Value Display**
   - When `value.amount = 0`, show "Value not disclosed"
   - Don't mislead users with R0.00

3. **Improve Category Display**
   - Show both `mainProcurementCategory` and `additionalProcurementCategories`
   - Display as badges/chips

4. **Timeline Visualization**
   - Show `tenderPeriod.startDate` to `endDate`
   - Days remaining calculation
   - Urgency indicators

### Future Enhancement (Requires Additional Development)

1. **HTML Scraping Service**
   - Create a separate scraper that fetches eTenders website pages
   - Extract contact information, briefing details
   - Store in separate database table `TenderEnrichment`
   - Link by OCID

2. **Organization Database**
   - Create table mapping buyer IDs to provinces
   - Add full contact information
   - Maintain addresses

3. **AI Enhancement**
   - Use LLM to extract structured data from descriptions
   - Infer special conditions, requirements
   - Generate summaries

## Data Structure for Frontend

### Current (From OCDS)
```typescript
{
  id: "ocds-9t57fa-138898",
  title: "ARC/33/03/2024/3",
  displayTitle: "SUPPLY, DELIVERY...",
  buyerName: "Agricultural Research Council",
  raw: {
    tender: {
      id: "138898",
      procurementMethodDetails: "Request for Bid(Open-Tender)",
      tenderPeriod: { startDate, endDate },
      documents: [...],
      value: { amount: 0, currency: "ZAR" }
    },
    buyer: { id, name },
    // parties: [] - EMPTY
    // awards: [] - EMPTY
    // contracts: [] - EMPTY
  }
}
```

### Ideal (With Enrichment)
```typescript
{
  ...ocdsData,
  enrichment: {
    contactPerson: "L Thobakgale",
    email: "manol@arc.agric.za",
    telephone: "012-529-9480",
    briefingSession: {
      required: true,
      compulsory: true,
      date: "2025-11-14T10:00:00Z",
      venue: "ARC-Biotechnology Platform..."
    },
    province: "Gauteng",
    deliveryLocation: "ARC-Biotechnology Platform, 100 Old Soutpan Road..."
  }
}
```

## Action Plan

### Phase 1: Maximize OCDS Data Usage (Current Sprint)
- [x] Fix API endpoint to use correct backend
- [x] Fix sort parameters
- [ ] Enhance tender detail page to show ALL available OCDS fields
- [ ] Improve document display
- [ ] Better value/currency handling
- [ ] Add timeline visualization

### Phase 2: HTML Scraping (Future)
- [ ] Design scraper architecture
- [ ] Implement eTenders website scraper
- [ ] Create `TenderEnrichment` database table
- [ ] Build scraper queue/scheduler
- [ ] Handle rate limiting and failures
- [ ] Store enriched data linked by OCID

### Phase 3: AI Enhancement (Future)
- [ ] LLM-based data extraction from descriptions
- [ ] Automated province detection
- [ ] Requirements analysis
- [ ] Opportunity scoring

## Conclusion

**We ARE storing all available data from the OCDS API.**

The "missing" fields (contact info, briefing sessions) are **not available via the OCDS API** and require web scraping from the eTenders website HTML. This is a future enhancement, not a current data loss issue.

For now, we should:
1. ✅ Display all OCDS fields properly
2. ✅ Use clear labeling for unavailable fields
3. ✅ Plan HTML scraping as Phase 2 feature
