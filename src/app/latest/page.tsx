"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TenderCard } from "@/components/TenderCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Sparkles, Info, Bell, TrendingUp, ArrowLeft } from "lucide-react";
import type { Tender, TenderSearchResponse } from "@/types/tender";
import { searchTenders } from "@/lib/api";

export default function LatestTenders() {
  const [tendersData, setTendersData] = useState<TenderSearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLatestTenders() {
      try {
        // Fetch tenders published in the last 24 hours
        const publishedSince = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const data = await searchTenders({ publishedSince, page: 1, pageSize: 100, sort: "latest" });
        setTendersData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    fetchLatestTenders();
  }, []);

  // Group by category for better organization
  const categorizedTenders: Record<string, Tender[]> = {};
  if (tendersData?.results) {
    tendersData.results.forEach((tender) => {
      const category = tender.tender?.mainProcurementCategory || "Other";
      if (!categorizedTenders[category]) {
        categorizedTenders[category] = [];
      }
      categorizedTenders[category].push(tender);
    });
  }

  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Latest Tenders' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="w-full border-b bg-gradient-to-br from-primary/10 via-blue-50 to-background dark:from-primary/20 dark:via-blue-950/20">
        <div className="content-container py-12">
          <Breadcrumbs items={breadcrumbItems} />

          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <Badge className="mb-2">Fresh Opportunities</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Latest Government Tenders in South Africa
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl">
                View the newest government tenders published in the last 24
                hours. Be the first to spot fresh RFQs, RFPs & procurement
                opportunities.
              </p>
            </div>
          </div>

          {/* Stats */}
          {tendersData && !isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <Card className="p-4 bg-primary/5">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">
                      New Today
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {tendersData.total}
                    </div>
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Categories
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {Object.keys(categorizedTenders).length}
                    </div>
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Last Updated
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      {new Date().toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </header>

      <div className="w-full py-12">
        <div className="content-container">
        {/* Live Update Banner */}
        <Alert className="mb-8 border-primary/20 bg-primary/5">
          <Info className="h-4 w-4 text-primary" />
          <AlertDescription>
            <span className="font-semibold">Live Updates:</span> This page
            shows tenders published in the last 24 hours. Check back regularly
            or{" "}
            <Link href="/alerts" className="underline font-semibold">
              set up alerts
            </Link>{" "}
            to get notified instantly when new tenders are published.
          </AlertDescription>
        </Alert>

        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertDescription>
              Failed to load tenders: {error}. Please try again later.
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && tendersData && tendersData.results.length === 0 && (
          <Card className="p-12 text-center">
            <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              No New Tenders in the Last 24 Hours
            </h3>
            <p className="text-muted-foreground mb-6">
              No tenders were published today yet. Check back later or browse
              recent tenders from the past week.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/">
                <Button>Browse All Tenders</Button>
              </Link>
              <Link href="/alerts">
                <Button variant="outline">
                  <Bell className="h-4 w-4 mr-2" />
                  Create Alert
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Tenders List */}
        {!isLoading && tendersData && tendersData.results.length > 0 && (
          <div className="space-y-12">
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">
                    All New Tenders (Last 24 Hours)
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {tendersData.total} new opportunities published today
                  </p>
                </div>
                <Badge variant="secondary" className="text-sm">
                  <span className="relative flex h-2 w-2 mr-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  Live
                </Badge>
              </div>
              <div className="space-y-4">
                {tendersData.results.map((tender) => (
                  <TenderCard key={tender.ocid} tender={tender} />
                ))}
              </div>
            </section>
          </div>
        )}

        {/* CTA Section */}
        <Card className="mt-12 p-8 bg-gradient-to-br from-primary/10 to-background text-center">
          <Bell className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h3 className="text-2xl font-bold mb-2">
            Be the First to Know About New Tenders
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Don&apos;t manually check for new tenders every day. Set up custom
            alerts and get instant email notifications when tenders matching
            your criteria are published. Be ahead of the competition!
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/alerts">
              <Button size="lg">
                <Bell className="h-4 w-4 mr-2" />
                Create Tender Alert
              </Button>
            </Link>
            <Link href="/closing-soon">
              <Button size="lg" variant="outline">
                View Closing Soon
              </Button>
            </Link>
          </div>
        </Card>
        </div>
      </div>
    </div>
  );
}
