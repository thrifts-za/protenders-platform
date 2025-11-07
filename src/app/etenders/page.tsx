import { Metadata } from 'next';
import Link from 'next/link';
import { provinces } from '@/data/provinces';
import { categories } from '@/data/categories';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, ArrowRight, Building2, FileText, Search, Briefcase } from 'lucide-react';

export const metadata: Metadata = {
  title: 'eTenders South Africa | Find Government Tenders by Province 2025',
  description: 'Search government eTenders across all 9 South African provinces. Find active procurement opportunities from provincial departments, municipalities, and state-owned enterprises. Free tender alerts.',
  keywords: [
    'etenders south africa',
    'government etenders',
    'etender portal',
    'south africa tenders',
    'provincial etenders',
    'government tenders by province',
    'find etenders',
    'etenders gov za',
    'tender opportunities south africa',
    'procurement opportunities',
  ].join(', '),
  openGraph: {
    title: 'eTenders South Africa | Find Government Tenders by Province',
    description: 'Search government eTenders across all South African provinces. Active tenders from provincial departments and municipalities.',
    url: 'https://protenders.co.za/etenders',
    type: 'website',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'South Africa Government eTenders',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'eTenders South Africa | Provincial Government Tenders',
    description: 'Find government eTenders across all 9 South African provinces. Search and set up alerts.',
    images: ['/images/og-image.png'],
  },
  alternates: {
    canonical: 'https://protenders.co.za/etenders',
  },
};

export default function ETendersHubPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="w-full border-b bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="content-container py-16">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4">Government eTenders Portal</Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find Government eTenders Across South Africa
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Search 10,000+ government eTenders and procurement opportunities across all 9 provinces.
              Get instant alerts for tenders matching your business profile.
            </p>

            {/* Search CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/search">
                  <Search className="mr-2 h-5 w-5" />
                  Search All eTenders
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/alerts">Set Up Free Alerts</Link>
              </Button>
            </div>
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
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-3xl font-bold mb-1">9</p>
                  <p className="text-sm text-muted-foreground">Provinces Covered</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-3">
                    <Building2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-3xl font-bold mb-1">100+</p>
                  <p className="text-sm text-muted-foreground">Government Departments</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-3">
                    <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-3xl font-bold mb-1">10,000+</p>
                  <p className="text-sm text-muted-foreground">Active Tenders</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Provincial eTenders */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Browse eTenders by Province</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Select your province to view active government tenders, procurement opportunities,
                and supplier requirements specific to that region.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {provinces.map((province) => (
                <Link key={province.id} href={`/etenders/${province.slug}`}>
                  <Card className="h-full hover:shadow-lg hover:border-primary transition-all group">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="group-hover:text-primary transition-colors">
                          {province.name}
                        </span>
                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {province.description.split('.')[0]}.
                        </p>

                        <div className="flex items-center gap-2 text-sm">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {province.majorDepartments.length}+ Departments
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Capital: {province.capital}
                          </span>
                        </div>

                        <div className="pt-2">
                          <p className="text-xs font-semibold text-muted-foreground mb-2">
                            Key Industries:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {province.keyIndustries.slice(0, 3).map((industry) => (
                              <Badge key={industry} variant="secondary" className="text-xs">
                                {industry}
                              </Badge>
                            ))}
                            {province.keyIndustries.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{province.keyIndustries.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Category eTenders */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Browse eTenders by Category</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Find government tenders in your industry. Filter by business sector to discover relevant
                procurement opportunities.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {[
                { name: 'Security', slug: 'security-services', volume: '1,900+ monthly searches', icon: '🔒' },
                { name: 'Cleaning', slug: 'cleaning-services', volume: '1,000+ monthly searches', icon: '🧹' },
                { name: 'Construction', slug: 'construction', volume: '590+ monthly searches', icon: '🏗️' },
                { name: 'IT Services', slug: 'it-services', volume: 'High demand', icon: '💻' },
                { name: 'Consulting', slug: 'consulting', volume: 'Professional services', icon: '📊' },
                { name: 'Supply & Delivery', slug: 'supply-and-delivery', volume: 'Goods & equipment', icon: '📦' },
              ].map((category) => (
                <Link key={category.slug} href={`/etenders/category/${category.slug}`}>
                  <Card className="h-full hover:shadow-lg hover:border-primary transition-all group">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-4xl mb-3">{category.icon}</div>
                        <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                          {category.name} eTenders
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {category.volume}
                        </p>
                        <Button variant="ghost" size="sm" className="w-full">
                          View {category.name} Tenders
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-all" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* About Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <Card>
              <CardHeader>
                <CardTitle>What are eTenders?</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  eTenders are electronic tenders issued by South African government departments, municipalities,
                  and state-owned enterprises through the official National Treasury eTender portal. These procurement
                  opportunities allow businesses of all sizes to bid on government contracts for goods, services, and works.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  ProTenders aggregates eTenders from across all provinces and departments, making it easy to search,
                  filter, and track opportunities relevant to your business without having to visit multiple websites daily.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How to Find eTenders</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3 text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                      1
                    </span>
                    <span>Select your province above or use our advanced search to filter by category, value, and closing date</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                      2
                    </span>
                    <span>Review tender requirements, documents, and submission guidelines carefully</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                      3
                    </span>
                    <span>Set up free tender alerts to receive notifications for new opportunities matching your criteria</span>
                  </li>
                </ol>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
            <CardContent className="pt-8 pb-8">
              <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold mb-4">
                  Start Finding eTender Opportunities Today
                </h2>
                <p className="text-primary-foreground/90 mb-6">
                  Join thousands of businesses using ProTenders to discover government procurement opportunities
                  across South Africa
                </p>
                <div className="flex gap-4 justify-center flex-wrap">
                  <Button asChild size="lg" variant="secondary">
                    <Link href="/search">
                      Search All eTenders
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20">
                    <Link href="/alerts">
                      Create Free Alert
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
            Updated daily with new eTenders from the National Treasury eTender portal and provincial departments.
            Last updated: {new Date().toLocaleDateString('en-ZA')}
          </p>
        </div>
      </footer>
    </div>
  );
}
