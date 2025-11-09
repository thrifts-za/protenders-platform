"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Breadcrumbs from "@/components/Breadcrumbs";
import {
  TrendingUp,
  Target,
  Clock,
  Sparkles,
  MapPin,
  Grid3x3,
  Search,
  Bell,
  Building2,
  FileText,
  Award,
  ArrowRight
} from "lucide-react";

export default function Opportunities() {
  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Opportunities' },
  ];

  const browseOptions = [
    {
      icon: Sparkles,
      title: "Latest Tenders",
      description: "View newly published government tenders from the last 24 hours",
      href: "/latest",
      badge: "Fresh",
      color: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900"
    },
    {
      icon: Clock,
      title: "Closing Soon",
      description: "Urgent opportunities closing within the next 7 days",
      href: "/closing-soon",
      badge: "Urgent",
      color: "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900"
    },
    {
      icon: TrendingUp,
      title: "All Tenders",
      description: "Browse all active government tenders and RFQs",
      href: "/tenders",
      badge: "Popular",
      color: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900"
    },
  ];

  const provinces = [
    { name: "Gauteng", slug: "gauteng", tenders: "2,500+" },
    { name: "Western Cape", slug: "western-cape", tenders: "1,800+" },
    { name: "KwaZulu-Natal", slug: "kwazulu-natal", tenders: "1,500+" },
    { name: "Eastern Cape", slug: "eastern-cape", tenders: "900+" },
    { name: "Limpopo", slug: "limpopo", tenders: "700+" },
    { name: "Mpumalanga", slug: "mpumalanga", tenders: "600+" },
  ];

  const categories = [
    { name: "Construction", href: "/category/construction", icon: Building2 },
    { name: "IT Services", href: "/category/it-services", icon: FileText },
    { name: "Consulting", href: "/category/consulting", icon: Award },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="w-full border-b bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="content-container py-16">
          <Breadcrumbs items={breadcrumbItems} />

          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Target className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <Badge className="mb-2">Discover Government Tenders</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Government Tender Opportunities in South Africa
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl">
                Explore thousands of government procurement opportunities across all sectors, provinces, and categories.
                Find RFQs, RFPs, and contracts that match your business capabilities.
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="w-full py-12">
        <div className="content-container space-y-16">
          {/* Browse Tenders Section */}
          <section>
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Browse Tender Opportunities</h2>
              <p className="text-muted-foreground">
                Find the right procurement opportunities for your business
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {browseOptions.map((option) => (
                <Link key={option.href} href={option.href}>
                  <Card className={`h-full hover:shadow-lg transition-shadow ${option.color}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <option.icon className="h-8 w-8 text-primary" />
                        <Badge variant="secondary">{option.badge}</Badge>
                      </div>
                      <CardTitle>{option.title}</CardTitle>
                      <CardDescription className="text-base">
                        {option.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="ghost" className="w-full justify-between">
                        View Tenders
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>

          {/* By Province Section */}
          <section>
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="h-6 w-6 text-primary" />
                <h2 className="text-3xl font-bold">Tenders by Province</h2>
              </div>
              <p className="text-muted-foreground">
                Browse government tenders by province across South Africa
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {provinces.map((province) => (
                <Link key={province.slug} href={`/province/${province.slug}`}>
                  <Card className="hover:shadow-lg transition-shadow hover:border-primary">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{province.name}</CardTitle>
                        <Badge variant="outline">{province.tenders}</Badge>
                      </div>
                      <CardDescription>
                        View active tenders in {province.name}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="mt-6 text-center">
              <Link href="/provinces">
                <Button variant="outline" size="lg">
                  View All Provinces
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </section>

          {/* By Category Section */}
          <section>
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <Grid3x3 className="h-6 w-6 text-primary" />
                <h2 className="text-3xl font-bold">Tenders by Category</h2>
              </div>
              <p className="text-muted-foreground">
                Find procurement opportunities in your industry sector
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {categories.map((category) => (
                <Link key={category.href} href={category.href}>
                  <Card className="hover:shadow-lg transition-shadow hover:border-primary">
                    <CardHeader>
                      <category.icon className="h-8 w-8 text-primary mb-4" />
                      <CardTitle>{category.name}</CardTitle>
                      <CardDescription>
                        Browse {category.name.toLowerCase()} tenders and RFQs
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="mt-6 text-center">
              <Link href="/categories">
                <Button variant="outline" size="lg">
                  View All Categories
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </section>

          {/* Tools & Resources */}
          <section className="bg-gradient-to-br from-primary/5 to-background rounded-lg p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Search className="h-6 w-6 text-primary" />
                  <h3 className="text-2xl font-bold">Advanced Search</h3>
                </div>
                <p className="text-muted-foreground mb-6">
                  Use our powerful search tools to find tenders by keyword, category, value, province, and closing date. Filter and sort to find the perfect opportunities.
                </p>
                <Link href="/search">
                  <Button size="lg">
                    Search Tenders
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Bell className="h-6 w-6 text-primary" />
                  <h3 className="text-2xl font-bold">Tender Alerts</h3>
                </div>
                <p className="text-muted-foreground mb-6">
                  Never miss an opportunity. Set up custom email alerts for tenders matching your criteria. Get notified instantly when new tenders are published.
                </p>
                <Link href="/alerts">
                  <Button size="lg" variant="outline">
                    Create Alert
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* SEO Content Section */}
          <section className="prose prose-lg max-w-none">
            <h2 className="text-3xl font-bold mb-6">About Government Tender Opportunities in South Africa</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 not-prose">
              <div>
                <h3 className="text-xl font-semibold mb-3">What are Tender Opportunities?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Government tender opportunities are procurement invitations issued by national, provincial, and municipal departments
                  seeking suppliers, contractors, and service providers. These include RFQs (Request for Quotations), RFPs (Request for Proposals),
                  and direct procurement contracts across all sectors.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">Why Use ProTenders?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  ProTenders aggregates tenders from multiple government sources including eTenders Portal, national departments,
                  provincial governments, and municipalities. Our platform provides real-time updates, advanced search filters,
                  and instant email alerts to help your business win more government contracts.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">Popular Tender Categories</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  Browse tenders in high-demand sectors including:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• <Link href="/category/construction" className="text-primary hover:underline">Construction & Infrastructure</Link></li>
                  <li>• <Link href="/category/it-services" className="text-primary hover:underline">IT Services & Technology</Link></li>
                  <li>• <Link href="/category/consulting" className="text-primary hover:underline">Consulting & Professional Services</Link></li>
                  <li>• <Link href="/categories" className="text-primary hover:underline">View All Categories →</Link></li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">Tender Resources</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  Learn how to successfully bid for government tenders:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• <Link href="/how-it-works" className="text-primary hover:underline">How Government Tendering Works</Link></li>
                  <li>• <Link href="/faq" className="text-primary hover:underline">Frequently Asked Questions</Link></li>
                  <li>• <Link href="/glossary" className="text-primary hover:underline">Tender Terminology Glossary</Link></li>
                  <li>• <Link href="/resources" className="text-primary hover:underline">All Resources →</Link></li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
