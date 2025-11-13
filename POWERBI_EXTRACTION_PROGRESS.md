# PowerBI Data Extraction - Implementation Progress

**Branch**: `feature/powerbi-extraction`
**Started**: 2025-11-13
**Goal**: Extract demographic ownership data (Black/Women/Youth spend, SMME classification, supplier types) from PowerBI dashboard

---

## 🎯 Strategic Objective (UPDATED)

Extract demographic aggregates and supplier intelligence from National Treasury's PowerBI dashboard to position ProTenders as South Africa's ONLY platform offering:
- **6 PPPFA demographic categories**: Black, Women, Youth, Disabled, Military Veteran, Rural Township
- **Supplier classification intelligence**: SupplierType, SupplierSubType, SMME, Turnover brackets (EME/QSE/GE)
- **9 years of historical trends** (2017/18 to 2025/26)
- **Local content analysis**: Supplier province vs Department province matching
- **Supplier maturity tracking**: FirstSpendYear (new vs established suppliers)
- **Complete UNSPSC hierarchy**: 4-level commodity classification

**Strategy Pivot**: Focus on aggregated demographic and supplier intelligence (what's available) rather than individual transaction detail (not available in PowerBI)

---

## 📊 Current Database Status

**Existing Data** (from CSV import):
- ✅ 29,999 payment transactions
- ✅ R15.7 Billion total spending
- ✅ FY 2025/26 data
- ✅ Basic fields: Province, Department, Supplier, Amount, UNSPSC

**Strategic Fields to Extract** (from comprehensive field mining):
- 🔄 Spend on Black Owned (aggregate measure)
- 🔄 Spend on Women (aggregate measure)
- 🔄 Spend on Youth (aggregate measure)
- 🔄 Spend on Disabled (aggregate measure) - NEW!
- 🔄 Spend on Military Veteran (aggregate measure) - NEW!
- 🔄 Spend on Rural Township (aggregate measure) - NEW!
- 🔄 SMME Classification
- 🔄 SupplierType/SupplierSubType
- 🔄 Turnover Brackets (EME/QSE/GE) - NEW!
- 🔄 FirstSpendYear (supplier tenure) - NEW!
- 🔄 MonthYear/Quarter (time-series)
- 🔄 Enhanced UNSPSC (Segment/Commodity - 4 levels)
- 🔄 Supplier Province (location intelligence) - NEW!

**Key Finding**: Data is aggregated by supplier/category/location, NOT individual transactions

---

## 📋 Implementation Checklist

### Phase 1: Infrastructure Setup ✅
- [x] Create branch: `feature/powerbi-extraction`
- [x] Create directory structure: `scripts/powerbi/`
  - [x] `payloads/` - Frozen JSON payloads
  - [x] `raw_pages/transactions/` - Raw API responses
  - [x] `decoded/` - Decoded CSV/JSON output
- [x] Extract transaction payload from Latest.har
  - [x] Visual ID: 5ab25b52963a191c0782
  - [x] Saved to: `scripts/powerbi/payloads/transactions_detail.json`

### Phase 2: Build Transaction Fetcher 🔄
- [ ] Create `scripts/powerbi/fetch_transactions.ts`
  - [ ] Load base payload from JSON
  - [ ] Implement pagination with continuationToken
  - [ ] POST to PowerBI API endpoint
  - [ ] Save raw responses page-by-page
  - [ ] Handle errors and retries
- [ ] Test fetcher with dry run (1-2 pages)
- [ ] Execute full fetch (all 30K+ transactions)

### Phase 3: Build Transaction Decoder ⏳
- [ ] Create `scripts/powerbi/decode_transactions.ts`
  - [ ] Parse compact encoding (value dictionaries D0-D6)
  - [ ] Map columns to field names
  - [ ] Decode rows to flat structure
  - [ ] Output CSV or JSON
- [ ] Test decoder on sample page
- [ ] Decode all fetched pages

### Phase 4: Database Schema Enhancement ⏳
- [ ] Update `prisma/schema.prisma` - ProcurementPayment model
  - [ ] Add `supplierType` field
  - [ ] Add `supplierSubType` field
  - [ ] Add `smmeClassification` field
  - [ ] Add `postDate` field
  - [ ] Add `segmentTitle` field
  - [ ] Add `commodityTitle` field
  - [ ] Add appropriate indexes
- [ ] Run migration: `npx prisma migrate dev`
- [ ] Regenerate Prisma client

### Phase 5: Import Script ⏳
- [ ] Create `scripts/import_powerbi_transactions.ts`
  - [ ] Read decoded data
  - [ ] Batch insert with conflict handling
  - [ ] Handle duplicates (upsert logic)
  - [ ] Log progress and errors
- [ ] Test import with sample data
- [ ] Execute full import

### Phase 6: Validation & Testing ⏳
- [ ] Verify record counts match PowerBI dashboard
- [ ] Test API endpoints with new fields
- [ ] Update PaymentAnalytics component to use new fields
- [ ] Create demo queries for demographic filtering
- [ ] Performance testing

### Phase 7: Demographic Data Extraction (Future) ⏳
- [ ] Extract "Spend on Black Owned" time-series
- [ ] Extract "Spend on Women" time-series
- [ ] Extract "Spend on Youth" time-series
- [ ] Create demographic analytics dashboard

---

## 🔧 Technical Details

### PowerBI API Configuration
```
Endpoint: https://wabi-north-europe-l-primary-api.analysis.windows.net/public/reports/querydata?synchronous=true
Resource Key: 4112cc95-bcc9-4702-96db-26c9dd801c08
Dataset ID: e1385346-bfd6-4efe-a9c7-b878b9383d5e
Visual ID: 5ab25b52963a191c0782 (Transaction Detail Table)
Pagination: continuationToken, 500 rows per page
```

### Data Sources
- **Latest.har**: Transaction-level detail (30K+ records)
- **Black Owned.har**: Demographic aggregates and SMME data

### Field Mapping
| PowerBI Field | Database Field | Type |
|--------------|----------------|------|
| Fiscal_Year | fiscalYear | String |
| Supplier Name | supplierName | String |
| TotalTransAmount | transactionAmount | Decimal(15,2) |
| ItemPostLvlDescr | scoaItem | String |
| Class Title | classTitle | String |
| Family Title | unspscFamily | String |
| Province | province | String |
| Department | department | String |
| SupplierType | supplierType | String (NEW) |
| SupplierSubType | supplierSubType | String (NEW) |
| SMME | smmeClassification | String (NEW) |
| PostDate | postDate | DateTime (NEW) |
| Segment Title | segmentTitle | String (NEW) |
| Commodity Title | commodityTitle | String (NEW) |

---

## 📝 Notes & Decisions

### Following Grounds.md Pattern
- Two-phase approach: **Fetch → Decode** (separate concerns)
- Save raw pages to disk first (never hit API twice)
- Use frozen payload JSON (deep clone for each request)
- Handle continuationToken pagination

### Current Focus
Starting with transaction-level data extraction (highest ROI). Demographic aggregates will be computed from enhanced transaction data or fetched separately in Phase 7.

---

## 🚀 Next Steps

**Current Task**: Build transaction fetcher script
**After Completion**: Build decoder, update schema, import data
**Timeline**: ~2 hours total estimated

---

## 📊 Success Metrics

- [ ] All 30K+ transactions extracted
- [ ] New strategic fields populated in database
- [ ] API endpoints returning enhanced data
- [ ] PaymentAnalytics showing demographic insights
- [ ] Zero data loss or corruption

---

**Last Updated**: 2025-11-13 20:54 UTC
