"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, Building2, Target } from "lucide-react";
import { searchTenders } from "@/lib/api";
import type { TenderSearchResponse } from "@/types/tender";
import { createTenderUrlFromTitleAndDescription } from "@/lib/utils/slug";

interface CategoryTendersProps {
  categoryId: string;
  categoryName: string;
  limit?: number;
}

export default function CategoryTenders({ categoryId, categoryName, limit = 6 }: CategoryTendersProps) {
  const [tenders, setTenders] = useState<TenderSearchResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Map internal category IDs to search keywords
        // Since the database only has generic categories (services, goods, works),
        // we use keyword search to find relevant tenders
        const categoryKeywordMap: Record<string, string> = {
          'cleaning-services': 'cleaning',
          'security-services': 'security',
          'construction': 'construction',
          'it-services': 'IT software hardware technology',
          'consulting': 'consulting advisory',
          'healthcare': 'medical health',
          'catering': 'catering food',
          'transport': 'transport logistics',
        };

        const searchKeyword = categoryKeywordMap[categoryId] || categoryId;

        const res = await searchTenders({
          page: 1,
          pageSize: limit,
          sort: "latest",
          q: searchKeyword, // Use keyword search instead of category filter
        });
        if (!cancelled) setTenders(res);
      } catch (error) {
        console.error('Error fetching category tenders:', error);
        if (!cancelled) setTenders(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [categoryId, limit]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading {categoryName} tenders...</p>
      </div>
    );
  }

  if (!tenders || tenders.results.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent className="pt-6">
          <p className="text-muted-foreground mb-4">
            No active {categoryName.toLowerCase()} tenders found at the moment.
          </p>
          <Button asChild>
            <Link href="/search">
              Browse All Tenders
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Current {categoryName} Tenders</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Showing {tenders.results.length} of {tenders.total} active tenders
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/search?categories=${categoryId}`}>
            View All {tenders.total} Tenders →
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tenders.results.map((tender) => {
          const title = tender.tender?.title || "Untitled Tender";
          const description = tender.tender?.description || "";
          const buyerName = tender.buyer?.name || "Unknown Buyer";
          const category = tender.tender?.mainProcurementCategory || "General";
          const value = tender.tender?.value?.amount;
          const currency = tender.tender?.value?.currency || "ZAR";
          const closing = tender.tender?.tenderPeriod?.endDate;
          const daysLeft = closing
            ? Math.ceil(
                (new Date(closing).getTime() - new Date().getTime()) /
                  (1000 * 60 * 60 * 24)
              )
            : null;
          const isUrgent = daysLeft != null && daysLeft <= 7;

          return (
            <Card
              key={tender.ocid}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-primary/10 text-primary">
                        {category}
                      </Badge>
                      {tender.tender?.status && (
                        <Badge
                          variant={
                            tender.tender.status === "active"
                              ? "default"
                              : "secondary"
                          }
                          className={
                            tender.tender.status === "active"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : ""
                          }
                        >
                          {tender.tender.status}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg leading-tight mb-2">
                      <Link
                        href={createTenderUrlFromTitleAndDescription(title, description, tender.ocid)}
                        className="hover:text-primary transition-colors"
                      >
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
                        {value
                          ? new Intl.NumberFormat("en-ZA", {
                              style: "currency",
                              currency,
                              maximumFractionDigits: 0,
                            }).format(value)
                          : "Not specified"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar
                      className={`h-4 w-4 ${
                        isUrgent ? "text-red-500" : "text-muted-foreground"
                      }`}
                    />
                    <div>
                      <p className="text-xs text-muted-foreground">Closes</p>
                      <p className="text-sm font-medium">
                        {closing
                          ? new Date(closing).toLocaleDateString()
                          : "—"}
                      </p>
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
                    <Link href={createTenderUrlFromTitleAndDescription(title, description, tender.ocid)}>
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
    </div>
  );
}
