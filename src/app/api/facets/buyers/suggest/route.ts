/**
 * Buyer Suggestions API Route
 * GET /api/facets/buyers/suggest?q=...
 *
 * Returns buyer name suggestions based on a query string.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = (searchParams.get('q') || '').trim();
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);

    // Prefer BuyerStats for fast, deduplicated suggestions
    let buyers = await prisma.buyerStats.findMany({
      where: q
        ? {
            buyerName: {
              contains: q,
              mode: 'insensitive',
            },
          }
        : undefined,
      orderBy: [{ awards24m: 'desc' }, { buyerName: 'asc' }],
      take: limit,
      select: {
        buyerName: true,
        awards24m: true,
        avgAwardZAR: true,
      },
    });

    // If BuyerStats empty (e.g., not computed), fallback to releases distinct buyers
    if (buyers.length === 0) {
      const releases = await prisma.oCDSRelease.findMany({
        where: q
          ? {
              buyerName: {
                contains: q,
                mode: 'insensitive',
              },
            }
          : { buyerName: { not: null } },
        distinct: ['buyerName'],
        take: limit,
        select: {
          buyerName: true,
        },
      });

      const suggestions = releases
        .map((r) => r.buyerName)
        .filter(Boolean) as string[];

      return NextResponse.json({
        query: q || null,
        total: suggestions.length,
        data: suggestions.map((name) => ({ buyerName: name })),
        source: 'releases',
      });
    }

    return NextResponse.json({
      query: q || null,
      total: buyers.length,
      data: buyers.map((b) => ({
        buyerName: b.buyerName,
        awards24m: b.awards24m,
        avgAwardZAR: b.avgAwardZAR,
      })),
      source: 'buyer-stats',
    });
  } catch (error) {
    console.error('❌ Error fetching buyer suggestions:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch buyer suggestions',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

