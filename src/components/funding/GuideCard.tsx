/**
 * GuideCard Component
 * Phase 3: ProTender Fund Finder - Funding Guides
 *
 * Displays a funding guide in a card format with SEO-optimized presentation
 */

"use client";

import { memo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { BookOpen, Clock, Target, Download, TrendingUp } from "lucide-react";
import type { FundingGuide } from "@/data/fundingGuides";

interface GuideCardProps {
  guide: FundingGuide;
  featured?: boolean;
}

/**
 * Get difficulty badge color
 */
function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'Beginner':
      return 'bg-green-100 text-green-700 border-green-300';
    case 'Intermediate':
      return 'bg-amber-100 text-amber-700 border-amber-300';
    case 'Advanced':
      return 'bg-red-100 text-red-700 border-red-300';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300';
  }
}

/**
 * Get category badge color
 */
function getCategoryColor(category: string): string {
  const colorMap: Record<string, string> = {
    'How-to': 'bg-blue-100 text-blue-700 border-blue-200',
    'Comparison': 'bg-purple-100 text-purple-700 border-purple-200',
    'Industry-specific': 'bg-cyan-100 text-cyan-700 border-cyan-200',
    'Success Stories': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };

  return colorMap[category] || 'bg-gray-100 text-gray-700 border-gray-200';
}

/**
 * Get card background based on category
 */
function getCardBackground(category: string, featured?: boolean): string {
  if (featured) {
    return 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200';
  }

  const backgroundMap: Record<string, string> = {
    'How-to': 'bg-blue-50/30',
    'Comparison': 'bg-purple-50/30',
    'Industry-specific': 'bg-cyan-50/30',
    'Success Stories': 'bg-emerald-50/30',
  };

  return backgroundMap[category] || 'bg-card';
}

/**
 * GuideCard Component
 */
export const GuideCard = memo(function GuideCard({ guide, featured = false }: GuideCardProps) {
  const guideUrl = `/funding/guides/${guide.slug}`;

  return (
    <Link href={guideUrl}>
      <Card
        className={`p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-full flex flex-col ${
          getCardBackground(guide.category, featured)
        } ${featured ? 'border-2' : ''}`}
      >
        <div className="space-y-4 flex-1 flex flex-col">
          {/* Header with badges */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <Badge className={`border font-semibold ${getCategoryColor(guide.category)}`}>
                {guide.category}
              </Badge>
              <Badge className={`border ${getDifficultyColor(guide.difficulty)}`}>
                {guide.difficulty}
              </Badge>
              {featured && (
                <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0">
                  ⭐ Featured
                </Badge>
              )}
            </div>
          </div>

          {/* Title */}
          <h3 className={`font-bold text-card-foreground line-clamp-2 ${
            featured ? 'text-xl' : 'text-lg'
          }`}>
            {guide.title}
          </h3>

          {/* Excerpt */}
          <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
            {guide.excerpt}
          </p>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-2 border-t">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{guide.readTime}</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              <span>{guide.author}</span>
            </div>
            {guide.downloadableResource && (
              <div className="flex items-center gap-1 text-emerald-600 font-medium">
                <Download className="h-3 w-3" />
                <span>Free Download</span>
              </div>
            )}
          </div>

          {/* Target Audience Tags */}
          {guide.targetAudience && guide.targetAudience.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {guide.targetAudience.slice(0, 3).map((audience, idx) => (
                <Badge
                  key={`${audience}-${idx}`}
                  variant="outline"
                  className="text-xs bg-white/50"
                >
                  <Target className="h-3 w-3 mr-1" />
                  {audience}
                </Badge>
              ))}
              {guide.targetAudience.length > 3 && (
                <Badge variant="outline" className="text-xs bg-gray-50">
                  +{guide.targetAudience.length - 3} more
                </Badge>
              )}
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {guide.tags.slice(0, 4).map((tag, idx) => (
              <span
                key={`${tag}-${idx}`}
                className="text-xs px-2 py-0.5 bg-white/60 rounded-full text-muted-foreground border border-gray-200"
              >
                {tag}
              </span>
            ))}
            {guide.tags.length > 4 && (
              <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-muted-foreground">
                +{guide.tags.length - 4}
              </span>
            )}
          </div>

          {/* Call to Action */}
          {featured && (
            <div className="pt-2 mt-auto">
              <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600">
                <span>Read Complete Guide</span>
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
});
