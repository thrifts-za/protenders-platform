/**
 * Funding Facets API Route
 * GET /api/funding/facets
 *
 * Phase 3: ProTender Fund Finder - Return filter options with counts
 * Returns: categories, provinces, fundingTypes, sources, institutions (all with counts)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface FacetsResponse {
  categories: [string, number][]; // [category, count]
  provinces: [string, number][];
  fundingTypes: [string, number][];
  sources: [string, number][];
  institutions: [string, number][];
  amountRanges: {
    min: number | null;
    max: number | null;
    quartiles: number[];
  };
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Get all active funding opportunities to calculate facets
    const opportunities = await prisma.fundingOpportunity.findMany({
      where: { isActive: true },
      select: {
        categories: true,
        provinces: true,
        fundingType: true,
        source: true,
        institution: true,
        minAmount: true,
        maxAmount: true,
      },
    });

    // Calculate category facets
    const categoryMap = new Map<string, number>();
    opportunities.forEach((opp) => {
      opp.categories.forEach((cat) => {
        categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
      });
    });
    const categories: [string, number][] = Array.from(categoryMap.entries())
      .sort((a, b) => b[1] - a[1]); // Sort by count descending

    // Calculate province facets
    const provinceMap = new Map<string, number>();
    opportunities.forEach((opp) => {
      opp.provinces.forEach((prov) => {
        provinceMap.set(prov, (provinceMap.get(prov) || 0) + 1);
      });
    });
    const provinces: [string, number][] = Array.from(provinceMap.entries())
      .sort((a, b) => b[1] - a[1]); // Sort by count descending

    // Calculate funding type facets
    const fundingTypeMap = new Map<string, number>();
    opportunities.forEach((opp) => {
      const type = opp.fundingType;
      fundingTypeMap.set(type, (fundingTypeMap.get(type) || 0) + 1);
    });
    const fundingTypes: [string, number][] = Array.from(fundingTypeMap.entries())
      .sort((a, b) => b[1] - a[1]); // Sort by count descending

    // Calculate source facets
    const sourceMap = new Map<string, number>();
    opportunities.forEach((opp) => {
      const src = opp.source;
      sourceMap.set(src, (sourceMap.get(src) || 0) + 1);
    });
    const sources: [string, number][] = Array.from(sourceMap.entries())
      .sort((a, b) => b[1] - a[1]); // Sort by count descending

    // Calculate institution facets
    const institutionMap = new Map<string, number>();
    opportunities.forEach((opp) => {
      const inst = opp.institution;
      institutionMap.set(inst, (institutionMap.get(inst) || 0) + 1);
    });
    const institutions: [string, number][] = Array.from(institutionMap.entries())
      .sort((a, b) => b[1] - a[1]); // Sort by count descending

    // Calculate amount ranges (in ZAR)
    const amounts: number[] = opportunities
      .map((opp) => {
        if (opp.maxAmount) return Number(opp.maxAmount) / 100; // Convert cents to ZAR
        if (opp.minAmount) return Number(opp.minAmount) / 100;
        return null;
      })
      .filter((amt): amt is number => amt !== null)
      .sort((a, b) => a - b);

    const min = amounts.length > 0 ? amounts[0] : null;
    const max = amounts.length > 0 ? amounts[amounts.length - 1] : null;

    // Calculate quartiles
    const quartiles: number[] = [];
    if (amounts.length > 0) {
      const q1Index = Math.floor(amounts.length * 0.25);
      const q2Index = Math.floor(amounts.length * 0.5);
      const q3Index = Math.floor(amounts.length * 0.75);

      quartiles.push(amounts[q1Index]);
      quartiles.push(amounts[q2Index]);
      quartiles.push(amounts[q3Index]);
    }

    const response: FacetsResponse = {
      categories,
      provinces,
      fundingTypes,
      sources,
      institutions,
      amountRanges: {
        min,
        max,
        quartiles,
      },
    };

    const duration = Date.now() - startTime;

    // Add custom headers
    const headers = new Headers();
    headers.set('X-Response-Time', `${duration}ms`);
    headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400'); // Cache for 1 hour

    console.log(`✅ Funding facets calculated in ${duration}ms`);

    return NextResponse.json(response, { headers });
  } catch (error) {
    console.error('❌ Error calculating funding facets:', error);

    return NextResponse.json(
      {
        error: 'Failed to calculate funding facets',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
