"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TenderCard } from "@/components/TenderCard";
import { Clock, AlertTriangle, Bell, ArrowLeft } from "lucide-react";
import type { Tender, TenderSearchResponse } from "@/types/tender";
import { searchTenders } from "@/lib/api";

export default function ClosingSoon() {
  const [tendersData, setTendersData] = useState<TenderSearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchClosingSoon() {
      try {
        const data = await searchTenders({ closingInDays: 7, page: 1, pageSize: 50, sort: "-closingDate" });
        setTendersData(data);
      } catch (err) {
        console.error('Failed to fetch tenders:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchClosingSoon();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-gradient-to-br from-red-50 via-orange-50 to-background dark:from-red-950/20 dark:via-orange-950/20">
        <div className="container mx-auto px-4 py-12">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Search
            </Button>
          </Link>

          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <Clock className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <Badge className="mb-2 bg-red-600">Urgent</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Tenders Closing Soon in South Africa
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl">
                View government tenders closing in the next 7 days. Don&apos;t miss critical deadlines!
              </p>
            </div>
          </div>

          {tendersData && !isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <Card className="p-4 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div>
                    <div className="text-sm text-muted-foreground">Closing Soon</div>
                    <div className="text-2xl font-bold text-red-600">{tendersData.total}</div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <Alert className="mb-8 border-red-200 bg-red-50 dark:bg-red-950/20">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <span className="font-semibold">Act Fast!</span> These tenders are closing soon. Ensure you have all required documents ready.
          </AlertDescription>
        </Alert>

        {isLoading && (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        )}

        {!isLoading && tendersData && tendersData.results.length > 0 && (
          <div className="space-y-4">
            {tendersData.results.map((tender) => (
              <TenderCard key={tender.ocid} tender={tender} />
            ))}
          </div>
        )}

        {!isLoading && (!tendersData || tendersData.results.length === 0) && (
          <Card className="p-12 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Tenders Closing Soon</h3>
            <p className="text-muted-foreground mb-6">
              No tenders are closing in the next 7 days.
            </p>
            <Link href="/">
              <Button>Browse All Tenders</Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
