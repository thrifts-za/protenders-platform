✅ /funding Landing Page — “Find SME Funding in South Africa”

Purpose:

Capture search intent for “funding for small businesses South Africa”.

Funnel visitors into category and program pages.

Keep them clicking — reduce bounce, increase dwell time.

1️⃣ Hero Section (Immediate Value)

Goal: make it crystal clear what the page offers.

<h1>Find Business Funding Opportunities in South Africa</h1>
<p>Explore verified grants, loans, and equity programs from IDC, SEFA, NEF, Land Bank, and more — all in one place.</p>
<form>
  <input type="text" placeholder="Search by keyword, amount, or industry" />
  <select>
    <option>All funding types</option>
    <option>Grants</option>
    <option>Loans</option>
    <option>Equity</option>
  </select>
  <button type="submit">Find Funding</button>
</form>


✅ Schema: WebPage + SearchAction
✅ Add “Trusted by 10,000+ SMEs” badges for social proof.
✅ Background: light, clean, professional.

2️⃣ Category Grid (Programmatic Internal Links)

Pull dynamically from your database.
Each category = one block linking to a filtered funding search.

<section>
  <h2>Explore Funding by Category</h2>
  <ul>
    <li><a href="/funding?category=Agriculture">Agriculture</a></li>
    <li><a href="/funding?category=Manufacturing">Manufacturing</a></li>
    <li><a href="/funding?category=Technology">Technology</a></li>
    <li><a href="/funding?category=Tourism">Tourism</a></li>
    <li><a href="/funding?category=Energy">Energy</a></li>
    <li><a href="/funding?category=Education">Education & Skills</a></li>
  </ul>
</section>


✅ Each link adds internal link juice to your dynamic filters.
✅ Optimize each <a> with title attributes and category keywords.

3️⃣ Featured Institutions Section

Pull top 6 DFIs dynamically from your Institution table.

<section>
  <h2>Funding Institutions</h2>
  <p>Compare programs from South Africa’s top development finance institutions (DFIs).</p>
  <div class="institution-grid">
    <a href="/funding/idc">Industrial Development Corporation (IDC)</a>
    <a href="/funding/sefa">Small Enterprise Finance Agency (sefa)</a>
    <a href="/funding/nef">National Empowerment Fund (NEF)</a>
    <a href="/funding/land-bank">Land Bank</a>
    <a href="/funding/dtic">Department of Trade, Industry and Competition</a>
    <a href="/funding/tia">Technology Innovation Agency (TIA)</a>
  </div>
</section>


✅ Schema: Organization + hasPart (FundingProgram)
✅ Each institution name links to its filtered list of programs.

4️⃣ “Top Funding Opportunities This Month”

Programmatic block pulling latest or highest-matched funding.

<section>
  <h2>Top Funding Opportunities This Month</h2>
  <div class="grid">
    <FundingCard />
    <FundingCard />
    <FundingCard />
  </div>
</section>


✅ Auto-refresh weekly via ISR.
✅ Internal link depth = huge SEO multiplier.

5️⃣ Province-Based Discovery

Google loves location signals.
Generate internal links dynamically:

<section>
  <h2>Find Funding by Province</h2>
  <ul>
    <li><a href="/funding?province=Gauteng">Funding in Gauteng</a></li>
    <li><a href="/funding?province=KwaZulu-Natal">Funding in KwaZulu-Natal</a></li>
    <li><a href="/funding?province=Western Cape">Funding in Western Cape</a></li>
    <li><a href="/funding?province=Limpopo">Funding in Limpopo</a></li>
  </ul>
</section>


✅ Each link produces a discoverable, indexable filtered page.
✅ Add anchor text variations for search diversity.

6️⃣ SME Profile Prompt (Retention Engine)

Hook users for deeper engagement.

<section>
  <h2>Get Personalized Funding Matches</h2>
  <p>Create your free SME profile and get funding opportunities tailored to your industry, size, and province.</p>
  <a href="/signup" class="cta">Start Free</a>
</section>


✅ Tracks Mixpanel event profile_prompt_shown.
✅ Increases conversion and dwell time.

7️⃣ Educational / FAQ Section

SEO gold + user retention.

<section>
  <h2>Frequently Asked Questions</h2>
  <details>
    <summary>What funding options are available for small businesses in South Africa?</summary>
    <p>Grants, loans, equity, and hybrid programs from DFIs such as IDC, SEFA, and NEF.</p>
  </details>
  <details>
    <summary>Who qualifies for SME funding?</summary>
    <p>Registered South African entities that meet the eligibility criteria for each program.</p>
  </details>
  <details>
    <summary>How do I apply for funding?</summary>
    <p>Each funding program lists its requirements and provides a link to apply or contact the provider directly.</p>
  </details>
</section>


✅ Schema: FAQPage.
✅ Also serves as internal link target for long-tail queries.

8️⃣ Footer Section — Deep Internal Links

Expand your link graph.

“Funding by Type”: /funding/grants, /funding/loans, /funding/equity

“Funding by Sector”: /funding/manufacturing, /funding/agriculture

“Funding by Institution”: /funding/idc, /funding/sefa, /funding/nef

Sitemap link: /sitemap_funding.xml

9️⃣ SEO Layer

Page metadata:

export const metadata = {
  title: "Find Business Funding in South Africa | SME Grants, Loans & Equity | ProTender",
  description: "Discover verified SME funding opportunities from IDC, SEFA, NEF, Land Bank, TIA, and more. Search by sector, amount, and location.",
  openGraph: { type: 'website', url: '/funding' },
  alternates: { canonical: 'https://protenders.co.za/funding' }
};


Structured data:

{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Find SME Funding in South Africa",
  "about": ["Grants", "Loans", "Equity Funding", "SME Finance"],
  "publisher": { "@type": "Organization", "name": "ProTender" },
  "hasPart": [
    { "@type": "Dataset", "name": "Funding Opportunities Dataset" }
  ]
}

10️⃣ Behavior Triggers (Retention)

Lazy load FundingCards (keeps scroll going)

“Related Programs” widgets at 50% scroll

Exit-intent modal → “Save this funding”

Track: funding_landing_visited, funding_category_clicked, funding_program_viewed