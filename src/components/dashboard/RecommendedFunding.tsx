/**
 * Recommended Funding Component
 * Phase 3: ProTender Fund Finder
 *
 * Displays recommended funding opportunities for the user
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, DollarSign, Target, TrendingUp, ExternalLink } from "lucide-react";
import { trackFundingView, trackButtonClick } from "@/lib/analytics";

interface FundingOpportunity {
  id: string;
  slug: string;
  programName: string;
  institution: string;
  fundingType: string;
  categories: string[];
  minAmountZAR?: number | null;
  maxAmountZAR?: number | null;
  purpose?: string | null;
}

export function RecommendedFunding() {
  const [funding, setFunding] = useState<FundingOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRecommendedFunding() {
      try {
        // Fetch top funding opportunities (for now, just get latest)
        // In Phase 4, this can use user profile for personalized recommendations
        const response = await fetch('/api/funding?pageSize=3&sort=latest');
        if (response.ok) {
          const data = await response.json();
          setFunding(data.items);
        }
      } catch (error) {
        console.error('Error fetching recommended funding:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecommendedFunding();
  }, []);

  if (isLoading) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Target className="h-5 w-5" />
          Recommended Funding for You
        </h2>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  if (funding.length === 0) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Target className="h-5 w-5" />
          Recommended Funding for You
        </h2>
        <div className="text-center py-8">
          <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground mb-4">
            No funding recommendations available yet
          </p>
          <Button variant="outline" asChild>
            <Link href="/funding">Browse All Funding</Link>
          </Button>
        </div>
      </Card>
    );
  }

  const formatAmount = (min?: number | null, max?: number | null) => {
    if (max) {
      return `Up to R${max.toLocaleString()}`;
    } else if (min) {
      return `From R${min.toLocaleString()}`;
    }
    return 'Amount varies';
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Target className="h-5 w-5" />
          Recommended Funding for You
        </h2>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/funding">View All</Link>
        </Button>
      </div>

      <div className="space-y-4">
        {funding.map((opp) => (
          <Card key={opp.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <Link
                    href={`/funding/${opp.slug}`}
                    className="font-medium text-base hover:text-primary transition-colors line-clamp-1"
                    onClick={() =>
                      trackFundingView(opp.id, opp.programName, opp.institution, 'dashboard')
                    }
                  >
                    {opp.programName}
                  </Link>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Building2 className="h-3 w-3" />
                    <span>{opp.institution}</span>
                  </div>
                </div>
                <Badge variant={opp.fundingType === 'Grant' ? 'default' : 'secondary'}>
                  {opp.fundingType}
                </Badge>
              </div>

              {/* Details */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <DollarSign className="h-3 w-3" />
                  <span>{formatAmount(opp.minAmountZAR, opp.maxAmountZAR)}</span>
                </div>
                {opp.categories.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {opp.categories[0]}
                  </Badge>
                )}
              </div>

              {/* Purpose */}
              {opp.purpose && (
                <p className="text-sm text-muted-foreground line-clamp-2">{opp.purpose}</p>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" asChild>
                  <Link
                    href={`/funding/${opp.slug}`}
                    onClick={() => trackButtonClick('view_funding_details', 'dashboard')}
                  >
                    View Details
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Browse More */}
      <div className="mt-4 pt-4 border-t space-y-2">
        <Button variant="default" className="w-full" asChild>
          <Link href="/funding/match" onClick={() => trackButtonClick('find_funding_match', 'dashboard')}>
            <Target className="h-4 w-4 mr-2" />
            Find Your Perfect Match
          </Link>
        </Button>
        <Button variant="outline" className="w-full" asChild>
          <Link href="/funding" onClick={() => trackButtonClick('browse_all_funding', 'dashboard')}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Browse All Funding
          </Link>
        </Button>
      </div>
    </Card>
  );
}
