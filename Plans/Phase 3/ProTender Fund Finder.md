
## ✅ **The Structure Behind Each Funding Institution**

Every institution follows this pattern (whether IDC, dtic, NEF, TIA, sefa, etc.):

```
[Institution Name]
[Website + Contact Info + Physical Address]
Logo
[Institution Overview Paragraph]
FUNDING CRITERIA:
[Bulleted list of criteria]
REQUIRED DOCUMENTS:
[Bulleted list of required docs]
[Then multiple "program blocks", each describing a fund]
```

Each “program block” starts with:

* Program Name
* Short description / purpose
* Funded industries or target market
* Funding range
* Sometimes a “Purpose” or “Required Security” field

Example:

```
1. Agro-Processing & Agriculture Strategic Business Unit (SBU)
Funded Industries:
• New or existing companies within agro-processing
Funding amount/range:
• Start-ups: 60% of total funding
```

That’s one record.

---

## ✅ **The Extraction Logic (the real version)**

To Claude (or any structured parser), you give these **rules** — this will produce a machine-readable dataset.

### **Step 1: Detect Institution Blocks**

Trigger pattern:

```
^[A-Z][A-Za-z\s&\-\(\)]+\(?(IDC|Bank|Agency|Fund|Corporation|Department|Authority|Finance)\)?:
```

→ captures lines like “Industrial Development Corporation (IDC)” or “Land and Agricultural Development Bank (Land Bank)”.

Extract:

* `institution_name`
* `website`
* `contact`
* `address`
* `description`
* `funding_criteria` (bulleted)
* `required_documents` (bulleted)

---

### **Step 2: Detect Program Sub-Blocks**

Within each institution block, trigger pattern:

```
^\d+\.\s[A-Z].+(Fund|Programme|Scheme|SBU|Loan|Facility|Incentive)
```

→ captures lines like “1. Agro-Processing & Agriculture Strategic Business Unit (SBU)” or “3. Medium-Term Loan”.

Each sub-block = one JSON record with:

```json
{
  "institution": "Industrial Development Corporation (IDC)",
  "program_name": "Agro-Processing & Agriculture Strategic Business Unit (SBU)",
  "category": "Agriculture",
  "funding_type": "Loan/Equity",
  "funded_industries": ["Agro-processing", "Value-add manufacturing"],
  "funding_range": "Start-ups: 60% of total funding, Expansions: full expansion if 35% equity",
  "eligibility": ["Registered SME", "B-BBEE acquisition"],
  "purpose": "Promote value-adding agro-processing activities fostering inclusivity",
  "contact_link": "www.idc.co.za"
}
```

---

### **Step 3: Normalization Layer**

Use keyword-matching and NLP clustering to infer:

| Keyword                          | Normalized Category |
| -------------------------------- | ------------------- |
| “Agro” / “Farming”               | Agriculture         |
| “Transport” / “Automotive”       | Manufacturing       |
| “Green Energy” / “Power”         | Energy              |
| “Tourism” / “Hospitality”        | Tourism             |
| “ICT” / “Digital” / “Innovation” | Technology          |
| “Education” / “Training”         | Skills Development  |
| “Loan” / “Finance”               | Financial Services  |

---

### **Step 4: Final JSON Output**

One JSON array of 150–250 entries like:

```json
[
  {
    "institution": "IDC",
    "program_name": "Automotive & Transport Equipment SBU",
    "category": "Manufacturing",
    "funding_type": "Loan",
    "funding_range": "R1 million – R15 million",
    "funded_industries": ["Automotive", "Transport equipment manufacturing"],
    "eligibility": ["Registered South African business"],
    "purpose": "Support global competitiveness in downstream automotive manufacturing",
    "apply_link": "https://www.idc.co.za"
  },
  {
    "institution": "The dtic",
    "program_name": "Black Industrialists Scheme (BIS)",
    "category": "Manufacturing",
    "funding_type": "Grant",
    "funding_range": "30–50% cost-sharing up to R50 million",
    "funded_industries": ["Manufacturing", "Black-owned entities"],
    "purpose": "Promote industrialisation and transformation through black-owned enterprises",
    "apply_link": "https://www.thedtic.gov.za"
  }
]
```

---

## ✅ **Your Hand-Off Prompt for Claude**

Paste this to Claude:

---

**Instruction:**

> Parse the document “MSME-Funding-Handbook-08-2022-pages.pdf” in /Phase 3/PDFs.
> Use regex or structured parsing to extract every **institution** and its **funding programs**.
> For each institution, extract:
>
> * name
> * website
> * contact email
> * address
> * description
> * funding criteria (array)
> * required documents (array)
>
> Then, extract every **funding program** within that institution block, using patterns such as “1.”, “2.”, “Fund”, “Programme”, “Scheme”, “Loan”, “Incentive”, “Facility”, “SBU”.
>
> For each program, produce:
>
> ```json
> {
>   "institution": "",
>   "program_name": "",
>   "funding_type": "",
>   "funding_range": "",
>   "funded_industries": [],
>   "eligibility": [],
>   "purpose": "",
>   "apply_link": ""
> }
> ```
>
> Use best-guess classification for **category** based on industry keywords.
>
> Output as a single JSON array containing all programs across institutions.
> Ensure valid JSON, UTF-8 encoding, and no Markdown formatting.

---