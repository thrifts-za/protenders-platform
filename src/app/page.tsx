"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, DollarSign, Building2, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { searchTenders } from "@/lib/api";
import type { TenderSearchResponse } from "@/types/tender";

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
      <section className="bg-gradient-to-br from-primary/20 via-primary/10 to-background border-b">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              South Africa's Premier Government Tender Portal
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
      <section className="container mx-auto px-4 py-12">
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
      </section>

      {/* Recent Tenders */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Recently Published Tenders</h2>
          <Link
            href="/search"
            className="text-primary hover:underline font-medium"
          >
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading && (
            <div className="col-span-full text-center text-muted-foreground">Loading recent tenders...</div>
          )}
          {!loading && recent && recent.results.map((tender) => {
            const title = tender.tender?.title || "Untitled Tender";
            const description = tender.tender?.description || "";
            const buyerName = tender.buyer?.name || "Unknown Buyer";
            const category = tender.tender?.mainProcurementCategory || "General";
            const value = tender.tender?.value?.amount;
            const currency = tender.tender?.value?.currency || "ZAR";
            const closing = tender.tender?.tenderPeriod?.endDate;
            const daysLeft = closing ? Math.ceil((new Date(closing).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
            const isUrgent = daysLeft != null && daysLeft <= 7;

            return (
              <Card key={tender.ocid} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-primary/10 text-primary">{category}</Badge>
                        {tender.tender?.status && (
                          <Badge variant={tender.tender.status === "active" ? "default" : "secondary"} className={tender.tender.status === "active" ? "bg-green-100 text-green-800" : ""}>
                            {tender.tender.status}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg leading-tight mb-2">
                        <Link href={`/tender/${tender.ocid}`} className="hover:text-primary transition-colors">
                          {title}
                        </Link>
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Building2 className="h-4 w-4" />
                        <span>{buyerName}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-xs text-muted-foreground">Value</p>
                        <p className="text-sm font-medium">
                          {value ? new Intl.NumberFormat("en-ZA", { style: "currency", currency, maximumFractionDigits: 0 }).format(value) : "Not specified"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className={`h-4 w-4 ${isUrgent ? 'text-red-500' : 'text-muted-foreground'}`} />
                      <div>
                        <p className="text-xs text-muted-foreground">Closes</p>
                        <p className="text-sm font-medium">{closing ? new Date(closing).toLocaleDateString() : '—'}</p>
                        {daysLeft != null && daysLeft > 0 && (
                          <Badge
                            variant={isUrgent ? "destructive" : "secondary"}
                            className="text-xs mt-1"
                          >
                            {daysLeft} days left
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button asChild className="flex-1">
                      <Link href={`/tender/${tender.ocid}`}>
                        View Details
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm">
                      <Target className="h-4 w-4 mr-1" />
                      AI Insights
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Browse by Province */}
      <section className="container mx-auto px-4 py-12">
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
      </section>

      {/* Features Section */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
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
      <section className="container mx-auto px-4 py-16">
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
      </section>
    </div>
  );
}
