/**
 * Funding Detail API Route
 * GET /api/funding/[id]
 *
 * Phase 3: ProTender Fund Finder - Get single funding opportunity by ID or slug
 * Supports both CUID and slug-based lookups
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  const startTime = Date.now();

  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Funding opportunity ID or slug is required' },
        { status: 400 }
      );
    }

    // Try to find by ID first, then by slug
    let opportunity = await prisma.fundingOpportunity.findUnique({
      where: { id },
    });

    // If not found by ID, try slug
    if (!opportunity) {
      opportunity = await prisma.fundingOpportunity.findUnique({
        where: { slug: id },
      });
    }

    if (!opportunity) {
      return NextResponse.json(
        { error: 'Funding opportunity not found' },
        { status: 404 }
      );
    }

    // Convert BigInt to number for JSON serialization and format response
    const formattedOpportunity = {
      ...opportunity,
      minAmount: opportunity.minAmount ? Number(opportunity.minAmount) : null,
      maxAmount: opportunity.maxAmount ? Number(opportunity.maxAmount) : null,
      // Convert cents to ZAR for display
      minAmountZAR: opportunity.minAmount ? Number(opportunity.minAmount) / 100 : null,
      maxAmountZAR: opportunity.maxAmount ? Number(opportunity.maxAmount) / 100 : null,
    };

    const duration = Date.now() - startTime;

    // Add custom headers
    const headers = new Headers();
    headers.set('X-Response-Time', `${duration}ms`);
    headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400'); // Cache for 1 hour

    console.log(`✅ Funding opportunity ${id} retrieved in ${duration}ms`);

    return NextResponse.json(formattedOpportunity, { headers });
  } catch (error) {
    console.error('❌ Error retrieving funding opportunity:', error);

    return NextResponse.json(
      {
        error: 'Failed to retrieve funding opportunity',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
