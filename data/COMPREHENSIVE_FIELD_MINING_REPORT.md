# COMPREHENSIVE FIELD MINING REPORT
## ProTenders Platform - HAR File Analysis

**Date**: 2025-11-13  
**Files Analyzed**:
- `/data/Latest.har` (157,551 lines, 42.4MB)
- `/data/Black Owned.har` (121,063 lines, 39.3MB)

**Analysis Scope**: ALL PowerBI queries and response data from both HAR files

---

## EXECUTIVE SUMMARY

### Overall Statistics
- **Total Unique Fields**: 53
- **Total Tables**: 13
- **PowerBI Responses Analyzed**: 70 (41 from Latest.har, 29 from Black Owned.har)
- **Fields in Latest.har**: 46
- **Fields in Black Owned.har**: 23
- **Fields in BOTH files**: 23
- **Field Types**: 22 Columns, 31 Measures/Aggregations

### Key Findings
1. **Main transaction table** (`DW_BAS_DATA`) contains 25 fields with rich supplier and spend data
2. **UNSPSC classification** fully available via `Mapped BAS Data` table (Segment/Family/Class/Commodity)
3. **Demographic tracking** exists with 6 PPPFA categories: Black Owned, Women Owned, Youth Owned, Disabled Owned, Military Veteran Owned, Rural Township Owned
4. **Geographic data** available at Province and Department level
5. **Time-series data** spans fiscal years 2017/18 to 2025/26
6. **Supplier classification** includes SMME status and Turnover brackets (EME/QSE/GE)

---

## DETAILED FIELD INVENTORY BY TABLE

### 1. DW_BAS_DATA (Main Transaction Table)
**Description**: Core transaction and supplier data table  
**Fields**: 25 (11 columns, 14 measures)  
**Files**: Both

#### Columns (11)

| Field Name | Type | Uses | Sample Values | Strategic Value |
|------------|------|------|---------------|-----------------|
| **Supplier Name** | Column | 11 | N/A | ⭐⭐⭐⭐⭐ Essential for supplier intelligence |
| **SupplierType** | Column | 6 | N/A | ⭐⭐⭐⭐ Main demographic classification |
| **SupplierSubType** | Column | 6 | N/A | ⭐⭐⭐⭐⭐ Detailed demographic breakdown (linked to PPPFA) |
| **SMME** | Column | 4 | "Large Business", "Small and Medium Enterprise", "Unspecified" | ⭐⭐⭐⭐ Business size classification |
| **Turnover** | Column | 2 | "0 Not Applicable", "1 EME (0 - R10M)", "2 QSE (R10M - R50M)", "3 GE (More than R50M)", "Unspecified" | ⭐⭐⭐⭐ Revenue bracket (EME/QSE/GE) |
| **ItemParentLvl3Descr** | Column | 2 | N/A | ⭐⭐⭐ Item classification level 3 |
| **ItemPostLvlDescr** | Column | 9 | N/A | ⭐⭐⭐ Item posting level description |
| **Fiscal_Year** | Column | 6 | N/A | ⭐⭐⭐⭐ Time-series analysis |
| **MonthYear** | Column | 3 | N/A | ⭐⭐⭐⭐ Monthly trend analysis |
| **Quarter1** | Column | 2 | N/A | ⭐⭐⭐ Quarterly analysis |
| **FirstSpendYear** | Column | 2 | 2017-2025 | ⭐⭐⭐⭐ Supplier entry date (new vs established) |

#### Measures (14)

| Field Name | Type | Uses | Sample Value | Strategic Value |
|------------|------|------|--------------|-----------------|
| **Procurement Spend** | Measure | 34 | R 93,468,043,452 | ⭐⭐⭐⭐⭐ Main spend metric |
| **TotalTransAmount** | Measure | 13 | N/A | ⭐⭐⭐⭐⭐ Transaction amount aggregation |
| **Spend on Black Owned** | Measure | 8 | 40.29% / R 725B | ⭐⭐⭐⭐⭐ B-BBEE compliance tracking |
| **Spend on Women** | Measure | 8 | 14.72% / R 221B | ⭐⭐⭐⭐⭐ Women empowerment tracking |
| **Spend on Youth** | Measure | 7 | 7.99% | ⭐⭐⭐⭐⭐ Youth empowerment tracking |
| **Spend on Disabled** | Measure | 2 | 0.58% / R 8.3B | ⭐⭐⭐⭐ Disability empowerment |
| **Spend on Rural-Township** | Measure | 1 | R 60.5B | ⭐⭐⭐⭐ Geographic equity |
| **PPPFABlackOwnedPct** | Measure | 2 | Calculated % | ⭐⭐⭐⭐ PPPFA compliance metric |
| **PPPFAWomenPct** | Measure | 2 | Calculated % | ⭐⭐⭐⭐ PPPFA compliance metric |
| **PPPFAYouthPct** | Measure | 2 | Calculated % | ⭐⭐⭐⭐ PPPFA compliance metric |
| **PPPFADisabledPct** | Measure | 2 | Calculated % | ⭐⭐⭐⭐ PPPFA compliance metric |
| **Total Number of supplier** | Measure | 6 | By province | ⭐⭐⭐⭐ Supplier counting |
| **CSDSupplierNumber** | Measure | 1 | Unique count | ⭐⭐⭐⭐ Supplier identification |
| **Total Spend** | Measure | 0 | R 93B | ⭐⭐⭐⭐⭐ Alternative spend calculation |

---

### 2. Mapped BAS Data (UNSPSC Classification Table)
**Description**: UNSPSC product/service classification  
**Fields**: 5 (4 columns, 1 measure)  
**Files**: Both

#### Columns (4)

| Field Name | Type | Uses | Strategic Value |
|------------|------|------|-----------------|
| **Segment Title** | Column | 7 | ⭐⭐⭐⭐⭐ Top UNSPSC level |
| **Family Title** | Column | 14 | ⭐⭐⭐⭐⭐ UNSPSC level 2 |
| **Class Title** | Column | 11 | ⭐⭐⭐⭐⭐ UNSPSC level 3 |
| **Commodity Title** | Column | 8 | ⭐⭐⭐⭐⭐ UNSPSC level 4 (most granular) |

**Strategic Value**: Complete 4-level UNSPSC hierarchy enables precise spend categorization and commodity intelligence.

---

### 3. DW_Departments (Department & Province Table)
**Description**: Government department and location data  
**Fields**: 3 (3 columns)  
**Files**: Both

#### Columns (3)

| Field Name | Type | Uses | Sample Values | Strategic Value |
|------------|------|------|---------------|-----------------|
| **Department** | Column | 12 | 50+ departments | ⭐⭐⭐⭐⭐ Buyer intelligence |
| **Province** | Column | 18 | "EASTERN CAPE", "FREE STATE", "GAUTENG", "KWAZULU NATAL", "LIMPOPO", "MPUMALANGA", "NATIONAL", "NORTH WEST", "NORTHERN CAPE", "WESTERN CAPE" | ⭐⭐⭐⭐⭐ Geographic segmentation |
| **NT Clusters** | Column | 2 | National Treasury cluster groupings | ⭐⭐⭐ Department categorization |

---

### 4. PPPFA Table (Empowerment Categories)
**Description**: PPPFA preferential procurement categories  
**Fields**: 10 (1 column, 9 measures)  
**Files**: Latest.har only

#### Column (1)

| Field Name | Type | Sample Values | Strategic Value |
|------------|------|---------------|-----------------|
| **PPPFA** | Column | "Black Owned", "Women Owned", "Youth Owned", "Disabled Owned", "Military Veteran Owned", "Rural Township Owned" | ⭐⭐⭐⭐⭐ CRITICAL - All 6 demographic categories |

#### Measures (9)

| Field Name | Type | Sample Value | Strategic Value |
|------------|------|--------------|-----------------|
| **PPPFA measure** | Measure | R 37.6B | ⭐⭐⭐⭐ Category spend amounts |
| **PPPFA Pct measure** | Measure | 40.29% | ⭐⭐⭐⭐ Category percentages |
| **Total Spend measure** | Measure | Total | ⭐⭐⭐⭐⭐ Baseline for calculations |
| **Total Suppliers measure** | Measure | 26,541 | ⭐⭐⭐⭐ Unique supplier count |
| **TotalSpend** | Measure | Calculated | ⭐⭐⭐⭐ Alternative total |
| **TotalSpendByProvDpt** | Measure | By location | ⭐⭐⭐⭐ Geographic breakdown |
| **TopTenSuppliers** | Measure | Ranked | ⭐⭐⭐⭐ Supplier ranking logic |
| **TopTenCommodities** | Measure | Ranked | ⭐⭐⭐⭐ Commodity ranking logic |
| **SelectedPPPFA** | Measure | Filter | ⭐⭐⭐ Selection logic |

---

### 5. Fiscal_Year (Time Dimension Table)
**Description**: Fiscal year master table  
**Fields**: 1 column  
**Files**: Both

#### Column (1)

| Field Name | Sample Values | Strategic Value |
|------------|---------------|-----------------|
| **Fiscal_Year** | "2017/18", "2018/19", "2019/20", "2020/21", "2021/22", "2022/23", "2023/24", "2024/25", "2025/26" | ⭐⭐⭐⭐⭐ 9 years of historical data |

---

### 6. SupplierAddress (Supplier Location)
**Description**: Supplier geographic data  
**Fields**: 1 column  
**Files**: Latest.har only

#### Column (1)

| Field Name | Type | Strategic Value |
|------------|------|-----------------|
| **Province** | Column | ⭐⭐⭐⭐⭐ CRITICAL - Supplier location (distinct from department province) |

**Note**: This enables matching supplier location vs department location for local content analysis.

---

### 7. Bridge Item_Lowest_level (Calculation Bridge Table)
**Description**: Bridge table for item-level calculations  
**Fields**: 2 measures  
**Files**: Both

#### Measures (2)

| Field Name | Type | Strategic Value |
|------------|------|-----------------|
| **Spend per Transaction** | Measure | ⭐⭐⭐⭐ Average transaction size analysis |
| **DeptProvinceSpendProportion** | Measure | ⭐⭐⭐ Provincial spend distribution |

---

### 8. LocalDateTable (Date Hierarchy)
**Description**: PowerBI auto-generated date table  
**Fields**: 1 measure  
**Files**: Latest.har only

Not strategically relevant (internal PowerBI structure).

---

## DEMOGRAPHIC & EMPOWERMENT FIELDS DISCOVERED

### PPPFA Categories Available (6 total)
1. ✅ **Black Owned**
2. ✅ **Women Owned**
3. ✅ **Youth Owned**
4. ✅ **Disabled Owned**
5. ✅ **Military Veteran Owned**
6. ✅ **Rural Township Owned**

### B-BBEE Measurement Fields
- PPPFABlackOwnedPct
- PPPFAWomenPct
- PPPFAYouthPct
- PPPFADisabledPct
- Spend on Black Owned (absolute + percentage)
- Spend on Women (absolute + percentage)
- Spend on Youth (absolute + percentage)
- Spend on Disabled (absolute + percentage)
- Spend on Rural-Township (absolute)

### Business Classification
- **SMME Status**: Large Business, Small and Medium Enterprise, Unspecified
- **Turnover Bracket**: EME (0-R10M), QSE (R10M-R50M), GE (More than R50M), Not Applicable, Unspecified

---

## FIELDS NOT FOUND (Wishlist Items)

Based on comprehensive mining, the following requested fields are **NOT AVAILABLE** in the dataset:

### Transaction Detail (Not Found)
- ❌ Transaction ID / Payment reference numbers
- ❌ Payment dates (posting dates, transaction dates)
- ❌ Contract numbers, tender references
- ❌ Payment methods, channels
- ❌ Invoice numbers, document references

### Supplier Intelligence (Not Found)
- ❌ Supplier ID/Code (only CSDSupplierNumber count available)
- ❌ Supplier registration numbers (CIPC, Tax Number, VAT)
- ❌ Supplier address details (only province available)
- ❌ Supplier contact details
- ❌ Supplier status (active/inactive/suspended)
- ❌ Supplier banking details
- ❌ Supplier contact person
- ❌ Supplier email/phone

### Demographic & Empowerment (Not Found)
- ❌ B-BBEE Level (1-8)
- ❌ B-BBEE Certificate Number
- ❌ B-BBEE Expiry Date
- ❌ Black Ownership % (only binary flag via SupplierSubType)
- ❌ Women Ownership %
- ❌ Youth Ownership %
- ❌ Disability-owned %
- ❌ EME/QSE status flags (only Turnover bracket)
- ❌ HDI status

### Business Classification (Not Found)
- ❌ Industry codes (SIC, NACE, ISIC)
- ❌ Business registration date
- ❌ Company size (micro/small/medium/large) - only SMME flag
- ❌ Number of employees
- ❌ Annual turnover amounts (only brackets)
- ❌ Geographic operational areas

### Procurement Compliance (Not Found)
- ❌ Tender type (open/closed/emergency/sole source)
- ❌ Procurement method
- ❌ Contract duration
- ❌ Contract start/end dates
- ❌ Performance ratings
- ❌ Supplier evaluation scores
- ❌ Blacklist/debarment status
- ❌ Compliance status
- ❌ Audit flags

### Financial (Not Found)
- ❌ Invoice amount vs payment amount
- ❌ Outstanding/unpaid amounts
- ❌ Discounts applied
- ❌ Penalties/deductions
- ❌ VAT amounts
- ❌ Retention amounts
- ❌ Advance payments
- ❌ Milestone payments

### Enhanced Classification (Not Found)
- ❌ Budget line items
- ❌ Program codes
- ❌ Sub-program codes
- ❌ Project codes
- ❌ Grant/funding source
- ❌ Cost center codes

### Time-Series (Not Found)
- ❌ Posting period
- ❌ Payment cycle
- ❌ Days to payment (from invoice to payment)
- ❌ Payment frequency

### Geographic/Location (Not Found)
- ❌ Ward numbers
- ❌ Municipality codes/names
- ❌ District codes/names
- ❌ Metro vs rural classification
- ❌ Service delivery areas

### Other Strategic (Not Found)
- ❌ Government priorities alignment
- ❌ SDG (Sustainable Development Goals) alignment
- ❌ Local content %
- ❌ Job creation numbers
- ❌ Skills development commitments
- ❌ Enterprise development spend

---

## STRATEGIC FIELD ASSESSMENT

### 🏆 GAME-CHANGERS (Must Extract)

#### Tier 1: Core Intelligence Fields
1. **DW_BAS_DATA.Supplier Name** - Supplier identification
2. **DW_BAS_DATA.SupplierType** - Main demographic classification
3. **DW_BAS_DATA.SupplierSubType** - Detailed demographic breakdown
4. **DW_BAS_DATA.Procurement Spend** - Primary spend metric
5. **DW_BAS_DATA.TotalTransAmount** - Transaction amounts
6. **PPPFA Table.PPPFA** - All 6 demographic categories
7. **Mapped BAS Data.Segment/Family/Class/Commodity Title** - Full UNSPSC hierarchy
8. **DW_Departments.Department** - Buyer identification
9. **DW_Departments.Province** - Buyer location
10. **SupplierAddress.Province** - Supplier location

#### Tier 2: Empowerment & Compliance
11. **DW_BAS_DATA.Spend on Black Owned** - B-BBEE tracking
12. **DW_BAS_DATA.Spend on Women** - Women empowerment
13. **DW_BAS_DATA.Spend on Youth** - Youth empowerment
14. **DW_BAS_DATA.Spend on Disabled** - Disability empowerment
15. **DW_BAS_DATA.Spend on Rural-Township** - Geographic equity
16. **DW_BAS_DATA.SMME** - Business size classification
17. **DW_BAS_DATA.Turnover** - Revenue bracket (EME/QSE/GE)

#### Tier 3: Time & Analysis
18. **Fiscal_Year.Fiscal_Year** - Time dimension (9 years)
19. **DW_BAS_DATA.MonthYear** - Monthly trends
20. **DW_BAS_DATA.FirstSpendYear** - Supplier tenure

### ⚠️ DATA QUALITY NOTES

#### High Quality (Good Coverage)
- **Procurement Spend**: Used 34 times across visuals, sample values present
- **Province**: 18 uses, 10 distinct provinces + NATIONAL
- **Department**: 12 uses, 50+ departments
- **UNSPSC Classification**: All 4 levels present with extensive use
- **Fiscal Year**: 9 years of data (2017/18 to 2025/26)
- **PPPFA Categories**: 6 categories with both absolute and percentage metrics

#### Medium Quality (Partial Coverage)
- **SMME**: Only 3 values (Large Business, SME, Unspecified)
- **Turnover**: 5 brackets but includes "Unspecified"
- **SupplierType/SubType**: Present but limited sample values visible
- **MonthYear**: Present but format unknown

#### Limited/Unknown Quality
- **Supplier Name**: No sample values extracted (likely anonymized or filtered)
- **Transaction-level details**: No individual transaction rows visible
- **Contact information**: Completely absent

---

## DATA STRUCTURE INSIGHTS

### PowerBI Query Structure
- **Query Type**: Semantic queries using DAX expressions
- **Aggregation Level**: Most queries return aggregated data, not row-level transactions
- **Visual Count**: 70 distinct visualizations across both files
- **Response Format**: JSON with nested DM0 (Data Matrix) arrays containing G (Group), M (Measure), C (Cell) references

### Table Relationships
```
DW_BAS_DATA (Fact Table)
├── Mapped BAS Data (UNSPSC lookup)
├── DW_Departments (Department/Province lookup)
├── Fiscal_Year (Time dimension)
├── SupplierAddress (Supplier location)
├── PPPFA Table (Empowerment categories)
└── Bridge Item_Lowest_level (Calculation bridge)
```

### Key Relationships Identified
1. DW_BAS_DATA ← → Mapped BAS Data (Item classification)
2. DW_BAS_DATA ← → DW_Departments (Department/Province)
3. DW_BAS_DATA ← → Fiscal_Year (Time)
4. DW_BAS_DATA ← → SupplierAddress (Supplier location)
5. DW_BAS_DATA ← → PPPFA Table (Empowerment tracking)

---

## EXTRACTION RECOMMENDATIONS

### Priority 1: Core Fields (MUST HAVE)
Extract from **DW_BAS_DATA**:
- Supplier Name
- SupplierType
- SupplierSubType
- Procurement Spend / TotalTransAmount
- SMME
- Turnover
- Fiscal_Year
- MonthYear
- FirstSpendYear

### Priority 2: Classification (MUST HAVE)
Extract from **Mapped BAS Data**:
- Segment Title
- Family Title
- Class Title
- Commodity Title

Extract from **DW_Departments**:
- Department
- Province (Department location)

### Priority 3: Location Intelligence (HIGH VALUE)
Extract from **SupplierAddress**:
- Province (Supplier location)

### Priority 4: Empowerment Metrics (HIGH VALUE)
Extract from **DW_BAS_DATA**:
- Spend on Black Owned
- Spend on Women
- Spend on Youth
- Spend on Disabled
- Spend on Rural-Township
- PPPFABlackOwnedPct
- PPPFAWomenPct
- PPPFAYouthPct
- PPPFADisabledPct

Extract from **PPPFA Table**:
- PPPFA (category field)
- PPPFA measure
- Total Suppliers measure

### Priority 5: Analysis Support (NICE TO HAVE)
Extract from **Bridge Item_Lowest_level**:
- Spend per Transaction
- DeptProvinceSpendProportion

---

## MISSING DATA IMPLICATIONS

### Critical Gaps
1. **No transaction-level data**: Cannot analyze individual purchases or payment patterns
2. **No supplier registration details**: Cannot validate supplier legitimacy or pull CIPC data
3. **No contract information**: Cannot track contract lifecycle or compliance
4. **No actual B-BBEE certificates**: Only spend-based proxy metrics available
5. **No contact information**: Cannot enable direct supplier outreach

### Workarounds & Alternatives
1. **SupplierSubType** appears to contain demographic flags - need to extract actual values to see what's available
2. **FirstSpendYear** enables new vs established supplier segmentation
3. **Province matching** (SupplierAddress.Province vs DW_Departments.Province) enables local content analysis
4. **UNSPSC classification** enables spend category intelligence even without contract details
5. **Time-series data** (9 years) enables trend analysis and supplier growth tracking

---

## NEXT STEPS

### Immediate Actions
1. ✅ **COMPLETE**: Comprehensive field inventory across both HAR files
2. 🔄 **IN PROGRESS**: Sample value extraction for SupplierType/SupplierSubType
3. ⏭️ **NEXT**: Extract full PPPFA Table to see all demographic category values
4. ⏭️ **NEXT**: Design API extraction queries targeting priority fields
5. ⏭️ **NEXT**: Test extraction of row-level data (if available via different query structure)

### Strategic Questions to Answer
1. Are there additional HAR files that might contain transaction-level detail?
2. Can we access the PowerBI dataset directly via API instead of reverse-engineering HAR files?
3. Is there a data dictionary or schema documentation for these tables?
4. What is the refresh frequency of this data?
5. Are there additional demographic fields hidden in SupplierSubType?

---

## CONCLUSION

### What We Have (The Good News ✅)
- **Complete UNSPSC classification** (4-level hierarchy)
- **6 PPPFA demographic categories** (Black, Women, Youth, Disabled, Military Veteran, Rural Township)
- **9 years of time-series data** (2017/18 to 2025/26)
- **Full provincial coverage** (all 9 provinces + National)
- **50+ government departments** tracked
- **26,541 unique suppliers** in dataset
- **R 93.4 billion** in procurement spend captured
- **Supplier location data** (enables local content analysis)
- **Business size classification** (SMME + Turnover brackets)

### What We Don't Have (The Reality Check ❌)
- **No transaction-level detail** (all data is aggregated)
- **No supplier registration/contact info**
- **No contract lifecycle data**
- **No actual B-BBEE certificates or levels**
- **No payment terms or compliance tracking**
- **No detailed financial breakdowns** (VAT, discounts, etc.)

### Strategic Recommendation
**PROCEED WITH EXTRACTION** - Despite missing wishlist items, the available fields provide sufficient value for:
1. Supplier demographic intelligence (6 PPPFA categories)
2. Spend category analysis (complete UNSPSC)
3. Geographic equity analysis (supplier vs department province matching)
4. Business size segmentation (SMME + Turnover)
5. Time-series trends (9 years of history)
6. Department/buyer intelligence (50+ departments)

The absence of transaction-level detail limits payment pattern analysis, but the aggregated spend data by supplier/category/location/demographic is still highly valuable for ProTenders' market intelligence platform.

---

**Report Generated**: 2025-11-13  
**Analysis Method**: Automated parsing of PowerBI semantic queries and response data from HAR network capture files  
**Confidence Level**: HIGH (exhaustive analysis of all 70 PowerBI responses across both files)
