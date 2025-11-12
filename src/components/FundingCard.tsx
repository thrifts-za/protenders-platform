/**
 * FundingCard Component
 * Phase 3: ProTender Fund Finder
 *
 * Displays a funding opportunity in a card format
 */

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Building2, Tag, DollarSign, MapPin, Target } from "lucide-react";
import { formatRelativeDate } from "@/lib/date";
import { trackFundingView } from "@/lib/analytics";

interface FundingOpportunity {
  id: string;
  slug: string;
  programName: string;
  institution: string;
  fundingType: string;
  categories: string[];
  provinces: string[];
  purpose?: string | null;
  minAmountZAR?: number | null;
  maxAmountZAR?: number | null;
  amountNotes?: string | null;
  fundedIndustries: string[];
  eligibility: string[];
  applyUrl?: string | null;
  source: string;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface FundingCardProps {
  funding: FundingOpportunity;
  matchScore?: number; // Optional match score (0-100) for matched results
  scoreBreakdown?: {
    sector: number;
    province: number;
    fundingType: number;
    amountRange: number;
    eligibility: number;
    purpose: number;
  };
}

/**
 * Format amount range for display
 */
function formatAmountRange(min?: number | null, max?: number | null, notes?: string | null): string {
  if (notes) return notes;

  if (min && max) {
    return `R${min.toLocaleString()} - R${max.toLocaleString()}`;
  } else if (max) {
    return `Up to R${max.toLocaleString()}`;
  } else if (min) {
    return `From R${min.toLocaleString()}`;
  }

  return "Amount varies";
}

/**
 * Get funding type badge color
 */
function getFundingTypeBadgeVariant(type: string): "default" | "secondary" | "destructive" | "outline" {
  switch (type.toLowerCase()) {
    case 'grant':
      return 'default'; // Green/primary
    case 'loan':
      return 'secondary'; // Gray
    case 'equity':
      return 'outline'; // Outlined
    case 'hybrid':
      return 'secondary'; // Gray
    default:
      return 'secondary';
  }
}

export function FundingCard({ funding, matchScore, scoreBreakdown }: FundingCardProps) {
  const fundingUrl = `/funding/${funding.slug}`;

  // Show match score color coding
  const getMatchScoreColor = (score: number) => {
    if (score >= 75) return "text-green-600 bg-green-50";
    if (score >= 50) return "text-orange-600 bg-orange-50";
    return "text-blue-600 bg-blue-50";
  };

  return (
    <Link
      href={fundingUrl}
      onClick={() => trackFundingView(funding.id, funding.programName, funding.institution, 'search_results')}
    >
      <Card className={`p-6 hover:shadow-lg transition-shadow cursor-pointer mb-3 ${
        matchScore && matchScore >= 75 ? "border-green-200" :
        matchScore && matchScore >= 50 ? "border-orange-200" : ""
      }`}>
        <div className="space-y-3">
          {/* Header with title and match score */}
          <div className="flex items-start justify-between gap-4">
            <h3 className="font-semibold text-lg text-card-foreground line-clamp-2">
              {funding.programName}
            </h3>
            <div className="flex items-center gap-2 flex-shrink-0">
              {matchScore !== undefined && (
                <Badge className={`text-sm font-semibold ${getMatchScoreColor(matchScore)}`}>
                  {matchScore}% Match
                </Badge>
              )}
              <Badge variant={getFundingTypeBadgeVariant(funding.fundingType)}>
                {funding.fundingType}
              </Badge>
            </div>
          </div>

          {/* Purpose/Description */}
          {funding.purpose && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {funding.purpose}
            </p>
          )}

          {/* Institution and Amount */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Building2 className="h-3 w-3" />
              <span>{funding.institution}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <DollarSign className="h-3 w-3" />
              <span>{formatAmountRange(funding.minAmountZAR, funding.maxAmountZAR, funding.amountNotes)}</span>
            </div>
          </div>

          {/* Categories */}
          {funding.categories && funding.categories.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {funding.categories.slice(0, 3).map((category, idx) => (
                <Badge key={`${category}-${idx}`} variant="secondary" className="text-xs font-normal">
                  <Tag className="h-3 w-3 mr-1" />
                  {category}
                </Badge>
              ))}
              {funding.categories.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{funding.categories.length - 3} more
                </Badge>
              )}
            </div>
          )}

          {/* Provinces */}
          {funding.provinces && funding.provinces.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>
                {funding.provinces.length === 9
                  ? "All Provinces"
                  : funding.provinces.slice(0, 2).join(", ") + (funding.provinces.length > 2 ? ` +${funding.provinces.length - 2}` : "")
                }
              </span>
            </div>
          )}

          {/* Match Score Breakdown (if available) */}
          {scoreBreakdown && matchScore && matchScore >= 50 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <div className="text-xs text-muted-foreground font-medium">Strong matches:</div>
              {scoreBreakdown.sector === 20 && (
                <Badge variant="outline" className="text-xs">
                  <Target className="h-3 w-3 mr-1" />
                  Sector
                </Badge>
              )}
              {scoreBreakdown.province === 15 && (
                <Badge variant="outline" className="text-xs">
                  <MapPin className="h-3 w-3 mr-1" />
                  Location
                </Badge>
              )}
              {scoreBreakdown.amountRange === 20 && (
                <Badge variant="outline" className="text-xs">
                  <DollarSign className="h-3 w-3 mr-1" />
                  Amount
                </Badge>
              )}
              {scoreBreakdown.fundingType === 15 && (
                <Badge variant="outline" className="text-xs">
                  Type
                </Badge>
              )}
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Source: {funding.source.toUpperCase()}</span>
            <span className="opacity-60">•</span>
            <span suppressHydrationWarning>Updated {formatRelativeDate(funding.updatedAt)}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
