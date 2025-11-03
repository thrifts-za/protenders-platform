/**
 * Facets API Route
 * GET /api/facets
 *
 * Migrated from TenderAPI Express route
 * Returns aggregated facet counts for filtering UI
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface FacetItem {
  value: string;
  count: number;
  label: string;
}

interface FacetsResponse {
  categories: FacetItem[];
  buyers: FacetItem[];
  submissionMethods: FacetItem[];
  statuses: FacetItem[];
  closingDateRanges: FacetItem[];
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse optional filter parameters
    const category = searchParams.get('category') || undefined;
    const status = searchParams.get('status') || undefined;
    const buyer = searchParams.get('buyer') || undefined;
    const closingInDays = searchParams.get('closingInDays')
      ? parseInt(searchParams.get('closingInDays')!)
      : undefined;

    // Build base where clause for filtered facets
    const baseWhere: Prisma.OCDSReleaseWhereInput = {};

    if (category) {
      baseWhere.mainCategory = category;
    }

    if (status) {
      baseWhere.status = status;
    }

    if (buyer) {
      baseWhere.buyerName = { contains: buyer, mode: 'insensitive' };
    }

    if (closingInDays !== undefined && closingInDays !== null) {
      const now = new Date();
      const targetDate = new Date();
      targetDate.setDate(now.getDate() + closingInDays);

      baseWhere.closingAt = {
        gte: now,
        lte: targetDate,
      };
    }

    console.log('📊 Fetching facets with filters:', baseWhere);

    // Fetch all facets in parallel
    const [categories, buyers, submissionMethods, statuses, closingDateRanges] =
      await Promise.all([
        getCategoryFacets(baseWhere),
        getBuyerFacets(baseWhere),
        getSubmissionMethodFacets(baseWhere),
        getStatusFacets(baseWhere),
        getClosingDateRangeFacets(baseWhere),
      ]);

    const facets: FacetsResponse = {
      categories,
      buyers,
      submissionMethods,
      statuses,
      closingDateRanges,
    };

    const duration = Date.now() - startTime;

    const headers = new Headers();
    headers.set('X-Data-Source', 'local-db');
    headers.set('X-Response-Time', `${duration}ms`);

    console.log(`✅ Facets fetched in ${duration}ms`);

    return NextResponse.json(facets, { headers });
  } catch (error) {
    console.error('❌ Error fetching facets:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch facets',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Get category facets
 */
async function getCategoryFacets(
  baseWhere: Prisma.OCDSReleaseWhereInput
): Promise<FacetItem[]> {
  const categories = await prisma.oCDSRelease.groupBy({
    by: ['mainCategory'],
    where: {
      ...baseWhere,
      mainCategory: { not: null },
    },
    _count: {
      mainCategory: true,
    },
    orderBy: {
      _count: {
        mainCategory: 'desc',
      },
    },
    take: 20,
  });

  return categories.map((cat) => ({
    value: cat.mainCategory!,
    count: cat._count.mainCategory,
    label: formatCategoryLabel(cat.mainCategory!),
  }));
}

/**
 * Get buyer facets (top 20 most active buyers)
 */
async function getBuyerFacets(
  baseWhere: Prisma.OCDSReleaseWhereInput
): Promise<FacetItem[]> {
  const buyers = await prisma.oCDSRelease.groupBy({
    by: ['buyerName'],
    where: {
      ...baseWhere,
      buyerName: { not: null },
    },
    _count: {
      buyerName: true,
    },
    orderBy: {
      _count: {
        buyerName: 'desc',
      },
    },
    take: 20,
  });

  return buyers.map((buyer) => ({
    value: buyer.buyerName!,
    count: buyer._count.buyerName,
    label: buyer.buyerName!,
  }));
}

/**
 * Get submission method facets
 */
async function getSubmissionMethodFacets(
  baseWhere: Prisma.OCDSReleaseWhereInput
): Promise<FacetItem[]> {
  // submissionMethods is a JSON array string, so we need to query all records
  // and parse the JSON to aggregate counts
  const releases = await prisma.oCDSRelease.findMany({
    where: {
      ...baseWhere,
      submissionMethods: { not: null },
    },
    select: {
      submissionMethods: true,
    },
  });

  // Parse JSON arrays and count unique methods
  const methodCounts = new Map<string, number>();

  for (const release of releases) {
    if (release.submissionMethods) {
      try {
        const methods = JSON.parse(release.submissionMethods) as string[];
        for (const method of methods) {
          methodCounts.set(method, (methodCounts.get(method) || 0) + 1);
        }
      } catch (error) {
        // Skip invalid JSON
        continue;
      }
    }
  }

  // Convert to facet items and sort by count
  return Array.from(methodCounts.entries())
    .map(([method, count]) => ({
      value: method,
      count,
      label: formatSubmissionMethodLabel(method),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

/**
 * Get status facets
 */
async function getStatusFacets(
  baseWhere: Prisma.OCDSReleaseWhereInput
): Promise<FacetItem[]> {
  const statuses = await prisma.oCDSRelease.groupBy({
    by: ['status'],
    where: {
      ...baseWhere,
      status: { not: null },
    },
    _count: {
      status: true,
    },
    orderBy: {
      _count: {
        status: 'desc',
      },
    },
  });

  return statuses.map((status) => ({
    value: status.status!,
    count: status._count.status,
    label: formatStatusLabel(status.status!),
  }));
}

/**
 * Get closing date range facets
 */
async function getClosingDateRangeFacets(
  baseWhere: Prisma.OCDSReleaseWhereInput
): Promise<FacetItem[]> {
  const now = new Date();

  const ranges = [
    { label: 'Today', days: 1 },
    { label: 'This Week', days: 7 },
    { label: 'Next 2 Weeks', days: 14 },
    { label: 'This Month', days: 30 },
    { label: 'Next 3 Months', days: 90 },
  ];

  const dateCounts = await Promise.all(
    ranges.map(async (range) => {
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() + range.days);

      const count = await prisma.oCDSRelease.count({
        where: {
          ...baseWhere,
          closingAt: {
            gte: now,
            lte: targetDate,
          },
        },
      });

      return {
        value: range.label,
        count,
        label: range.label,
      };
    })
  );

  return dateCounts.filter((dc) => dc.count > 0);
}

/**
 * Format category label for display
 */
function formatCategoryLabel(category: string): string {
  // Capitalize first letter of each word
  return category
    .split(/[\s_-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Format submission method label for display
 */
function formatSubmissionMethodLabel(method: string): string {
  // Clean up submission method labels
  const cleanMethod = method.replace(/[_-]/g, ' ');
  return cleanMethod.charAt(0).toUpperCase() + cleanMethod.slice(1).toLowerCase();
}

/**
 * Format status label for display
 */
function formatStatusLabel(status: string): string {
  // Capitalize first letter
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}
