import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Building2, TrendingUp, FileText, Users, CheckCircle, AlertCircle } from "lucide-react";
import { generateBreadcrumbSchema, renderStructuredData } from "@/lib/structured-data";
import { LiveTendersFiltered } from "@/components/LiveTendersFiltered";

export const revalidate = 3600; // 1 hour

export const metadata: Metadata = {
  title: "South Africa Government Tenders 2025 | 48,000+ Active Opportunities | ProTenders",
  description: "Browse 48,000+ government tenders across South Africa. National, provincial & municipal tenders from all departments. Daily updates, AI-powered alerts, BEE opportunities. Free search.",
  keywords: "government tenders south africa, south african government tenders, government tenders, sa government tenders, tenders south africa, government procurement, national tenders, provincial tenders, municipal tenders, etenders south africa",
  openGraph: {
    title: "South Africa Government Tenders 2025 | 48,000+ Active Opportunities",
    description: "The most comprehensive government tender portal in South Africa. Search 48,000+ active tenders from national, provincial and municipal departments.",
    url: "https://protenders.co.za/south-africa-government-tenders",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "South Africa Government Tenders 2025 | 48,000+ Opportunities",
    description: "Browse 48,000+ government tenders across South Africa. Daily updates, AI alerts, BEE opportunities.",
  },
  alternates: {
    canonical: "https://protenders.co.za/south-africa-government-tenders"
  }
};

export default function SouthAfricaGovernmentTendersPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://protenders.co.za/" },
    { name: "Government Tenders South Africa", url: "https://protenders.co.za/south-africa-government-tenders" },
  ]);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How do I find government tenders in South Africa?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "ProTenders aggregates 48,000+ government tenders from all South African departments. Search by category, location, value, or keywords. Get free AI-powered alerts when new tenders match your business."
        }
      },
      {
        "@type": "Question",
        "name": "Are government tenders free to access?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! All government tenders on ProTenders are free to search and view. We source data directly from the National Treasury's eTenders portal and update daily with new opportunities."
        }
      },
      {
        "@type": "Question",
        "name": "What types of government tenders are available?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Government tenders span all sectors: construction, IT services, consulting, security, cleaning, catering, medical supplies, transport, and more. From national departments (Eskom, Transnet, SANRAL) to municipalities across all 9 provinces."
        }
      },
      {
        "@type": "Question",
        "name": "How often are tenders updated?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "ProTenders updates tender data daily via automated syncs with the National Treasury OCDS API. New tenders appear within hours of being published, and closing dates are monitored in real-time."
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: renderStructuredData(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <Breadcrumbs items={[
        { label: "Home", href: "/" },
        { label: "Government Tenders South Africa" },
      ]} />

      <header className="w-full border-b bg-gradient-to-br from-blue-50 via-indigo-50 to-background dark:from-blue-950/20 dark:via-indigo-950/20">
        <div className="content-container py-16">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Building2 className="h-10 w-10 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <Badge className="mb-3 bg-blue-600">Official Source</Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                South Africa Government Tenders 2025
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mb-6">
                Search 48,000+ active government tenders from national, provincial, and municipal departments.
                Daily updates. Free access. AI-powered alerts.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/search"><Button size="lg">Search All Tenders</Button></Link>
                <Link href="/alerts"><Button size="lg" variant="outline">Set Up Alerts</Button></Link>
                <Link href="/register"><Button size="lg" variant="outline">Free Registration</Button></Link>
              </div>
            </div>
          </div>

          {/* Key Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <Card className="p-6 border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <div className="text-sm font-medium text-muted-foreground">Active Tenders</div>
              </div>
              <div className="text-3xl font-bold text-blue-600">48,000+</div>
            </Card>
            <Card className="p-6 border-green-200 bg-green-50/50 dark:bg-green-950/20">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div className="text-sm font-medium text-muted-foreground">Daily Updates</div>
              </div>
              <div className="text-3xl font-bold text-green-600">Real-Time</div>
            </Card>
            <Card className="p-6 border-purple-200 bg-purple-50/50 dark:bg-purple-950/20">
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="h-5 w-5 text-purple-600" />
                <div className="text-sm font-medium text-muted-foreground">Departments</div>
              </div>
              <div className="text-3xl font-bold text-purple-600">1,500+</div>
            </Card>
            <Card className="p-6 border-orange-200 bg-orange-50/50 dark:bg-orange-950/20">
              <div className="flex items-center gap-3 mb-2">
                <Users className="h-5 w-5 text-orange-600" />
                <div className="text-sm font-medium text-muted-foreground">Provinces</div>
              </div>
              <div className="text-3xl font-bold text-orange-600">All 9</div>
            </Card>
          </div>
        </div>
      </header>

      <div className="w-full py-12">
        <div className="content-container">
          {/* Why ProTenders */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Why ProTenders is South Africa's Leading Tender Portal</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6">
                <CheckCircle className="h-8 w-8 text-green-600 mb-4" />
                <h3 className="text-xl font-semibold mb-3">Most Comprehensive Database</h3>
                <p className="text-muted-foreground">
                  48,000+ active tenders - 5x more than any competitor. We aggregate from National Treasury,
                  all provinces, and 257 municipalities.
                </p>
              </Card>
              <Card className="p-6">
                <CheckCircle className="h-8 w-8 text-green-600 mb-4" />
                <h3 className="text-xl font-semibold mb-3">AI-Powered Smart Alerts</h3>
                <p className="text-muted-foreground">
                  Never miss an opportunity. Our AI matches tenders to your business profile and sends
                  instant notifications for relevant opportunities.
                </p>
              </Card>
              <Card className="p-6">
                <CheckCircle className="h-8 w-8 text-green-600 mb-4" />
                <h3 className="text-xl font-semibold mb-3">Free Access Forever</h3>
                <p className="text-muted-foreground">
                  Government tender information should be free and accessible. Search, view, and download
                  tender documents at no cost.
                </p>
              </Card>
            </div>
          </section>

          {/* Browse by Category */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Browse Government Tenders by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href="/category/construction"><Button variant="outline" className="w-full">Construction</Button></Link>
              <Link href="/category/it-services"><Button variant="outline" className="w-full">IT Services</Button></Link>
              <Link href="/category/consulting"><Button variant="outline" className="w-full">Consulting</Button></Link>
              <Link href="/category/security"><Button variant="outline" className="w-full">Security Services</Button></Link>
              <Link href="/category/cleaning"><Button variant="outline" className="w-full">Cleaning</Button></Link>
              <Link href="/category/catering"><Button variant="outline" className="w-full">Catering</Button></Link>
              <Link href="/category/transport"><Button variant="outline" className="w-full">Transport</Button></Link>
              <Link href="/categories"><Button variant="outline" className="w-full">View All Categories</Button></Link>
            </div>
          </section>

          {/* Browse by Province */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Government Tenders by Province</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Link href="/province/gauteng"><Button variant="outline" className="w-full">Gauteng Tenders</Button></Link>
              <Link href="/province/western-cape"><Button variant="outline" className="w-full">Western Cape Tenders</Button></Link>
              <Link href="/province/kwazulu-natal"><Button variant="outline" className="w-full">KwaZulu-Natal Tenders</Button></Link>
              <Link href="/province/eastern-cape"><Button variant="outline" className="w-full">Eastern Cape Tenders</Button></Link>
              <Link href="/province/limpopo"><Button variant="outline" className="w-full">Limpopo Tenders</Button></Link>
              <Link href="/province/mpumalanga"><Button variant="outline" className="w-full">Mpumalanga Tenders</Button></Link>
              <Link href="/province/free-state"><Button variant="outline" className="w-full">Free State Tenders</Button></Link>
              <Link href="/province/north-west"><Button variant="outline" className="w-full">North West Tenders</Button></Link>
              <Link href="/province/northern-cape"><Button variant="outline" className="w-full">Northern Cape Tenders</Button></Link>
            </div>
          </section>

          {/* Browse by Value */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Find Tenders by Contract Value</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/tenders/sme-opportunities">
                <Card className="p-6 hover:border-green-300 transition-colors cursor-pointer">
                  <Badge className="mb-3 bg-green-600">Best for SMEs</Badge>
                  <h3 className="text-xl font-semibold mb-2">Under R1 Million</h3>
                  <p className="text-muted-foreground">Entry-level tenders perfect for small businesses and startups. Lower risk, EME/QSE preferences.</p>
                </Card>
              </Link>
              <Link href="/tenders/1-5-million">
                <Card className="p-6 hover:border-blue-300 transition-colors cursor-pointer">
                  <Badge className="mb-3 bg-blue-600">Growth Stage</Badge>
                  <h3 className="text-xl font-semibold mb-2">R1M - R5M</h3>
                  <p className="text-muted-foreground">Medium-scale contracts for growing businesses with proven track records.</p>
                </Card>
              </Link>
              <Link href="/tenders/over-10-million">
                <Card className="p-6 hover:border-purple-300 transition-colors cursor-pointer">
                  <Badge className="mb-3 bg-purple-600">Enterprise</Badge>
                  <h3 className="text-xl font-semibold mb-2">Over R10 Million</h3>
                  <p className="text-muted-foreground">High-value infrastructure and enterprise contracts. Major projects and consortiums.</p>
                </Card>
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-2">How do I find government tenders in South Africa?</h3>
                <p className="text-muted-foreground">
                  ProTenders aggregates 48,000+ government tenders from all South African departments. Search by category,
                  location, value, or keywords. Get free AI-powered alerts when new tenders match your business.
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-2">Are government tenders free to access?</h3>
                <p className="text-muted-foreground">
                  Yes! All government tenders on ProTenders are free to search and view. We source data directly from
                  the National Treasury's eTenders portal and update daily with new opportunities.
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-2">What types of government tenders are available?</h3>
                <p className="text-muted-foreground">
                  Government tenders span all sectors: construction, IT services, consulting, security, cleaning, catering,
                  medical supplies, transport, and more. From national departments (Eskom, Transnet, SANRAL) to municipalities
                  across all 9 provinces.
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-2">How often are tenders updated?</h3>
                <p className="text-muted-foreground">
                  ProTenders updates tender data daily via automated syncs with the National Treasury OCDS API. New tenders
                  appear within hours of being published, and closing dates are monitored in real-time.
                </p>
              </Card>
            </div>
          </section>

          {/* Latest Tenders */}
          <section>
            <Alert className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription>
                <span className="font-semibold">Live Tender Feed:</span> These are the latest active government tenders across South Africa. Updated in real-time.
              </AlertDescription>
            </Alert>

            <h2 className="text-3xl font-bold mb-6">Latest Government Tenders</h2>
            <LiveTendersFiltered
              filters={{ status: 'active', page: 1, pageSize: 20, sort: '-publishedDate' }}
              emptyIcon={<FileText className="h-12 w-12 text-muted-foreground" />}
              emptyTitle="No Active Tenders"
              emptyDescription="Check back soon for new government tender opportunities."
              emptyAction={
                <Link href="/search"><Button>Advanced Search</Button></Link>
              }
            />
          </section>
        </div>
      </div>
    </div>
  );
}
