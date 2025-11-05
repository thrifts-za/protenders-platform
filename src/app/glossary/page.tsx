"use client";

import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, BookOpen } from "lucide-react";
import { useState, useMemo } from "react";

interface GlossaryTerm {
  term: string;
  definition: string;
  category: string;
  relatedTerms?: string[];
}

const glossaryTerms: GlossaryTerm[] = [
  {
    term: "Award Notice",
    definition: "Official notification published on the eTenders portal announcing which bidder has been awarded a tender contract. Award notices include the winning bidder's name, contract value, and award date. Monitoring award notices helps understand market trends and successful bidders.",
    category: "Process",
    relatedTerms: ["Tender", "Bid", "Contract"],
  },
  {
    term: "B-BBEE",
    definition: "Broad-Based Black Economic Empowerment - South Africa's economic transformation policy framework aimed at redressing past inequalities. B-BBEE certificates (Levels 1-8) award preference points in government tenders. Higher B-BBEE levels (Level 1-4) receive more points in tender evaluation.",
    category: "Compliance",
    relatedTerms: ["Preference Points", "Compliance", "EME"],
  },
  {
    term: "Bid",
    definition: "A formal offer submitted by a supplier in response to a tender or Request for Quotation (RFQ). Bids include pricing, technical proposals, company credentials, and compliance documents. Also called a tender submission or proposal.",
    category: "Process",
    relatedTerms: ["Tender", "RFQ", "RFP", "Proposal"],
  },
  {
    term: "Bid Evaluation",
    definition: "The systematic assessment of submitted bids against predetermined criteria. Evaluation typically includes compliance check, technical evaluation, price evaluation, and preference points calculation (B-BBEE). The highest-scoring compliant bid wins.",
    category: "Process",
    relatedTerms: ["Evaluation Criteria", "Scoring", "Preference Points"],
  },
  {
    term: "Briefing Session",
    definition: "A meeting held by the procuring entity to explain tender requirements, answer bidder questions, and conduct site visits. Attendance is often compulsory, and non-attendance may disqualify a bid. Also called a pre-bid meeting or site meeting.",
    category: "Process",
    relatedTerms: ["Site Visit", "Compulsory Briefing", "Tender"],
  },
  {
    term: "CSD",
    definition: "Central Supplier Database - A centralized database managed by National Treasury where suppliers register their company details, tax compliance, and B-BBEE status. CSD registration is mandatory for doing business with government. Registration provides a unique supplier number.",
    category: "Registration",
    relatedTerms: ["Tax Clearance", "B-BBEE", "Supplier"],
  },
  {
    term: "CIDB",
    definition: "Construction Industry Development Board - Regulatory body for the South African construction industry. CIDB registration and grading (Grade 1-9) is mandatory for public sector construction tenders. Each grade has a maximum tender value limit.",
    category: "Registration",
    relatedTerms: ["Construction", "Grading", "Registration"],
  },
  {
    term: "CIDB Grading",
    definition: "Classification system (Grade 1-9) that determines the maximum value of construction tenders a contractor can bid for. Grading is based on financial capacity and technical capability. Contractors can hold multiple grades across different construction classes.",
    category: "Registration",
    relatedTerms: ["CIDB", "Construction", "Contractor"],
  },
  {
    term: "Closing Date",
    definition: "The final date and time by which tender submissions must be received. Late submissions are typically rejected. Closing dates are strictly enforced and stated in tender documents. Also called submission deadline.",
    category: "Process",
    relatedTerms: ["Deadline", "Submission", "Tender"],
  },
  {
    term: "Compliance",
    definition: "Meeting all mandatory requirements specified in a tender. Non-compliance with mandatory requirements results in bid disqualification. Compliance includes submitting required documents, meeting specifications, and following submission instructions.",
    category: "Requirements",
    relatedTerms: ["Mandatory Requirements", "Disqualification", "SBD Forms"],
  },
  {
    term: "Compulsory Briefing",
    definition: "A mandatory briefing session that bidders must attend to be eligible to submit a tender. Non-attendance typically results in automatic disqualification. Attendance registers are kept as proof.",
    category: "Process",
    relatedTerms: ["Briefing Session", "Site Visit", "Mandatory"],
  },
  {
    term: "Contract",
    definition: "A legally binding agreement between the procuring entity and the successful bidder. The contract details deliverables, timelines, payment terms, and performance requirements. Awarded after tender evaluation and acceptance.",
    category: "Process",
    relatedTerms: ["Award", "Agreement", "SLA"],
  },
  {
    term: "Corrigendum",
    definition: "An official correction or amendment to published tender documents. Corrigenda may extend closing dates, clarify requirements, or correct errors. All corrigenda must be incorporated into tender submissions.",
    category: "Process",
    relatedTerms: ["Amendment", "Tender Document", "Addendum"],
  },
  {
    term: "Defects Liability Period",
    definition: "A period (typically 12 months) after project completion during which the contractor remains responsible for fixing defects. A retention amount (usually 10% of contract value) is held until the end of this period.",
    category: "Contract",
    relatedTerms: ["Retention", "Warranty", "Contract"],
  },
  {
    term: "Disqualification",
    definition: "Removal of a bid from evaluation due to non-compliance with mandatory requirements. Common reasons include late submission, missing documents, non-attendance at compulsory briefings, or failure to meet specifications.",
    category: "Process",
    relatedTerms: ["Compliance", "Mandatory Requirements", "Bid"],
  },
  {
    term: "EME",
    definition: "Exempted Micro Enterprise - A business with annual turnover of R10 million or less. EMEs automatically qualify for Level 4 B-BBEE status and receive preference points in tenders. No B-BBEE certificate required, only affidavit.",
    category: "Compliance",
    relatedTerms: ["B-BBEE", "QSE", "Preference Points"],
  },
  {
    term: "eTenders Portal",
    definition: "South Africa's official government tender portal (etenders.gov.za) managed by National Treasury. Centralized platform where all public sector tenders are published. Free access to view tender opportunities, documents, and award notices.",
    category: "Platform",
    relatedTerms: ["Government Tenders", "Procurement", "National Treasury"],
  },
  {
    term: "Evaluation Criteria",
    definition: "The standards and weights used to assess and score tender submissions. Typically includes price (70-90 points), B-BBEE preference points (10-20 points), and sometimes functionality. Criteria are specified in tender documents.",
    category: "Process",
    relatedTerms: ["Bid Evaluation", "Scoring", "Functionality"],
  },
  {
    term: "Functionality",
    definition: "Technical evaluation of a bid's ability to meet requirements. Assessed through experience, qualifications, methodology, and track record. Functionality is scored out of 100 and may have a minimum threshold (e.g., 70%). Only bids meeting the threshold proceed to price evaluation.",
    category: "Evaluation",
    relatedTerms: ["Technical Evaluation", "Evaluation Criteria", "Scoring"],
  },
  {
    term: "Government Gazette",
    definition: "Official government publication where high-value tenders (above certain thresholds) must be advertised in addition to the eTenders portal. The gazette provides legal record of procurement notices.",
    category: "Publication",
    relatedTerms: ["Tender", "Advertisement", "National Treasury"],
  },
  {
    term: "Joint Venture (JV)",
    definition: "Partnership between two or more companies to bid for a tender together. JVs combine resources, experience, and capabilities. For construction tenders, CIDB grades can be combined in joint ventures.",
    category: "Structure",
    relatedTerms: ["Partnership", "CIDB", "Consortium"],
  },
  {
    term: "Letter of Good Standing",
    definition: "Certificate from statutory bodies (UIF, Compensation Fund, Municipality) confirming no outstanding obligations. Often required in tender submissions to prove company compliance with labor and municipal obligations.",
    category: "Compliance",
    relatedTerms: ["Compliance", "Tax Clearance", "Documentation"],
  },
  {
    term: "Mandatory Requirements",
    definition: "Non-negotiable minimum requirements that bids must meet to be considered. Failure to meet any mandatory requirement results in automatic disqualification. Examples include valid registration certificates, tax clearance, and compulsory briefing attendance.",
    category: "Requirements",
    relatedTerms: ["Compliance", "Disqualification", "Requirements"],
  },
  {
    term: "National Treasury",
    definition: "South Africa's financial authority responsible for government procurement policy. Manages the eTenders portal, Central Supplier Database (CSD), and oversees public sector procurement compliance.",
    category: "Authority",
    relatedTerms: ["eTenders Portal", "CSD", "Procurement Policy"],
  },
  {
    term: "PAIA",
    definition: "Promotion of Access to Information Act - Legislation allowing public access to government information, including tender processes. Citizens can request tender information through PAIA.",
    category: "Legislation",
    relatedTerms: ["Transparency", "Information Access", "Legislation"],
  },
  {
    term: "PFMA",
    definition: "Public Finance Management Act - Principal legislation regulating financial management and procurement in national and provincial government. Sets procurement thresholds and requires competitive bidding for amounts above R500,000.",
    category: "Legislation",
    relatedTerms: ["Procurement", "Legislation", "National Treasury"],
  },
  {
    term: "POPIA",
    definition: "Protection of Personal Information Act - Data protection legislation requiring businesses to handle personal information responsibly. IT tenders must demonstrate POPIA compliance in data handling and security measures.",
    category: "Legislation",
    relatedTerms: ["Data Protection", "Privacy", "IT Services"],
  },
  {
    term: "Preference Points",
    definition: "Additional points awarded in tender evaluation based on B-BBEE status. Two systems exist: 80/20 (for tenders below R50 million) where 80 points for price and 20 for B-BBEE; and 90/10 (above R50 million) where 90 points for price and 10 for B-BBEE.",
    category: "Evaluation",
    relatedTerms: ["B-BBEE", "Evaluation Criteria", "80/20", "90/10"],
  },
  {
    term: "Price Schedule",
    definition: "Standardized form where bidders enter their pricing. Must be completed exactly as specified, including all items and in the required format. Errors or alterations may lead to disqualification.",
    category: "Documentation",
    relatedTerms: ["Pricing", "SBD Forms", "Bid"],
  },
  {
    term: "Procurement",
    definition: "The process of acquiring goods, services, or works by government or private entities. Government procurement is regulated by legislation (PFMA, MFMA) and must follow competitive bidding processes for fair, equitable, and transparent acquisition.",
    category: "Process",
    relatedTerms: ["Tender", "Supply Chain Management", "Acquisition"],
  },
  {
    term: "PSIRA",
    definition: "Private Security Industry Regulatory Authority - Statutory body regulating the private security industry in South Africa. All security companies and personnel must be registered with PSIRA to provide security services, including for government contracts.",
    category: "Registration",
    relatedTerms: ["Security Services", "Registration", "Compliance"],
  },
  {
    term: "QSE",
    definition: "Qualifying Small Enterprise - A business with annual turnover between R10 million and R50 million. QSEs automatically qualify for Level 2 B-BBEE status and receive preference points. Only affidavit required, not full B-BBEE certificate.",
    category: "Compliance",
    relatedTerms: ["B-BBEE", "EME", "Preference Points"],
  },
  {
    term: "Retention",
    definition: "Percentage of contract value (typically 10%) withheld by the buyer until successful completion of the defects liability period. Ensures contractor addresses any defects discovered after handover.",
    category: "Contract",
    relatedTerms: ["Defects Liability Period", "Payment", "Contract"],
  },
  {
    term: "RFI",
    definition: "Request for Information - Preliminary process where buyers gather information from potential suppliers before issuing a formal tender. RFIs help define requirements but are not binding. No obligation to respond or award contracts from RFIs.",
    category: "Tender Type",
    relatedTerms: ["RFQ", "RFP", "Tender"],
  },
  {
    term: "RFP",
    definition: "Request for Proposal - Formal tender for complex projects requiring detailed proposals, not just pricing. Bidders submit methodology, approach, timelines, and pricing. Common for consulting, IT projects, and professional services.",
    category: "Tender Type",
    relatedTerms: ["RFQ", "RFI", "Proposal", "Tender"],
  },
  {
    term: "RFQ",
    definition: "Request for Quotation - Tender for clearly specified goods or services where price is the main evaluation factor. RFQs have detailed specifications and bidders quote prices for exactly what's specified. Most common tender type.",
    category: "Tender Type",
    relatedTerms: ["RFP", "RFI", "Quotation", "Tender"],
  },
  {
    term: "SANS",
    definition: "South African National Standards - Technical standards for products, services, and systems. Many tenders require SANS compliance (e.g., SANS 10400 for building regulations). Administered by SABS (South African Bureau of Standards).",
    category: "Standards",
    relatedTerms: ["Standards", "Compliance", "SABS"],
  },
  {
    term: "SBD Forms",
    definition: "Standard Bidding Documents - Standardized forms required in government tenders. Key SBDs include SBD 1 (invitation to bid), SBD 4 (declaration of interest), SBD 6.1 (preference points claim), SBD 8 (declaration of bidder's past SCM practices), and SBD 9 (certificate of independent bid determination).",
    category: "Documentation",
    relatedTerms: ["Documentation", "Compliance", "Tender"],
  },
  {
    term: "SCM",
    definition: "Supply Chain Management - Government's procurement framework for acquiring goods, services, and works. SCM Policy sets out competitive bidding requirements, thresholds, and processes. Applies to all government departments and public entities.",
    category: "Policy",
    relatedTerms: ["Procurement", "PFMA", "Tender"],
  },
  {
    term: "Site Visit",
    definition: "Inspection of the physical location where work will be performed or goods delivered. Site visits help bidders understand requirements, logistics, and site conditions. May be compulsory (attendance required) or optional.",
    category: "Process",
    relatedTerms: ["Briefing Session", "Compulsory Briefing", "Tender"],
  },
  {
    term: "SITA",
    definition: "State Information Technology Agency - Government entity responsible for IT procurement and services for government departments. SITA may be involved in large government IT tenders and has transversal contracts for common IT goods and services.",
    category: "Authority",
    relatedTerms: ["IT Services", "Government", "Procurement"],
  },
  {
    term: "SLA",
    definition: "Service Level Agreement - Formal agreement defining service standards, performance metrics, response times, and remedies for non-performance. Common in IT, maintenance, and service contracts. SLAs include key performance indicators (KPIs) and penalties.",
    category: "Contract",
    relatedTerms: ["Contract", "KPI", "Performance"],
  },
  {
    term: "Specification",
    definition: "Detailed description of goods, services, or works required. Specifications include technical requirements, quality standards, quantities, and performance criteria. Bidders must comply exactly with specifications or risk disqualification.",
    category: "Requirements",
    relatedTerms: ["Requirements", "Technical", "Compliance"],
  },
  {
    term: "Subcontracting",
    definition: "Engaging other companies to perform part of the contract work. Many tenders require disclosure of subcontractors and may set maximum subcontracting percentages. Subcontracting enables smaller companies to participate in large contracts.",
    category: "Structure",
    relatedTerms: ["Contract", "Joint Venture", "Partnership"],
  },
  {
    term: "Tax Clearance",
    definition: "Certificate from South African Revenue Service (SARS) confirming tax compliance. Valid tax clearance is mandatory for government tenders. Tax clearance status is verified through the Central Supplier Database (CSD).",
    category: "Compliance",
    relatedTerms: ["SARS", "CSD", "Compliance"],
  },
  {
    term: "Tender",
    definition: "Formal invitation for suppliers to submit competitive bids to supply goods, services, or works. Government tenders are published on the eTenders portal. Tender documents include specifications, terms and conditions, evaluation criteria, and submission requirements.",
    category: "Process",
    relatedTerms: ["Bid", "RFQ", "RFP", "Procurement"],
  },
  {
    term: "Tender Box",
    definition: "Secure physical location where tender submissions must be deposited. Tender boxes are sealed, access-controlled, and opened publicly at the specified closing time. Electronic submissions through eTenders portal increasingly common.",
    category: "Process",
    relatedTerms: ["Submission", "Closing Date", "Tender"],
  },
  {
    term: "Threshold",
    definition: "Monetary limits determining procurement procedures. PFMA thresholds: up to R500,000 (competitive quotes from 3 suppliers), above R500,000 (formal tender). Different thresholds apply for construction tenders based on CIDB grades.",
    category: "Policy",
    relatedTerms: ["PFMA", "Procurement", "Quotation"],
  },
  {
    term: "Transversal Contract",
    definition: "Framework agreement for commonly used goods or services that multiple government departments can use. Transversal contracts (e.g., for stationery, IT equipment) simplify procurement and leverage volume discounts. Managed by National Treasury or SITA.",
    category: "Contract",
    relatedTerms: ["Framework Agreement", "National Treasury", "SITA"],
  },
  {
    term: "Two-Stage Bidding",
    definition: "Procurement method where bidders first submit technical proposals (Stage 1), which are evaluated. Only bidders meeting technical requirements proceed to Stage 2 (price submission). Common for complex projects.",
    category: "Process",
    relatedTerms: ["Functionality", "Evaluation", "Tender"],
  },
  {
    term: "Variation Order",
    definition: "Formal instruction to change the scope, specifications, or quantities in an existing contract. Variation orders adjust contract price and timelines. Must follow proper approval processes and be documented.",
    category: "Contract",
    relatedTerms: ["Contract", "Amendment", "Change Order"],
  },
];

export default function TenderGlossary() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const filteredTerms = useMemo(() => {
    let filtered = glossaryTerms;

    if (searchQuery) {
      filtered = filtered.filter(
        (term) =>
          term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
          term.definition.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedLetter) {
      filtered = filtered.filter((term) =>
        term.term.toUpperCase().startsWith(selectedLetter)
      );
    }

    return filtered.sort((a, b) => a.term.localeCompare(b.term));
  }, [searchQuery, selectedLetter]);

  const termsByLetter = useMemo(() => {
    const grouped: Record<string, GlossaryTerm[]> = {};
    glossaryTerms.forEach((term) => {
      const letter = term.term[0].toUpperCase();
      if (!grouped[letter]) {
        grouped[letter] = [];
      }
      grouped[letter].push(term);
    });
    return grouped;
  }, []);

  const availableLetters = Object.keys(termsByLetter);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="w-full py-12">
          <div className="content-container">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Search
            </Button>
          </Link>

          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-primary/10 rounded-lg">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <Badge className="mb-2">Tender Glossary</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                A-Z of Tender Terms & Definitions
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl">
                Comprehensive guide to tender, procurement, and government contract terminology in South Africa. Search or browse by letter.
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search terms... (e.g., RFQ, B-BBEE, CIDB)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-6 text-lg"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="w-full py-12">
        <div className="content-container">
        {/* Alphabet Navigation */}
        <Card className="p-6 mb-8">
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
            Browse by Letter
          </h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedLetter === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedLetter(null)}
            >
              All
            </Button>
            {alphabet.map((letter) => {
              const hasTerms = availableLetters.includes(letter);
              return (
                <Button
                  key={letter}
                  variant={selectedLetter === letter ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedLetter(letter)}
                  disabled={!hasTerms}
                  className={!hasTerms ? "opacity-30" : ""}
                >
                  {letter}
                </Button>
              );
            })}
          </div>
        </Card>

        {/* Terms */}
        <div className="space-y-6">
          {filteredTerms.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">
                No terms found matching &quot;{searchQuery}&quot;
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedLetter(null);
                }}
              >
                Clear Search
              </Button>
            </Card>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredTerms.length} term{filteredTerms.length !== 1 ? "s" : ""}
                </p>
              </div>

              {filteredTerms.map((term, idx) => (
                <Card key={idx} className="p-6" id={term.term.toLowerCase().replace(/\s+/g, "-")}>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h2 className="text-2xl font-bold">{term.term}</h2>
                    <Badge variant="secondary">{term.category}</Badge>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {term.definition}
                  </p>
                  {term.relatedTerms && term.relatedTerms.length > 0 && (
                    <div className="pt-4 border-t">
                      <p className="text-sm font-semibold mb-2">Related Terms:</p>
                      <div className="flex flex-wrap gap-2">
                        {term.relatedTerms.map((related, ridx) => (
                          <a
                            key={ridx}
                            href={`#${related.toLowerCase().replace(/\s+/g, "-")}`}
                            className="text-sm text-primary hover:underline"
                          >
                            {related}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </>
          )}
        </div>

        {/* CTA */}
        <Card className="p-8 mt-12 text-center bg-gradient-to-br from-primary/10 to-primary/5">
          <h3 className="text-2xl font-bold mb-4">
            Ready to Start Finding Tenders?
          </h3>
          <p className="text-muted-foreground mb-6">
            Now that you understand the terminology, start searching for government tenders and procurement opportunities.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/">
              <Button size="lg">
                <Search className="h-4 w-4 mr-2" />
                Search Tenders
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button variant="outline" size="lg">
                How It Works
              </Button>
            </Link>
          </div>
        </Card>
        </div>
      </div>
    </div>
  );
}
