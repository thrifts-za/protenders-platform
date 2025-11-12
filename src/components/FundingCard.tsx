/**
 * FundingCard Component
 * Phase 3: ProTender Fund Finder
 *
 * Displays a funding opportunity in a card format
 */

"use client";

import { memo } from "react";
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
  // Enhanced fields for Corporate ESD
  contactPerson?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  website?: string | null;
  applicationMethod?: string | null;
  submissionRequirements?: string[];
  fundingCategory?: string | null;
  parentInstitution?: string | null;
  sector?: string | null;
  deadline?: Date | string | null;
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
 * Get funding type badge color - each type has unique, professional color
 */
function getFundingTypeBadgeColor(type: string): string {
  switch (type.toLowerCase()) {
    case 'grant':
      return 'bg-emerald-100 text-emerald-700 border-emerald-300 font-semibold'; // Green - Free money
    case 'loan':
      return 'bg-blue-100 text-blue-700 border-blue-300 font-semibold'; // Blue - Traditional financing
    case 'equity':
      return 'bg-purple-100 text-purple-700 border-purple-300 font-semibold'; // Purple - Investment/Partnership
    case 'hybrid':
      return 'bg-amber-100 text-amber-700 border-amber-300 font-semibold'; // Amber - Mixed approach
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300 font-semibold'; // Gray - Unknown/Other
  }
}

/**
 * Get category badge color - subtle professional colors
 */
function getCategoryColor(category: string): string {
  const categoryLower = category.toLowerCase();

  // Define color mappings for common categories
  const colorMap: Record<string, string> = {
    // Primary sectors
    'agriculture': 'bg-green-100 text-green-700 border-green-200',
    'manufacturing': 'bg-blue-100 text-blue-700 border-blue-200',
    'technology': 'bg-purple-100 text-purple-700 border-purple-200',
    'tourism': 'bg-cyan-100 text-cyan-700 border-cyan-200',
    'energy': 'bg-amber-100 text-amber-700 border-amber-200',
    'construction': 'bg-orange-100 text-orange-700 border-orange-200',
    'retail': 'bg-pink-100 text-pink-700 border-pink-200',
    'healthcare': 'bg-red-100 text-red-700 border-red-200',
    'education': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'transport': 'bg-blue-100 text-blue-700 border-blue-200',
    'logistics': 'bg-orange-100 text-orange-700 border-orange-200',
    'finance': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'mining': 'bg-amber-100 text-amber-700 border-amber-200',
    'creative': 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
    'skills development': 'bg-violet-100 text-violet-700 border-violet-200',
    'export': 'bg-teal-100 text-teal-700 border-teal-200',
    'innovation': 'bg-sky-100 text-sky-700 border-sky-200',
    'sme': 'bg-lime-100 text-lime-700 border-lime-200',
    'startup': 'bg-rose-100 text-rose-700 border-rose-200',
    'women': 'bg-pink-100 text-pink-700 border-pink-200',
    'youth': 'bg-cyan-100 text-cyan-700 border-cyan-200',
    'rural': 'bg-green-100 text-green-700 border-green-200',
    'supply chain': 'bg-orange-100 text-orange-700 border-orange-200',
    'ict': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'business': 'bg-sky-100 text-sky-700 border-sky-200',
    'development': 'bg-teal-100 text-teal-700 border-teal-200',
  };

  // Check for exact match first
  if (colorMap[categoryLower]) {
    return colorMap[categoryLower];
  }

  // Check for partial matches
  for (const [key, color] of Object.entries(colorMap)) {
    if (categoryLower.includes(key) || key.includes(categoryLower)) {
      return color;
    }
  }

  // Default color if no match - changed from gray to sky blue
  return 'bg-sky-100 text-sky-700 border-sky-200';
}

/**
 * Get card background color based on primary category - very subtle tints
 */
function getCardBackgroundColor(categories: string[]): string {
  if (!categories || categories.length === 0) {
    return 'bg-card';
  }

  const primaryCategory = categories[0].toLowerCase();

  // Very subtle background tints (50 shade for ultra-subtle effect)
  const backgroundMap: Record<string, string> = {
    'agriculture': 'bg-green-50/30',
    'manufacturing': 'bg-blue-50/30',
    'technology': 'bg-purple-50/30',
    'tourism': 'bg-cyan-50/30',
    'energy': 'bg-amber-50/30',
    'construction': 'bg-orange-50/30',
    'retail': 'bg-pink-50/30',
    'healthcare': 'bg-red-50/30',
    'education': 'bg-indigo-50/30',
    'transport': 'bg-blue-50/30',
    'logistics': 'bg-orange-50/30',
    'finance': 'bg-emerald-50/30',
    'mining': 'bg-amber-50/30',
    'creative': 'bg-fuchsia-50/30',
    'skills development': 'bg-violet-50/30',
    'export': 'bg-teal-50/30',
    'innovation': 'bg-sky-50/30',
    'sme': 'bg-lime-50/30',
    'startup': 'bg-rose-50/30',
    'women': 'bg-pink-50/30',
    'youth': 'bg-cyan-50/30',
    'rural': 'bg-green-50/30',
    'supply chain': 'bg-orange-50/30',
    'ict': 'bg-indigo-50/30',
    'business': 'bg-sky-50/30',
    'development': 'bg-teal-50/30',
  };

  // Check for exact match
  if (backgroundMap[primaryCategory]) {
    return backgroundMap[primaryCategory];
  }

  // Check for partial matches
  for (const [key, color] of Object.entries(backgroundMap)) {
    if (primaryCategory.includes(key) || key.includes(primaryCategory)) {
      return color;
    }
  }

  return 'bg-card';
}

// Memoized component to prevent unnecessary re-renders
export const FundingCard = memo(function FundingCard({ funding, matchScore, scoreBreakdown }: FundingCardProps) {
  const fundingUrl = `/funding/${funding.slug}`;

  // Show match score color coding
  const getMatchScoreColor = (score: number) => {
    if (score >= 75) return "text-green-600 bg-green-50";
    if (score >= 50) return "text-orange-600 bg-orange-50";
    return "text-blue-600 bg-blue-50";
  };

  return (
    <Link href={fundingUrl}>
      <Card className={`p-6 hover:shadow-lg transition-shadow cursor-pointer mb-3 ${getCardBackgroundColor(funding.categories)} ${
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
              <Badge className={`border ${getFundingTypeBadgeColor(funding.fundingType)}`}>
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
                <Badge
                  key={`${category}-${idx}`}
                  variant="outline"
                  className={`text-xs font-medium border ${getCategoryColor(category)}`}
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {category}
                </Badge>
              ))}
              {funding.categories.length > 3 && (
                <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-200">
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
            {funding.source && (
              <>
                <span>Source: {funding.source.toUpperCase()}</span>
                <span className="opacity-60">•</span>
              </>
            )}
            <span suppressHydrationWarning>Updated {formatRelativeDate(funding.updatedAt)}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
});
