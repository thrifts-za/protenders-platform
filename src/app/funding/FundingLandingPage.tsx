/**
 * Funding Landing Page
 * SEO-optimized landing page for /funding route
 * Based on FLP.md specifications
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FundingCard } from "@/components/FundingCard";
import { GuideCard } from "@/components/funding/GuideCard";
import { fundingGuides } from "@/data/fundingGuides";
import {
  Search,
  TrendingUp,
  Building2,
  MapPin,
  Target,
  CheckCircle2,
  Sparkles,
  Users,
  Award,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { trackButtonClick, trackSearch } from "@/lib/analytics";

interface FundingOpportunity {
  id: string;
  slug: string;
  programName: string;
  institution: string;
  fundingType: string;
  categories: string[];
  provinces: string[];
  purpose?: string | null;
  minAmountZAR?: number | null;
  maxAmountZAR?: number | null;
  amountNotes?: string | null;
  fundedIndustries: string[];
  eligibility: string[];
  applyUrl?: string | null;
  source: string;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

const CATEGORIES = [
  { name: "Agriculture", icon: "🌾", href: "/funding/search?categories=Agriculture" },
  { name: "Manufacturing", icon: "🏭", href: "/funding/search?categories=Manufacturing" },
  { name: "Technology", icon: "💻", href: "/funding/search?categories=Technology" },
  { name: "Tourism", icon: "✈️", href: "/funding/search?categories=Tourism" },
  { name: "Energy", icon: "⚡", href: "/funding/search?categories=Energy" },
  { name: "Education & Skills", icon: "🎓", href: "/funding/search?categories=Skills Development" },
];

const INSTITUTIONS = [
  // Government Development Finance Institutions
  { name: "Industrial Development Corporation", short: "IDC", href: "/funding/search?institution=IDC", type: "government" },
  { name: "Small Enterprise Finance Agency", short: "sefa", href: "/funding/search?institution=SEFA", type: "government" },
  { name: "National Empowerment Fund", short: "NEF", href: "/funding/search?institution=NEF", type: "government" },
  { name: "Land Bank", short: "Land Bank", href: "/funding/search?institution=Land+Bank", type: "government" },
  { name: "Department of Trade, Industry and Competition", short: "dtic", href: "/funding/search?institution=dtic", type: "government" },
  { name: "Technology Innovation Agency", short: "TIA", href: "/funding/search?institution=TIA", type: "government" },
  // Corporate ESD Programs
  { name: "FNB Vumela Fund", short: "FNB", href: "/funding/search?institution=FNB", type: "corporate" },
  { name: "Anglo Zimele", short: "Anglo", href: "/funding/search?institution=Anglo", type: "corporate" },
  { name: "Old Mutual Masisizane", short: "Old Mutual", href: "/funding/search?institution=Old+Mutual", type: "corporate" },
  { name: "MTN Gazelles", short: "MTN", href: "/funding/search?institution=MTN", type: "corporate" },
  { name: "Sasol Siyakha Trust", short: "Sasol", href: "/funding/search?institution=Sasol", type: "corporate" },
  { name: "SAB Foundation Thrive", short: "SAB", href: "/funding/search?institution=SAB", type: "corporate" },
];

const PROVINCES = [
  { name: "Gauteng", href: "/funding/search?provinces=Gauteng" },
  { name: "KwaZulu-Natal", href: "/funding/search?provinces=KwaZulu-Natal" },
  { name: "Western Cape", href: "/funding/search?provinces=Western%20Cape" },
  { name: "Eastern Cape", href: "/funding/search?provinces=Eastern%20Cape" },
  { name: "Limpopo", href: "/funding/search?provinces=Limpopo" },
  { name: "Mpumalanga", href: "/funding/search?provinces=Mpumalanga" },
  { name: "Free State", href: "/funding/search?provinces=Free%20State" },
  { name: "Northern Cape", href: "/funding/search?provinces=Northern%20Cape" },
  { name: "North West", href: "/funding/search?provinces=North%20West" },
];

const FAQS = [
  {
    question: "What funding options are available for small businesses in South Africa?",
    answer: "Grants, loans, equity, and hybrid programs from DFIs such as IDC, SEFA, and NEF. Programs range from R50,000 for startups to R50 million+ for established enterprises.",
  },
  {
    question: "Who qualifies for SME funding?",
    answer: "Registered South African entities that meet the eligibility criteria for each program. Most programs target businesses with 51% black ownership, annual turnover below R100 million, and viable business plans.",
  },
  {
    question: "How do I apply for funding?",
    answer: "Each funding program lists its requirements and provides a link to apply or contact the provider directly. Most applications require financial statements, business plans, and proof of registration.",
  },
  {
    question: "How long does it take to get approved?",
    answer: "Application processing varies by institution. SEFA typically takes 4-6 weeks, IDC 6-8 weeks for loans under R10 million, and NEF 8-12 weeks depending on the program and due diligence requirements.",
  },
];

export default function FundingLandingPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [fundingType, setFundingType] = useState("all");
  const [topFunding, setTopFunding] = useState<FundingOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch top funding opportunities
  useEffect(() => {
    async function fetchTopFunding() {
      try {
        const response = await fetch('/api/funding?pageSize=6&sort=latest');
        if (response.ok) {
          const data = await response.json();
          setTopFunding(data.items);
        }
      } catch (error) {
        console.error('Error fetching top funding:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTopFunding();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    trackSearch(searchQuery, { context: 'funding', fundingType });

    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (fundingType !== 'all') params.set('fundingType', fundingType);

    router.push(`/funding/search?${params.toString()}`);
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Find SME Funding in South Africa",
            "about": ["Grants", "Loans", "Equity Funding", "SME Finance"],
            "publisher": {
              "@type": "Organization",
              "name": "ProTender"
            },
            "hasPart": [
              {
                "@type": "Dataset",
                "name": "Funding Opportunities Dataset"
              }
            ],
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://protenders.co.za/funding/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })
        }}
        suppressHydrationWarning
      />

      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": FAQS.map(faq => ({
              "@type": "Question",
              "name": faq.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
              }
            }))
          })
        }}
        suppressHydrationWarning
      />

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="w-full bg-gradient-to-b from-primary/5 to-background border-b">
          <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              {/* Trust Badges */}
              <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span>10,000+ SMEs</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" />
                  <span>90+ Programs</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Verified Data</span>
                </div>
              </div>

              {/* Main Heading */}
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
                  Find Business Funding Opportunities in South Africa
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                  Explore verified grants, loans, and equity programs from Government DFIs (IDC, SEFA, NEF, Land Bank) and Corporate ESD programs (FNB, Anglo, Sasol, MTN, and more) — all in one place.
                </p>
              </div>

              {/* Search Form */}
              <form onSubmit={handleSearch} className="w-full max-w-3xl mx-auto">
                <Card className="p-2 shadow-lg">
                  <div className="flex flex-col md:flex-row gap-2">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Search by keyword, amount, or industry..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-12 border-0 focus-visible:ring-0"
                      />
                    </div>
                    <select
                      value={fundingType}
                      onChange={(e) => setFundingType(e.target.value)}
                      className="h-12 px-4 rounded-md border bg-background text-sm"
                    >
                      <option value="all">All funding types</option>
                      <option value="Grant">Grants</option>
                      <option value="Loan">Loans</option>
                      <option value="Equity">Equity</option>
                    </select>
                    <Button type="submit" size="lg" className="h-12 px-8">
                      <Search className="h-4 w-4 mr-2" />
                      Find Funding
                    </Button>
                  </div>
                </Card>
              </form>

              {/* Quick Actions */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link href="/funding/match">
                  <Button variant="outline" size="sm" onClick={() => trackButtonClick('match_from_hero', 'funding_landing')}>
                    <Target className="h-4 w-4 mr-2" />
                    Get Personalized Matches
                  </Button>
                </Link>
                <Link href="/funding/search">
                  <Button variant="ghost" size="sm">
                    Browse All Programs
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Category Grid */}
        <section className="w-full py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-3xl md:text-4xl font-bold">Explore Funding by Category</h2>
                <p className="text-muted-foreground">Find programs tailored to your industry</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {CATEGORIES.map((category) => (
                  <Link
                    key={category.name}
                    href={category.href}
                    onClick={() => trackButtonClick(`category_${category.name}`, 'funding_landing')}
                  >
                    <Card className="p-6 hover:shadow-lg hover:border-primary transition-all cursor-pointer h-full">
                      <div className="flex flex-col items-center text-center gap-3">
                        <div className="text-4xl">{category.icon}</div>
                        <div className="font-semibold">{category.name}</div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Featured Institutions */}
        <section className="w-full py-16 bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-3xl md:text-4xl font-bold">Funding Institutions</h2>
                <p className="text-muted-foreground">
                  Compare programs from South Africa's top development finance institutions (DFIs)
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {INSTITUTIONS.map((institution) => (
                  <Link
                    key={institution.short}
                    href={institution.href}
                    onClick={() => trackButtonClick(`institution_${institution.short}`, 'funding_landing')}
                  >
                    <Card className="p-6 hover:shadow-lg hover:border-primary transition-all cursor-pointer h-full">
                      <div className="flex flex-col items-center text-center gap-2">
                        <Building2 className="h-8 w-8 text-primary" />
                        <div className="font-bold text-lg">{institution.short}</div>
                        <div className="text-xs text-muted-foreground">{institution.name}</div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Top Funding Opportunities */}
        <section className="w-full py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto space-y-8">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h2 className="text-3xl md:text-4xl font-bold flex items-center gap-2">
                    <TrendingUp className="h-8 w-8 text-primary" />
                    Top Funding Opportunities This Month
                  </h2>
                  <p className="text-muted-foreground">Recently added and updated programs</p>
                </div>
                <Link href="/funding/search">
                  <Button variant="outline">
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="p-6 h-48" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {topFunding.map((funding) => (
                    <FundingCard key={funding.id} funding={funding} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Featured Funding Guides */}
        <section className="w-full py-16 bg-gradient-to-br from-indigo-50 to-purple-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold flex items-center gap-2">
                    <BookOpen className="h-8 w-8 text-indigo-600" />
                    Funding Guides & Resources
                  </h2>
                  <p className="text-muted-foreground mt-2">Step-by-step guides to accessing SMME funding</p>
                </div>
                <Link href="/funding/guides">
                  <Button variant="outline">
                    View All Guides
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {fundingGuides
                  .filter((guide) => guide.featured)
                  .slice(0, 3)
                  .map((guide) => (
                    <GuideCard key={guide.id} guide={guide} featured />
                  ))}
              </div>

              <div className="text-center pt-4">
                <p className="text-sm text-gray-600 mb-4">
                  Free downloads, checklists, and expert strategies for every stage of your funding journey
                </p>
                <Link href="/funding/guides">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => trackButtonClick('view_all_guides', 'funding_landing')}
                  >
                    <BookOpen className="h-5 w-5 mr-2" />
                    Browse Complete Guide Library
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Province Discovery */}
        <section className="w-full py-16 bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-3xl md:text-4xl font-bold flex items-center justify-center gap-2">
                  <MapPin className="h-8 w-8 text-primary" />
                  Find Funding by Province
                </h2>
                <p className="text-muted-foreground">Discover location-specific funding opportunities</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {PROVINCES.map((province) => (
                  <Link
                    key={province.name}
                    href={province.href}
                    onClick={() => trackButtonClick(`province_${province.name}`, 'funding_landing')}
                  >
                    <Card className="p-4 hover:shadow-lg hover:border-primary transition-all cursor-pointer">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-green-600" />
                        <span className="font-medium">Funding in {province.name}</span>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Personalized Matches CTA */}
        <section className="w-full py-16 bg-primary/5 border-y">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">Get Personalized Funding Matches</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Answer a few questions about your business and we'll match you with funding opportunities tailored to your industry, size, and location.
              </p>
              <div className="pt-4">
                <Link href="/funding/match">
                  <Button
                    size="lg"
                    className="h-12 px-8"
                    onClick={() => trackButtonClick('match_cta', 'funding_landing')}
                  >
                    <Target className="h-5 w-5 mr-2" />
                    Find Your Perfect Match
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="w-full py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-3xl md:text-4xl font-bold">Frequently Asked Questions</h2>
                <p className="text-muted-foreground">Everything you need to know about SME funding</p>
              </div>

              <div className="space-y-4">
                {FAQS.map((faq, index) => (
                  <details
                    key={index}
                    className="group bg-card border rounded-lg overflow-hidden"
                  >
                    <summary className="cursor-pointer p-6 font-semibold text-lg hover:bg-accent transition-colors flex items-center justify-between">
                      {faq.question}
                      <ChevronRight className="h-5 w-5 group-open:rotate-90 transition-transform" />
                    </summary>
                    <div className="px-6 pb-6 text-muted-foreground border-t pt-4">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>

              <div className="text-center pt-8">
                <Link href="/faq">
                  <Button variant="outline">
                    View All FAQs
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer Deep Links */}
        <section className="w-full py-12 bg-slate-50 border-t">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-semibold text-lg mb-4">Funding by Type</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/funding/search?fundingType=Grant" className="text-muted-foreground hover:text-primary">
                      Grants
                    </Link>
                  </li>
                  <li>
                    <Link href="/funding/search?fundingType=Loan" className="text-muted-foreground hover:text-primary">
                      Loans
                    </Link>
                  </li>
                  <li>
                    <Link href="/funding/search?fundingType=Equity" className="text-muted-foreground hover:text-primary">
                      Equity Funding
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-4">Funding by Sector</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/funding/search?categories=Manufacturing" className="text-muted-foreground hover:text-primary">
                      Manufacturing
                    </Link>
                  </li>
                  <li>
                    <Link href="/funding/search?categories=Agriculture" className="text-muted-foreground hover:text-primary">
                      Agriculture
                    </Link>
                  </li>
                  <li>
                    <Link href="/funding/search?categories=Technology" className="text-muted-foreground hover:text-primary">
                      Technology
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-4">Funding by Institution</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/funding/search?institution=IDC" className="text-muted-foreground hover:text-primary">
                      IDC Funding
                    </Link>
                  </li>
                  <li>
                    <Link href="/funding/search?institution=SEFA" className="text-muted-foreground hover:text-primary">
                      SEFA Loans
                    </Link>
                  </li>
                  <li>
                    <Link href="/funding/search?institution=NEF" className="text-muted-foreground hover:text-primary">
                      NEF Programs
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
