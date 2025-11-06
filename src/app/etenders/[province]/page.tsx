import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProvinceBySlug, getAllProvinceSlugs } from '@/data/provinces';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, FileText, TrendingUp, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';
import { generateBreadcrumbSchema, renderStructuredData } from '@/lib/structured-data';

// ISR: Revalidate every 6 hours for eTender pages
export const revalidate = 21600;

/**
 * Generate static paths for all provincial eTender pages
 */
export async function generateStaticParams() {
  const slugs = getAllProvinceSlugs();
  return slugs.map((province) => ({
    province,
  }));
}

/**
 * Generate metadata for provincial eTender pages
 * Optimized for high-volume keywords like "eastern cape tenders", "tenders in kzn"
 */
export async function generateMetadata({
  params
}: {
  params: Promise<{ province: string }>
}): Promise<Metadata> {
  const { province } = await params;
  const provinceData = getProvinceBySlug(province);

  if (!provinceData) {
    return {
      title: 'Province Not Found | ProTenders',
    };
  }

  // Comprehensive keywords targeting research data
  const keywords = [
    `${provinceData.name.toLowerCase()} etenders`,
    `etenders ${provinceData.name.toLowerCase()}`,
    `${provinceData.name.toLowerCase()} tenders`,
    `tenders in ${provinceData.name.toLowerCase()}`,
    `government tenders ${provinceData.name.toLowerCase()}`,
    `government etenders ${provinceData.name.toLowerCase()}`,
    `${provinceData.name} tender opportunities`,
    `${provinceData.name} procurement`,
    `${provinceData.name} RFQ`,
    `${provinceData.name} RFP`,
    `find tenders ${provinceData.name.toLowerCase()}`,
    `${provinceData.name} government contracts`,
    `etender portal ${provinceData.name.toLowerCase()}`,
    ...(provinceData.keyIndustries?.map(ind =>
      `${ind.toLowerCase()} tenders ${provinceData.name.toLowerCase()}`
    ) || []),
  ];

  return {
    title: `${provinceData.name} eTenders | Find Government Tenders in ${provinceData.name} 2025`,
    description: `Search ${provinceData.name} government eTenders and procurement opportunities. Find active tenders from provincial departments, municipalities, and SOEs. Free alerts for ${provinceData.name} tenders.`,
    keywords: keywords.join(', '),
    openGraph: {
      title: `${provinceData.name} eTenders & Government Tenders 2025`,
      description: `Search ${provinceData.name} government eTenders and procurement opportunities. Active tenders from provincial departments and municipalities.`,
      url: `https://protenders.co.za/etenders/${province}`,
      type: 'website',
      images: [
        {
          url: '/images/og-image.png',
          width: 1200,
          height: 630,
          alt: `${provinceData.name} Government eTenders`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${provinceData.name} eTenders 2025`,
      description: `Find government eTenders in ${provinceData.name}. Search active tenders and set up alerts.`,
      images: ['/images/og-image.png'],
    },
    alternates: {
      canonical: `https://protenders.co.za/etenders/${province}`,
    },
  };
}

/**
 * Provincial eTender Landing Page
 * Targets high-volume keywords: "eastern cape tenders" (1,900 vol), "tenders in kzn" (1,600 vol)
 */
export default async function ProvincialETenderPage({
  params
}: {
  params: Promise<{ province: string }>
}) {
  const { province } = await params;
  const provinceData = getProvinceBySlug(province);

  if (!provinceData) {
    notFound();
  }

  // Generate structured data
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'eTenders', url: '/etenders' },
    { name: `${provinceData.name} eTenders` },
  ]);

  return (
    <div className="min-h-screen bg-background">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: renderStructuredData(breadcrumbSchema),
        }}
      />

      {/* Header */}
      <header className="w-full border-b bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="content-container py-12">
          <Breadcrumbs
            items={[
              { name: 'Home', url: '/' },
              { name: 'eTenders', url: '/etenders' },
              { name: `${provinceData.name} eTenders` },
            ]}
          />

          <div className="mt-6">
            <Badge className="mb-4">Provincial eTenders</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {provinceData.name} eTenders & Government Tender Opportunities
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl">
              Find and bid on government eTenders in {provinceData.name}. Search active procurement opportunities
              from provincial departments, municipalities, and state-owned enterprises.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full py-12">
        <div className="content-container">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Departments</p>
                    <p className="text-2xl font-bold">{provinceData.majorDepartments.length}+</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                    <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">GDP Contribution</p>
                    <p className="text-2xl font-bold">{provinceData.statistics.gdpContribution}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Key Industries</p>
                    <p className="text-2xl font-bold">{provinceData.keyIndustries.length}+</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <Card className="mb-12 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">
                    Search {provinceData.name} eTenders Now
                  </h2>
                  <p className="text-muted-foreground">
                    Access live tender opportunities from {provinceData.name} government departments and municipalities
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button asChild size="lg">
                    <Link href={`/search?province=${provinceData.name}`}>
                      Browse Tenders
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/alerts">Set Up Alerts</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* About Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2 space-y-8">
              {/* Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>About {provinceData.name} Government Procurement</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground leading-relaxed">
                    {provinceData.overview}
                  </p>

                  <h3 className="text-lg font-semibold mt-6 mb-3">Finding {provinceData.name} eTenders</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    ProTenders aggregates eTenders from the official government eTender portal and {provinceData.name}
                    provincial departments. Our platform makes it easy to search, filter, and track tender opportunities
                    specific to {provinceData.name}, saving you hours of manual searching across multiple websites.
                  </p>

                  <h3 className="text-lg font-semibold mt-6 mb-3">How to Apply for {provinceData.name} Tenders</h3>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>Search for relevant tenders on ProTenders using category and location filters</li>
                    <li>Review tender requirements, documents, and closing dates carefully</li>
                    <li>Ensure your business is registered on the National Treasury Central Supplier Database</li>
                    <li>Prepare all required documents including company registration, tax clearance, and BEE certificates</li>
                    <li>Submit your bid through the official eTender portal before the closing date</li>
                    <li>Attend mandatory briefing sessions if specified in tender documents</li>
                  </ol>
                </CardContent>
              </Card>

              {/* Tender Insights */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      {provinceData.name} Tender Landscape Insights
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {provinceData.tenderInsights}
                  </p>

                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                    <div className="flex gap-3">
                      <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Pro Tip</p>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          {provinceData.successTip}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Key Industries */}
              <Card>
                <CardHeader>
                  <CardTitle>Key Industries in {provinceData.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {provinceData.keyIndustries.map((industry) => (
                      <Link
                        key={industry}
                        href={`/search?province=${provinceData.name}&keywords=${industry}`}
                        className="group"
                      >
                        <div className="p-3 border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
                          <p className="text-sm font-medium group-hover:text-primary">
                            {industry}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Major Departments */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Major Procurement Departments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {provinceData.majorDepartments.slice(0, 6).map((dept) => (
                      <Link
                        key={dept}
                        href={`/search?province=${provinceData.name}&buyer=${encodeURIComponent(dept)}`}
                        className="block group"
                      >
                        <div className="flex items-start gap-2 p-2 rounded hover:bg-muted transition-colors">
                          <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm group-hover:text-primary">
                            {dept}
                          </span>
                        </div>
                      </Link>
                    ))}
                    {provinceData.majorDepartments.length > 6 && (
                      <Button asChild variant="ghost" size="sm" className="w-full mt-2">
                        <Link href={`/search?province=${provinceData.name}`}>
                          View All Departments
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Links */}
              <Card className="bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button asChild variant="outline" size="sm" className="w-full justify-start">
                    <Link href="/how-it-works">How to Submit eTenders</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="w-full justify-start">
                    <Link href="/blog/how-to-submit-etenders-south-africa-complete-guide-2025">
                      eTender Submission Guide
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="w-full justify-start">
                    <Link href="/faq">eTender FAQs</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="w-full justify-start">
                    <Link href="/alerts">Create Tender Alerts</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Province Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Province Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Capital City</p>
                    <p className="font-semibold">{provinceData.capital}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Population</p>
                    <p className="font-semibold">{provinceData.statistics.population}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Major Cities</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {provinceData.statistics.majorCities.map((city) => (
                        <Badge key={city} variant="secondary" className="text-xs">
                          {city}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Bottom CTA */}
          <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
            <CardContent className="pt-8 pb-8">
              <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold mb-4">
                  Never Miss a {provinceData.name} Tender Opportunity
                </h2>
                <p className="text-primary-foreground/90 mb-6">
                  Set up custom alerts to receive instant notifications when new {provinceData.name} eTenders match your business profile
                </p>
                <div className="flex gap-4 justify-center flex-wrap">
                  <Button asChild size="lg" variant="secondary">
                    <Link href="/alerts">
                      Create Free Alert
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20">
                    <Link href={`/search?province=${provinceData.name}`}>
                      Browse All Tenders
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer Note */}
      <footer className="w-full border-t mt-12">
        <div className="content-container py-6">
          <p className="text-sm text-muted-foreground text-center">
            This page is automatically updated every 6 hours with the latest {provinceData.name} eTender information.
            Last updated: {new Date().toLocaleDateString('en-ZA')}
          </p>
        </div>
      </footer>
    </div>
  );
}
