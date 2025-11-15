import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Breadcrumbs from "@/components/Breadcrumbs";
import { CheckCircle, XCircle, ExternalLink, Search, Bell, Zap, Database, Shield, TrendingUp } from "lucide-react";
import { generateBreadcrumbSchema, renderStructuredData } from "@/lib/structured-data";

export const revalidate = 86400; // 24 hours

export const metadata: Metadata = {
  title: "South Africa Tender Portals 2025 | Complete Comparison Guide | ProTenders",
  description: "Compare all South African tender portals: eTenders.gov.za, ProTenders, EasyTenders, TenderBulletins & more. Features, pricing, database size, and which is best for your business in 2025.",
  keywords: "tender portals south africa, etenders portal, government tender portals, tender websites south africa, best tender portal, protenders vs easytenders, tender portal comparison, south african tender sites",
  openGraph: {
    title: "South Africa Tender Portals 2025 | Complete Comparison Guide",
    description: "Comprehensive comparison of all South African tender portals. Features, pricing, database sizes, and expert recommendations.",
    url: "https://protenders.co.za/tender-portals-south-africa",
    type: "website",
  },
  alternates: {
    canonical: "https://protenders.co.za/tender-portals-south-africa"
  }
};

export default function TenderPortalsPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://protenders.co.za/" },
    { name: "Tender Portals South Africa", url: "https://protenders.co.za/tender-portals-south-africa" },
  ]);

  const portals = [
    {
      name: "ProTenders",
      url: "https://protenders.co.za",
      official: false,
      tenderCount: "48,000+",
      pricing: "Free",
      features: {
        search: true,
        alerts: true,
        aiPowered: true,
        funding: true,
        analytics: true,
        mobile: true,
        api: true,
        beeInsights: true,
        paymentData: true,
        support: true
      },
      pros: [
        "Largest database (48K+ tenders)",
        "AI-powered smart alerts",
        "Free forever access",
        "Funding discovery included",
        "Payment analytics (unique)",
        "Modern, fast interface",
        "Daily automated updates",
        "Mobile-optimized"
      ],
      cons: [
        "Newer platform (growing)",
        "Still building brand awareness"
      ],
      bestFor: "SMEs, startups, growing businesses seeking comprehensive tender intelligence"
    },
    {
      name: "eTenders.gov.za",
      url: "https://etenders.gov.za",
      official: true,
      tenderCount: "~10,000",
      pricing: "Free",
      features: {
        search: true,
        alerts: false,
        aiPowered: false,
        funding: false,
        analytics: false,
        mobile: false,
        api: true,
        beeInsights: false,
        paymentData: false,
        support: false
      },
      pros: [
        "Official government portal",
        "Direct source data",
        "Free access",
        "OCDS API available"
      ],
      cons: [
        "Outdated interface (2010s design)",
        "No smart search",
        "No alerts or notifications",
        "Slow performance",
        "Mobile unfriendly",
        "Limited filtering options",
        "No business intelligence"
      ],
      bestFor: "Direct government source verification, OCDS data access for developers"
    },
    {
      name: "EasyTenders",
      url: "https://easytenders.co.za",
      official: false,
      tenderCount: "~8,000",
      pricing: "Paid (subscription required)",
      features: {
        search: true,
        alerts: true,
        aiPowered: false,
        funding: false,
        analytics: false,
        mobile: true,
        api: false,
        beeInsights: false,
        paymentData: false,
        support: true
      },
      pros: [
        "Established brand",
        "Basic email alerts",
        "Province filtering",
        "Decent mobile app"
      ],
      cons: [
        "Requires paid subscription",
        "Smaller database",
        "No advanced features",
        "No funding integration",
        "Limited business intelligence"
      ],
      bestFor: "Businesses willing to pay for basic alerts and established brand"
    },
    {
      name: "TenderBulletins",
      url: "https://tenderbulletins.co.za",
      official: false,
      tenderCount: "~5,000",
      pricing: "Paid",
      features: {
        search: true,
        alerts: true,
        aiPowered: false,
        funding: false,
        analytics: false,
        mobile: false,
        api: false,
        beeInsights: false,
        paymentData: false,
        support: true
      },
      pros: [
        "Email bulletins",
        "Category filtering"
      ],
      cons: [
        "Smallest database",
        "Paid access required",
        "Limited features",
        "Outdated technology",
        "No mobile optimization"
      ],
      bestFor: "Users comfortable with email-based tender bulletins"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: renderStructuredData(breadcrumbSchema) }} />

      <Breadcrumbs items={[
        { label: "Home", href: "/" },
        { label: "Tender Portals South Africa" },
      ]} />

      <header className="w-full border-b bg-gradient-to-br from-purple-50 via-pink-50 to-background dark:from-purple-950/20 dark:via-pink-950/20">
        <div className="content-container py-16">
          <Badge className="mb-3 bg-purple-600">2025 Comparison Guide</Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            South Africa Tender Portals: Complete Comparison 2025
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mb-6">
            Comprehensive comparison of all major tender portals in South Africa. Features, pricing, database sizes,
            and which portal is best for your business needs.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/register"><Button size="lg">Try ProTenders Free</Button></Link>
            <Link href="#comparison"><Button size="lg" variant="outline">View Comparison</Button></Link>
          </div>
        </div>
      </header>

      <div className="w-full py-12">
        <div className="content-container">

          {/* Quick Overview */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Quick Overview: Tender Portals in South Africa</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6">
                <Database className="h-8 w-8 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">4 Main Portals</h3>
                <p className="text-muted-foreground">1 official government portal + 3 major commercial platforms serving SA businesses</p>
              </Card>
              <Card className="p-6">
                <TrendingUp className="h-8 w-8 text-green-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">48K+ Tenders</h3>
                <p className="text-muted-foreground">Combined database across all portals, with ProTenders offering the largest single collection</p>
              </Card>
              <Card className="p-6">
                <Shield className="h-8 w-8 text-purple-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Free & Paid Options</h3>
                <p className="text-muted-foreground">Mix of free platforms (eTenders.gov, ProTenders) and paid subscriptions (EasyTenders, etc.)</p>
              </Card>
              <Card className="p-6">
                <Zap className="h-8 w-8 text-orange-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Daily Updates</h3>
                <p className="text-muted-foreground">Most portals update daily, with ProTenders offering real-time syncs from National Treasury</p>
              </Card>
            </div>
          </section>

          {/* Detailed Comparison */}
          <section className="mb-12" id="comparison">
            <h2 className="text-3xl font-bold mb-6">Detailed Portal Comparison</h2>

            <div className="space-y-8">
              {portals.map((portal, idx) => (
                <Card key={idx} className={`p-8 ${portal.name === 'ProTenders' ? 'border-2 border-blue-500 shadow-lg' : ''}`}>
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold">{portal.name}</h3>
                        {portal.official && <Badge variant="outline" className="bg-green-50">Official</Badge>}
                        {portal.name === 'ProTenders' && <Badge className="bg-blue-600">Recommended</Badge>}
                      </div>
                      <p className="text-muted-foreground">{portal.bestFor}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground mb-1">Database Size</div>
                      <div className="text-2xl font-bold text-primary">{portal.tenderCount}</div>
                      <div className="text-sm font-semibold mt-2">{portal.pricing}</div>
                    </div>
                  </div>

                  {/* Features Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                    <div className="flex items-center gap-2">
                      {portal.features.search ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-gray-400" />}
                      <span className="text-sm">Search</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {portal.features.alerts ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-gray-400" />}
                      <span className="text-sm">Alerts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {portal.features.aiPowered ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-gray-400" />}
                      <span className="text-sm">AI-Powered</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {portal.features.funding ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-gray-400" />}
                      <span className="text-sm">Funding</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {portal.features.analytics ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-gray-400" />}
                      <span className="text-sm">Analytics</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {portal.features.mobile ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-gray-400" />}
                      <span className="text-sm">Mobile</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {portal.features.api ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-gray-400" />}
                      <span className="text-sm">API Access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {portal.features.beeInsights ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-gray-400" />}
                      <span className="text-sm">BEE Insights</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {portal.features.paymentData ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-gray-400" />}
                      <span className="text-sm">Payment Data</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {portal.features.support ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-gray-400" />}
                      <span className="text-sm">Support</span>
                    </div>
                  </div>

                  {/* Pros and Cons */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="font-semibold mb-3 text-green-700 dark:text-green-400">Strengths</h4>
                      <ul className="space-y-2">
                        {portal.pros.map((pro, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3 text-orange-700 dark:text-orange-400">Limitations</h4>
                      <ul className="space-y-2">
                        {portal.cons.map((con, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <XCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* CTA */}
                  {portal.name === 'ProTenders' ? (
                    <Link href="/register">
                      <Button className="w-full" size="lg">Start Using ProTenders Free</Button>
                    </Link>
                  ) : (
                    <a href={portal.url} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" className="w-full" size="lg">
                        Visit {portal.name} <ExternalLink className="h-4 w-4 ml-2" />
                      </Button>
                    </a>
                  )}
                </Card>
              ))}
            </div>
          </section>

          {/* Recommendation Section */}
          <section className="mb-12">
            <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200">
              <h2 className="text-3xl font-bold mb-6">Our Recommendation</h2>
              <div className="space-y-4 text-lg">
                <p>
                  <strong>For most businesses:</strong> Use <strong>ProTenders</strong> as your primary portal.
                  It offers the largest database (48K+ tenders), AI-powered alerts, and unique features like funding
                  discovery and payment analytics - all completely free.
                </p>
                <p>
                  <strong>For verification:</strong> Cross-reference critical tenders on <strong>eTenders.gov.za</strong>
                  (the official source) to verify closing dates and document versions.
                </p>
                <p>
                  <strong>For paid features:</strong> If you need premium support or have specific workflow requirements,
                  consider <strong>EasyTenders</strong> as a paid supplement.
                </p>
                <div className="flex gap-3 mt-6">
                  <Link href="/register"><Button size="lg">Get Started with ProTenders</Button></Link>
                  <Link href="/search"><Button size="lg" variant="outline">Browse Tenders</Button></Link>
                </div>
              </div>
            </Card>
          </section>

          {/* FAQ */}
          <section>
            <h2 className="text-3xl font-bold mb-6">Common Questions About Tender Portals</h2>
            <div className="space-y-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-2">Which tender portal has the most tenders?</h3>
                <p className="text-muted-foreground">
                  ProTenders currently has the largest database with 48,000+ active tenders, aggregating from National
                  Treasury, all provinces, and 257 municipalities. eTenders.gov.za (official) has ~10,000, EasyTenders
                  has ~8,000, and TenderBulletins has ~5,000.
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-2">Are free tender portals as good as paid ones?</h3>
                <p className="text-muted-foreground">
                  Yes. ProTenders is completely free and offers more features than most paid portals, including AI alerts,
                  funding discovery, and payment analytics. The official eTenders.gov.za is also free. Paid portals may
                  offer premium support but don't necessarily have better data.
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-2">How do tender portals get their data?</h3>
                <p className="text-muted-foreground">
                  Most portals source data from the National Treasury's eTenders portal via the OCDS API. ProTenders
                  syncs daily with this official source, plus adds value through AI matching, analytics, and integrations
                  with funding opportunities.
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-2">Can I use multiple tender portals?</h3>
                <p className="text-muted-foreground">
                  Yes! Many businesses use ProTenders for daily alerts and comprehensive search, then verify final details
                  on eTenders.gov.za (the official source) before submitting bids. This dual approach ensures you don't
                  miss opportunities while maintaining accuracy.
                </p>
              </Card>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
