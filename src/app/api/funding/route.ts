/**
 * Funding Search API Route
 * GET /api/funding
 *
 * Phase 3: ProTender Fund Finder - Programmatic funding discovery engine
 * Strategy: LOCAL-FIRST - Queries local PostgreSQL database with PostgreSQL ILIKE search
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface FundingSearchParams {
  q?: string; // Full-text search query
  categories?: string[];
  provinces?: string[];
  fundingType?: string; // "Grant" | "Loan" | "Equity" | "Hybrid" | "Guarantee"
  amountMin?: number;
  amountMax?: number;
  source?: string; // "pdf" | "idc" | "sefa" | "nef"
  institution?: string;
  sort?: 'latest' | 'amountAsc' | 'amountDesc' | 'relevance';
  page?: number;
  pageSize?: number;
}

interface FundingSearchResponse {
  items: any[];
  total: number;
  page: number;
  pageSize: number;
  meta?: {
    total: number;
    page: number;
    pageSize: number;
    dataSource: string;
  };
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse query parameters
    const params: FundingSearchParams = {
      q: searchParams.get('q') || undefined,
      categories: searchParams.getAll('categories').filter(Boolean),
      provinces: searchParams.getAll('provinces').filter(Boolean),
      fundingType: searchParams.get('fundingType') || undefined,
      amountMin: searchParams.get('amountMin') ? parseInt(searchParams.get('amountMin')!) : undefined,
      amountMax: searchParams.get('amountMax') ? parseInt(searchParams.get('amountMax')!) : undefined,
      source: searchParams.get('source') || undefined,
      institution: searchParams.get('institution') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      pageSize: searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!) : 20,
      sort: (searchParams.get('sort') as 'latest' | 'amountAsc' | 'amountDesc' | 'relevance') || 'latest',
    };

    const page = params.page || 1;
    const pageSize = Math.min(params.pageSize || 20, 100); // Max 100 per page
    const skip = (page - 1) * pageSize;

    // Build where clause
    const where: Prisma.FundingOpportunityWhereInput = {
      isActive: true, // Only show active funding opportunities
    };

    // Full-text search using searchableText field with ILIKE
    if (params.q && params.q.trim()) {
      const query = params.q.toLowerCase();
      where.searchableText = {
        contains: query,
        mode: 'insensitive',
      };
    }

    // Category filter - handles array field
    if (params.categories && params.categories.length > 0) {
      where.categories = {
        hasSome: params.categories,
      };
    }

    // Province filter - handles array field
    if (params.provinces && params.provinces.length > 0) {
      where.provinces = {
        hasSome: params.provinces,
      };
    }

    // Funding type filter
    if (params.fundingType && params.fundingType.trim()) {
      where.fundingType = {
        equals: params.fundingType,
        mode: 'insensitive',
      };
    }

    // Amount range filters (in ZAR, not cents - convert to cents for query)
    if (params.amountMin !== undefined && params.amountMin !== null) {
      where.maxAmount = {
        gte: BigInt(params.amountMin * 100), // Convert to cents
      };
    }

    if (params.amountMax !== undefined && params.amountMax !== null) {
      where.minAmount = {
        lte: BigInt(params.amountMax * 100), // Convert to cents
      };
    }

    // Source filter
    if (params.source && params.source.trim()) {
      where.source = params.source;
    }

    // Institution filter
    if (params.institution && params.institution.trim()) {
      where.institution = {
        contains: params.institution,
        mode: 'insensitive',
      };
    }

    // Determine sort order
    let orderBy: Prisma.FundingOpportunityOrderByWithRelationInput[];
    switch (params.sort) {
      case 'amountAsc':
        orderBy = [
          { minAmount: 'asc' },
          { maxAmount: 'asc' },
          { createdAt: 'desc' },
        ];
        break;
      case 'amountDesc':
        orderBy = [
          { maxAmount: 'desc' },
          { minAmount: 'desc' },
          { createdAt: 'desc' },
        ];
        break;
      case 'relevance':
        // For relevance, prioritize recently updated and then by creation date
        orderBy = [
          { updatedAt: 'desc' },
          { createdAt: 'desc' },
        ];
        break;
      case 'latest':
      default:
        orderBy = [
          { createdAt: 'desc' },
          { updatedAt: 'desc' },
        ];
        break;
    }

    // Execute query with pagination
    const [opportunities, total] = await Promise.all([
      prisma.fundingOpportunity.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
      }),
      prisma.fundingOpportunity.count({ where }),
    ]);

    // Convert BigInt to number for JSON serialization and format response
    const formattedOpportunities = opportunities.map((opp) => ({
      ...opp,
      minAmount: opp.minAmount ? Number(opp.minAmount) : null,
      maxAmount: opp.maxAmount ? Number(opp.maxAmount) : null,
      // Convert cents to ZAR for display
      minAmountZAR: opp.minAmount ? Number(opp.minAmount) / 100 : null,
      maxAmountZAR: opp.maxAmount ? Number(opp.maxAmount) / 100 : null,
    }));

    const response: FundingSearchResponse = {
      items: formattedOpportunities,
      total,
      page,
      pageSize,
      meta: {
        total,
        page,
        pageSize,
        dataSource: 'local-db',
      },
    };

    const duration = Date.now() - startTime;

    // Add custom headers
    const headers = new Headers();
    headers.set('X-Data-Source', 'local-db');
    headers.set('X-Response-Time', `${duration}ms`);
    headers.set('X-Total-Results', total.toString());

    console.log(`✅ Funding search completed in ${duration}ms - ${total} results (page ${page}/${Math.ceil(total / pageSize)})`);

    return NextResponse.json(response, { headers });
  } catch (error) {
    console.error('❌ Error searching funding opportunities:', error);

    return NextResponse.json(
      {
        error: 'Failed to search funding opportunities',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
