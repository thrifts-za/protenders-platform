import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCategoryBySlug, getAllCategorySlugs } from '@/data/categories';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle, TrendingUp, FileText, ArrowRight, DollarSign } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';
import { generateBreadcrumbSchema, renderStructuredData } from '@/lib/structured-data';
import CategoryTenders from '@/components/CategoryTenders';

// ISR: Revalidate every 6 hours
export const revalidate = 21600;

/**
 * Generate static paths for all category eTender pages
 */
export async function generateStaticParams() {
  const slugs = getAllCategorySlugs();
  // Focus on high-priority categories with research keywords
  const priorityCategories = ['security', 'cleaning', 'construction', 'it-services', 'consulting', 'healthcare'];
  return slugs
    .filter(slug => priorityCategories.includes(slug))
    .map((category) => ({ category }));
}

/**
 * Generate metadata for category eTender pages
 * Targeting: "security tenders" (1,900 vol), "cleaning tenders" (1,000 vol), etc.
 */
export async function generateMetadata({
  params
}: {
  params: Promise<{ category: string }>
}): Promise<Metadata> {
  const { category } = await params;
  const categoryData = getCategoryBySlug(category);

  if (!categoryData) {
    return {
      title: 'Category Not Found | ProTenders',
    };
  }

  // Comprehensive keywords including research data
  const keywords = [
    `${categoryData.name.toLowerCase()} tenders`,
    `${categoryData.name.toLowerCase()} etenders`,
    `etenders ${categoryData.name.toLowerCase()}`,
    `government ${categoryData.name.toLowerCase()} tenders`,
    `${categoryData.name.toLowerCase()} tenders south africa`,
    `${categoryData.name.toLowerCase()} procurement`,
    `${categoryData.name.toLowerCase()} RFQ`,
    `${categoryData.name.toLowerCase()} RFP`,
    `${categoryData.name.toLowerCase()} contracts`,
    `find ${categoryData.name.toLowerCase()} tenders`,
    `${categoryData.name.toLowerCase()} bid opportunities`,
    `${categoryData.name.toLowerCase()} government contracts`,
    ...(categoryData.tenderTypes?.slice(0, 8).map(type =>
      `${type.toLowerCase().split('(')[0].trim()} tenders`
    ) || []),
  ];

  return {
    title: `${categoryData.name} eTenders South Africa | Government ${categoryData.name} Tenders 2025`,
    description: `Find ${categoryData.name.toLowerCase()} eTenders and government procurement opportunities in South Africa. Search active ${categoryData.name.toLowerCase()} tenders, RFQs & RFPs. Free tender alerts.`,
    keywords: keywords.join(', '),
    openGraph: {
      title: `${categoryData.name} eTenders South Africa 2025`,
      description: `Search ${categoryData.name.toLowerCase()} eTenders and government procurement opportunities across South Africa.`,
      url: `https://protenders.co.za/etenders/category/${category}`,
      type: 'website',
      images: [
        {
          url: '/images/og-image.png',
          width: 1200,
          height: 630,
          alt: `${categoryData.name} Government eTenders`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${categoryData.name} eTenders South Africa`,
      description: `Find ${categoryData.name.toLowerCase()} government tenders and procurement opportunities.`,
      images: ['/images/og-image.png'],
    },
    alternates: {
      canonical: `https://protenders.co.za/etenders/category/${category}`,
    },
  };
}

/**
 * Category eTender Landing Page
 * Targeting: "security tenders" (1,900 vol), "cleaning tenders" (1,000 vol)
 */
export default async function CategoryETenderPage({
  params
}: {
  params: Promise<{ category: string }>
}) {
  const { category } = await params;
  const categoryData = getCategoryBySlug(category);

  if (!categoryData) {
    notFound();
  }

  // Generate structured data
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'eTenders', url: '/etenders' },
    { name: `${categoryData.name} eTenders` },
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
              { name: `${categoryData.name} eTenders` },
            ]}
          />

          <div className="mt-6">
            <Badge className="mb-4">{categoryData.name} eTenders</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {categoryData.name} eTenders & Government Procurement Opportunities
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl">
              Find and bid on government {categoryData.name.toLowerCase()} eTenders across South Africa.
              Search active procurement opportunities from national departments, provincial governments, and municipalities.
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
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tender Types</p>
                    <p className="text-2xl font-bold">{categoryData.tenderTypes.length}+</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Typical Value</p>
                    <p className="text-lg font-bold line-clamp-1">{categoryData.averageValues.split('-')[0]}</p>
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
                    <p className="text-sm text-muted-foreground">Common Buyers</p>
                    <p className="text-2xl font-bold">{categoryData.commonBuyers.length}+</p>
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
                    Search {categoryData.name} eTenders Now
                  </h2>
                  <p className="text-muted-foreground">
                    Access live {categoryData.name.toLowerCase()} tender opportunities from government departments across South Africa
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button asChild size="lg">
                    <Link href={`/search?categories=${categoryData.id}`}>
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

          {/* Current Tenders - Real Data */}
          <div className="mb-12">
            <CategoryTenders categoryId={categoryData.id} categoryName={categoryData.name} limit={6} />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2 space-y-8">
              {/* Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>About {categoryData.name} eTenders in South Africa</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground leading-relaxed">
                    {categoryData.overview}
                  </p>

                  <h3 className="text-lg font-semibold mt-6 mb-3">Finding {categoryData.name} eTenders</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    ProTenders aggregates {categoryData.name.toLowerCase()} eTenders from the National Treasury eTender portal,
                    provincial governments, and municipal procurement systems. Our platform makes it easy to search and filter
                    opportunities specific to {categoryData.name.toLowerCase()}, saving you hours of manual searching.
                  </p>

                  <h3 className="text-lg font-semibold mt-6 mb-3">How to Apply for {categoryData.name} Tenders</h3>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>Search for relevant {categoryData.name.toLowerCase()} tenders using filters</li>
                    <li>Review tender requirements, specifications, and closing dates</li>
                    <li>Ensure you meet all qualification criteria and have required certifications</li>
                    <li>Register on the National Treasury Central Supplier Database if not already registered</li>
                    <li>Prepare comprehensive bid documentation including pricing and methodology</li>
                    <li>Submit your bid through the official eTender portal before the deadline</li>
                    <li>Attend mandatory briefing sessions if specified</li>
                  </ol>
                </CardContent>
              </Card>

              {/* Tender Types */}
              <Card>
                <CardHeader>
                  <CardTitle>Types of {categoryData.name} Tenders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {categoryData.tenderTypes.map((type) => (
                      <div key={type} className="flex items-start gap-2 p-3 border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{type}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Requirements */}
              <Card>
                <CardHeader>
                  <CardTitle>{categoryData.requirements.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {categoryData.requirements.items.map((item) => (
                      <div key={item} className="flex items-start gap-3 p-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Key Considerations */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-blue-600" />
                      Key Considerations for {categoryData.name} Bidding
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {categoryData.keyConsiderations.map((consideration) => (
                      <li key={consideration} className="flex items-start gap-3 text-sm text-muted-foreground">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>{consideration}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Success Tips */}
              <Card className="bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-lg">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Success Tips
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {categoryData.successTips.map((tip, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </span>
                        <p className="text-sm text-muted-foreground">{tip}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Common Buyers */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Common Procurement Entities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {categoryData.commonBuyers.slice(0, 8).map((buyer) => (
                      <Link
                        key={buyer}
                        href={`/search?categories=${categoryData.id}&buyer=${encodeURIComponent(buyer)}`}
                        className="block group"
                      >
                        <div className="flex items-start gap-2 p-2 rounded hover:bg-muted transition-colors">
                          <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm group-hover:text-primary">
                            {buyer}
                          </span>
                        </div>
                      </Link>
                    ))}
                    {categoryData.commonBuyers.length > 8 && (
                      <Button asChild variant="ghost" size="sm" className="w-full mt-2">
                        <Link href={`/search?categories=${categoryData.id}`}>
                          View All Buyers
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Links */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Resources</CardTitle>
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
                    <Link href="/faq">Tender FAQs</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="w-full justify-start">
                    <Link href="/alerts">Create Tender Alerts</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Value Range */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Typical Tender Values</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {categoryData.name} tenders typically range from:
                  </p>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-semibold text-lg">{categoryData.averageValues}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Values vary based on project scope, duration, and requirements
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Related Category eTenders */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Explore Other Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { name: 'Security', slug: 'security-services', icon: '🔒' },
                { name: 'Cleaning', slug: 'cleaning-services', icon: '🧹' },
                { name: 'Construction', slug: 'construction', icon: '🏗️' },
                { name: 'IT Services', slug: 'it-services', icon: '💻' },
                { name: 'Consulting', slug: 'consulting', icon: '📊' },
                { name: 'Supply & Delivery', slug: 'supply-and-delivery', icon: '📦' },
              ]
                .filter(cat => cat.slug !== category)
                .slice(0, 5)
                .map((cat) => (
                  <Link key={cat.slug} href={`/etenders/category/${cat.slug}`}>
                    <Card className="h-full hover:shadow-lg hover:border-primary transition-all group">
                      <CardContent className="pt-6 text-center">
                        <div className="text-3xl mb-2">{cat.icon}</div>
                        <h3 className="text-sm font-semibold group-hover:text-primary transition-colors">
                          {cat.name} eTenders
                        </h3>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
            </div>
            <div className="text-center mt-6">
              <Link href="/etenders" className="text-primary hover:underline font-semibold">
                View All Categories →
              </Link>
            </div>
          </div>

          {/* Related Provincial eTenders */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Find {categoryData.name} Tenders by Province</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                { name: 'Gauteng', slug: 'gauteng', icon: '🏙️' },
                { name: 'Western Cape', slug: 'western-cape', icon: '🏔️' },
                { name: 'KwaZulu-Natal', slug: 'kwazulu-natal', icon: '🌊' },
                { name: 'Eastern Cape', slug: 'eastern-cape', icon: '🦁' },
                { name: 'Limpopo', slug: 'limpopo', icon: '🌴' },
                { name: 'Mpumalanga', slug: 'mpumalanga', icon: '🦛' },
                { name: 'North West', slug: 'north-west', icon: '🏞️' },
                { name: 'Free State', slug: 'free-state', icon: '🌾' },
              ].map((prov) => (
                <Link key={prov.slug} href={`/etenders/${prov.slug}`}>
                  <Card className="h-full hover:shadow-lg hover:border-primary transition-all group">
                    <CardContent className="pt-6 text-center">
                      <div className="text-2xl mb-2">{prov.icon}</div>
                      <h3 className="text-sm font-semibold group-hover:text-primary transition-colors">
                        {prov.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {categoryData.name} Tenders
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
            <CardContent className="pt-8 pb-8">
              <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold mb-4">
                  Never Miss a {categoryData.name} Tender Opportunity
                </h2>
                <p className="text-primary-foreground/90 mb-6">
                  Set up custom alerts to receive instant notifications when new {categoryData.name.toLowerCase()} eTenders
                  match your business profile and capabilities
                </p>
                <div className="flex gap-4 justify-center flex-wrap">
                  <Button asChild size="lg" variant="secondary">
                    <Link href="/alerts">
                      Create Free Alert
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20">
                    <Link href={`/search?categories=${categoryData.id}`}>
                      Browse All {categoryData.name} Tenders
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
            This page is automatically updated every 6 hours with the latest {categoryData.name.toLowerCase()} eTender information.
            Last updated: {new Date().toLocaleDateString('en-ZA')}
          </p>
        </div>
      </footer>
    </div>
  );
}
