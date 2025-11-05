"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TenderCard } from "@/components/TenderCard";
import { TrendingUp, Target, ArrowLeft } from "lucide-react";
import type { TenderSearchResponse } from "@/types/tender";
import { searchTenders } from "@/lib/api";

export default function Opportunities() {
  const [tendersData, setTendersData] = useState<TenderSearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOpportunities() {
      try {
        const data = await searchTenders({ status: "active", page: 1, pageSize: 100 });
        setTendersData(data);
      } catch (err) {
        console.error('Failed to fetch tenders:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchOpportunities();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="w-full border-b bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="content-container py-12">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Search
            </Button>
          </Link>

          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Target className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <Badge className="mb-2">Featured Opportunities</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Tender Opportunities in South Africa
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl">
                Explore curated procurement opportunities across all sectors and provinces in South Africa.
              </p>
            </div>
          </div>

          {tendersData && !isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <Card className="p-4 bg-primary/5">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">Active Opportunities</div>
                    <div className="text-2xl font-bold text-primary">{tendersData.total}</div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </header>

      <div className="w-full py-12">
        <div className="content-container">
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
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Opportunities Available</h3>
            <Link href="/">
              <Button>Browse All Tenders</Button>
            </Link>
          </Card>
        )}
        </div>
      </div>
    </div>
  );
}
