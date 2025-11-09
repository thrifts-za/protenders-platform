"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { searchTenders } from "@/lib/api";
import type { TenderSearchResponse } from "@/types/tender";
import { TenderCard } from "@/components/TenderCard";

export default function HomePage() {
  const provinces = [
    { name: "Gauteng", slug: "gauteng" },
    { name: "Western Cape", slug: "western-cape" },
    { name: "KwaZulu-Natal", slug: "kwazulu-natal" },
    { name: "Eastern Cape", slug: "eastern-cape" },
    { name: "Limpopo", slug: "limpopo" },
    { name: "Mpumalanga", slug: "mpumalanga" },
    { name: "North West", slug: "north-west" },
    { name: "Free State", slug: "free-state" },
    { name: "Northern Cape", slug: "northern-cape" },
  ];

  const [recent, setRecent] = useState<TenderSearchResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await searchTenders({ page: 1, pageSize: 6, sort: "latest" });
        if (!cancelled) setRecent(res);
      } catch {
        if (!cancelled) setRecent(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-br from-primary/20 via-primary/10 to-background border-b">
        <div className="content-container py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              South Africa's Premier eTenders & Government Tender Portal
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              Search 10,000+ government tenders, RFQs & RFPs across South
              Africa. AI-powered alerts, BEE opportunities & real-time
              procurement intelligence.
            </p>

            {/* Search Form */}
            <form
              method="GET"
              action="/search"
              className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto"
            >
              <input
                type="text"
                name="keywords"
                placeholder="Search tenders, buyers, or categories..."
                className="flex-1 px-6 py-4 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-lg"
              />
              <button
                type="submit"
                className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors text-lg whitespace-nowrap"
              >
                Search Tenders
              </button>
            </form>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
              <span>Popular searches:</span>
              <Link
                href="/search?keywords=construction"
                className="hover:text-primary transition-colors"
              >
                Construction
              </Link>
              <Link
                href="/search?keywords=IT"
                className="hover:text-primary transition-colors"
              >
                IT Services
              </Link>
              <Link
                href="/search?keywords=consulting"
                className="hover:text-primary transition-colors"
              >
                Consulting
              </Link>
              <Link
                href="/search?keywords=goods"
                className="hover:text-primary transition-colors"
              >
                Goods Supply
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full py-12">
        <div className="content-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="p-6 bg-card rounded-lg border text-center">
            <p className="text-3xl md:text-4xl font-bold text-primary mb-2">
              10,000+
            </p>
            <p className="text-sm text-muted-foreground">Active Tenders</p>
          </div>
          <div className="p-6 bg-card rounded-lg border text-center">
            <p className="text-3xl md:text-4xl font-bold text-primary mb-2">
              9
            </p>
            <p className="text-sm text-muted-foreground">Provinces Covered</p>
          </div>
          <div className="p-6 bg-card rounded-lg border text-center">
            <p className="text-3xl md:text-4xl font-bold text-primary mb-2">
              Daily
            </p>
            <p className="text-sm text-muted-foreground">Updates</p>
          </div>
          <div className="p-6 bg-card rounded-lg border text-center">
            <p className="text-3xl md:text-4xl font-bold text-primary mb-2">
              AI-Powered
            </p>
            <p className="text-sm text-muted-foreground">Alerts</p>
          </div>
        </div>
        </div>
      </section>

      {/* Recent Tenders */}
      <section className="w-full py-12">
        <div className="content-container">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Recently Published Tenders</h2>
          <Link
            href="/search"
            className="text-primary hover:underline font-medium"
          >
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading && (
            <div className="col-span-full text-center text-muted-foreground">Loading recent tenders...</div>
          )}
          {!loading && recent && recent.results.map((tender) => (
            <TenderCard key={tender.ocid} tender={tender} />
          ))}
        </div>
        </div>
      </section>

      {/* eTenders Portal Section */}
      <section className="w-full py-12 bg-primary/5">
        <div className="content-container">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">
              Explore Government eTenders Portal
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find government eTenders across all South African provinces and categories.
              Access procurement opportunities from national departments, municipalities, and state-owned enterprises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Hub Card */}
            <Link href="/etenders">
              <Card className="h-full hover:shadow-lg hover:border-primary transition-all group">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
                    <span className="text-2xl">🏛️</span>
                    eTenders Portal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Browse all government eTenders across South Africa. Search by province, category, and department.
                  </p>
                  <Badge className="bg-primary/10 text-primary">
                    All 9 Provinces
                  </Badge>
                </CardContent>
              </Card>
            </Link>

            {/* Top Provincial eTenders */}
            <Link href="/etenders/gauteng">
              <Card className="h-full hover:shadow-lg hover:border-primary transition-all group">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
                    <span className="text-2xl">🏙️</span>
                    Gauteng eTenders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Find government tenders in Gauteng. Search opportunities from Johannesburg, Pretoria, and surrounding municipalities.
                  </p>
                  <Badge className="bg-green-100 text-green-800">
                    High Volume
                  </Badge>
                </CardContent>
              </Card>
            </Link>

            <Link href="/etenders/kwazulu-natal">
              <Card className="h-full hover:shadow-lg hover:border-primary transition-all group">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
                    <span className="text-2xl">🌊</span>
                    KwaZulu-Natal eTenders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Discover KZN government tenders. Access procurement opportunities from Durban, Pietermaritzburg, and provincial departments.
                  </p>
                  <Badge className="bg-blue-100 text-blue-800">
                    Active Tenders
                  </Badge>
                </CardContent>
              </Card>
            </Link>

            {/* Top Category eTenders */}
            <Link href="/etenders/category/security-services">
              <Card className="h-full hover:shadow-lg hover:border-primary transition-all group">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
                    <span className="text-2xl">🔒</span>
                    Security eTenders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Find security services tenders across South Africa. Guarding, access control, surveillance opportunities.
                  </p>
                  <Badge className="bg-amber-100 text-amber-800">
                    1,900+ Monthly Searches
                  </Badge>
                </CardContent>
              </Card>
            </Link>

            <Link href="/etenders/category/cleaning-services">
              <Card className="h-full hover:shadow-lg hover:border-primary transition-all group">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
                    <span className="text-2xl">🧹</span>
                    Cleaning eTenders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Browse cleaning services tenders nationwide. Office cleaning, sanitation, and hygiene services.
                  </p>
                  <Badge className="bg-purple-100 text-purple-800">
                    1,000+ Monthly Searches
                  </Badge>
                </CardContent>
              </Card>
            </Link>

            <Link href="/etenders/category/construction">
              <Card className="h-full hover:shadow-lg hover:border-primary transition-all group">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
                    <span className="text-2xl">🏗️</span>
                    Construction eTenders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Access construction and infrastructure tenders. Building, roads, civil engineering projects.
                  </p>
                  <Badge className="bg-orange-100 text-orange-800">
                    High Value Projects
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          </div>

          <div className="text-center mt-8">
            <Link
              href="/etenders"
              className="inline-flex items-center gap-2 text-primary hover:underline font-semibold"
            >
              View All Provincial & Category eTenders →
            </Link>
          </div>
        </div>
      </section>

      {/* Browse by Province */}
      <section className="w-full py-12">
        <div className="content-container">
        <h2 className="text-3xl font-bold mb-8 text-center">
          Browse Tenders by Province
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {provinces.map((province) => (
            <Link
              key={province.slug}
              href={`/province/${province.slug}`}
              className="p-6 bg-card rounded-lg border border-border hover:border-primary transition-colors text-center font-semibold hover:shadow-md"
            >
              {province.name}
            </Link>
          ))}
        </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full bg-muted/30 py-16">
        <div className="content-container">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Why Choose ProTenders?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-xl font-bold mb-2">
                Comprehensive Search
              </h3>
              <p className="text-muted-foreground">
                Search 10,000+ tenders across all provinces and categories with
                advanced filters.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔔</span>
              </div>
              <h3 className="text-xl font-bold mb-2">AI-Powered Alerts</h3>
              <p className="text-muted-foreground">
                Get notified instantly when relevant tenders matching your
                criteria are published.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Real-Time Updates</h3>
              <p className="text-muted-foreground">
                Daily synchronization ensures you never miss an opportunity with
                the latest tender data.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-bold mb-2">BEE Opportunities</h3>
              <p className="text-muted-foreground">
                Filter and find tenders with BEE requirements and track your
                compliance progress.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-16">
        <div className="content-container">
        <div className="max-w-3xl mx-auto bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-8 md:p-12 text-center border">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Find Your Next Opportunity?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of businesses winning government contracts across
            South Africa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/search"
              className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Browse All Tenders
            </Link>
            <Link
              href="/alerts"
              className="px-8 py-4 bg-card border border-border rounded-lg font-semibold hover:bg-muted transition-colors"
            >
              Set Up Alerts
            </Link>
          </div>
        </div>
        </div>
      </section>
    </div>
  );
}
