import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Target, Bell, Search, TrendingUp, Users, Shield, Zap, Award } from "lucide-react";

export const metadata: Metadata = {
  title: 'About ProTenders | South Africa\'s Premier Tender Intelligence Platform',
  description: 'Learn about ProTenders, the leading tender intelligence platform helping South African businesses discover and win government procurement opportunities. Our mission, values, and services.',
  keywords: 'about protenders, tender platform south africa, government procurement, tender intelligence, business opportunities, smme support',
};

export default function AboutPage() {
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "About" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Breadcrumbs items={breadcrumbItems} />
      {/* Hero Section */}
      <header className="w-full border-b bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="content-container py-16">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4">About Us</Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              South Africa's Premier eTenders & Government Tender Intelligence Platform
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Empowering businesses to discover and win government procurement opportunities across South Africa.
              We make tender discovery simple, accessible, and effective for businesses of all sizes.
            </p>
          </div>
        </div>
      </header>

      <main className="w-full py-12">
        <div className="content-container">
          {/* Mission Section */}
          <div className="max-w-4xl mx-auto mb-16">
            <Card className="bg-gradient-to-br from-primary/5 to-background">
              <CardContent className="pt-8 pb-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    To democratize access to government procurement opportunities by providing businesses
                    across South Africa with the tools, intelligence, and insights they need to compete
                    fairly and win tenders. We believe that every business, regardless of size, should have
                    equal opportunity to participate in public sector procurement.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* What We Do */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">What We Do</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                ProTenders aggregates and organizes government tender information from across South Africa,
                making it easy to find, track, and respond to relevant opportunities.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                    <Search className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Comprehensive Search</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Search 10,000+ government tenders from the National Treasury eTender portal, provincial
                    departments, municipalities, and state-owned enterprises.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-3">
                    <Bell className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-lg">AI-Powered Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Never miss an opportunity. Set up custom alerts and receive instant notifications when
                    tenders matching your business criteria are published.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-3">
                    <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-lg">Smart Filtering</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Filter by province, category, value, closing date, and more. Find exactly the tenders
                    that match your business capabilities.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center mb-3">
                    <TrendingUp className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <CardTitle className="text-lg">Real-Time Updates</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Our platform synchronizes daily with government sources to ensure you always have access
                    to the latest tender opportunities.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Our Values */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Our Values</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                The principles that guide everything we do at ProTenders.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Accessibility for All</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    We believe tender information should be accessible to all businesses, from SMMEs to large
                    enterprises. Our platform is designed to level the playing field.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-3">
                    <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle>Transparency & Trust</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    We provide accurate, up-to-date information sourced directly from official government
                    channels. No hidden fees, no misleading information.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-3">
                    <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle>Innovation & Excellence</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    We continuously improve our platform with AI-powered insights, better search capabilities,
                    and user-friendly features to serve you better.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Coverage */}
          <div className="mb-16">
            <Card className="bg-gradient-to-br from-primary/5 to-background">
              <CardContent className="pt-8 pb-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-4">Nationwide Coverage</h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    ProTenders covers government tenders from all levels of government across South Africa.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">9</div>
                    <p className="font-semibold mb-1">Provinces</p>
                    <p className="text-sm text-muted-foreground">
                      Complete coverage of all South African provinces
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">100+</div>
                    <p className="font-semibold mb-1">Government Departments</p>
                    <p className="text-sm text-muted-foreground">
                      National, provincial, and municipal entities
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">10,000+</div>
                    <p className="font-semibold mb-1">Active Tenders</p>
                    <p className="text-sm text-muted-foreground">
                      Updated daily from official sources
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Who We Serve */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Who We Serve</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                ProTenders is designed for businesses of all sizes looking to participate in government procurement.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Small & Medium Enterprises</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Access the same tender information as large corporations. Our platform helps SMMEs discover
                    opportunities that match their capacity and grow through government contracts.
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex gap-2">
                      <Award className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>B-BBEE level filtering</span>
                    </li>
                    <li className="flex gap-2">
                      <Award className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>Local supplier preferences</span>
                    </li>
                    <li className="flex gap-2">
                      <Award className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>SMME set-aside opportunities</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Large Enterprises & Corporations</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Stay ahead of the competition with comprehensive tender intelligence. Track opportunities
                    across multiple provinces and categories efficiently.
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex gap-2">
                      <Award className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>Multi-category tracking</span>
                    </li>
                    <li className="flex gap-2">
                      <Award className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>High-value tender alerts</span>
                    </li>
                    <li className="flex gap-2">
                      <Award className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>Bulk opportunity analysis</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* CTA Section */}
          <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
            <CardContent className="pt-8 pb-8">
              <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold mb-4">
                  Start Finding Tender Opportunities Today
                </h2>
                <p className="text-primary-foreground/90 mb-6">
                  Join thousands of South African businesses using ProTenders to discover and win
                  government procurement opportunities.
                </p>
                <div className="flex gap-4 justify-center flex-wrap">
                  <Button asChild size="lg" variant="secondary">
                    <Link href="/search">
                      Search Tenders
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20">
                    <Link href="/alerts">
                      Set Up Alerts
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
