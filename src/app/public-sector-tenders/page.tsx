"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TenderCard } from "@/components/TenderCard";
import { Building2, ShieldCheck, ArrowLeft } from "lucide-react";
import type { TenderSearchResponse } from "@/types/tender";
import { searchTenders } from "@/lib/api";

export default function PublicSectorTenders() {
  const [tendersData, setTendersData] = useState<TenderSearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPublicSector() {
      try {
        const data = await searchTenders({ page: 1, pageSize: 100, sort: "latest" });
        setTendersData(data);
      } catch (err) {
        console.error('Failed to fetch tenders:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPublicSector();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-gradient-to-br from-blue-50 via-background to-background dark:from-blue-950/20">
        <div className="container mx-auto px-4 py-12">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Search
            </Button>
          </Link>

          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <Badge className="mb-2 bg-blue-600">Government</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Public Sector Tenders South Africa
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl">
                Browse government tenders from national departments, provinces, and municipalities across South Africa.
              </p>
            </div>
          </div>

          {tendersData && !isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="text-sm text-muted-foreground">Public Sector Tenders</div>
                    <div className="text-2xl font-bold text-blue-600">{tendersData.total}</div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
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
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Public Sector Tenders</h3>
            <Link href="/">
              <Button>Browse All Tenders</Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
