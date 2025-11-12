/**
 * Search Tenders API Route
 * GET /api/search
 *
 * Migrated from TenderAPI Express route
 * Strategy: LOCAL-FIRST ONLY - Queries local Render PostgreSQL database directly
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface SearchParams {
  keywords?: string;
  categories?: string[];
  province?: string;
  closingInDays?: number;
  submissionMethods?: string[];
  buyer?: string;
  status?: string;
  page?: number;
  pageSize?: number;
  sort?: 'latest' | 'closingSoon' | 'relevance';
  publishedSince?: string;
  updatedSince?: string;
}

interface SearchResponse {
  data: any[]; // Returns Tender type structure
  total: number;
  page: number;
  pageSize: number;
  meta?: {
    total: number;
    page: number;
    pageSize: number;
    dataSource?: string;
  };
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse query parameters
    const params: SearchParams = {
      keywords: searchParams.get('keywords') || undefined,
      categories: searchParams.getAll('categories').filter(Boolean),
      province: searchParams.get('province') || undefined,
      closingInDays: searchParams.get('closingInDays') ? parseInt(searchParams.get('closingInDays')!) : undefined,
      submissionMethods: searchParams.getAll('submissionMethods').filter(Boolean),
      buyer: searchParams.get('buyer') || undefined,
      status: searchParams.get('status') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      pageSize: searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!) : 20,
      sort: (searchParams.get('sort') as 'latest' | 'closingSoon' | 'relevance') || 'latest',
      publishedSince: searchParams.get('publishedSince') || undefined,
      updatedSince: searchParams.get('updatedSince') || undefined,
    };

    const page = params.page || 1;
    const pageSize = Math.min(params.pageSize || 20, 100); // Max 100 per page
    const skip = (page - 1) * pageSize;

    // Build where clause
    const where: Prisma.OCDSReleaseWhereInput = {};

    // Keywords search (searches across title, description, buyer, and enriched fields)
    if (params.keywords && params.keywords.trim()) {
      const kw = params.keywords.toLowerCase();
      where.OR = [
        { tenderTitle: { contains: kw, mode: 'insensitive' } },
        { tenderDescription: { contains: kw, mode: 'insensitive' } },
        { buyerName: { contains: kw, mode: 'insensitive' } },
        { detailedCategory: { contains: kw, mode: 'insensitive' } }, // Phase 1 enrichment
        { tenderType: { contains: kw, mode: 'insensitive' } }, // Phase 1 enrichment
        { province: { contains: kw, mode: 'insensitive' } }, // Phase 1 enrichment
        { city: { contains: kw, mode: 'insensitive' } }, // Phase 2 enrichment
        { organOfStateType: { contains: kw, mode: 'insensitive' } }, // Phase 2 enrichment
        { tenderTypeCategory: { contains: kw, mode: 'insensitive' } }, // Phase 2 enrichment
      ];
    }

    // Category filter
    if (params.categories && params.categories.length > 0) {
      where.mainCategory = { in: params.categories };
    }

    // Province filter
    if (params.province && params.province.trim()) {
      where.province = { equals: params.province, mode: 'insensitive' };
    }

    // Freshness filters
    if (params.publishedSince) {
      where.publishedAt = { gte: new Date(params.publishedSince) };
    }

    if (params.updatedSince) {
      where.updatedAt = { gte: new Date(params.updatedSince) };
    }

    // Closing date filter
    if (params.closingInDays !== undefined && params.closingInDays !== null) {
      const now = new Date();
      const targetDate = new Date();
      targetDate.setDate(now.getDate() + params.closingInDays);

      where.closingAt = {
        gte: now,
        lte: targetDate,
      };
    }

    // Buyer filter
    if (params.buyer && params.buyer.trim()) {
      where.buyerName = { contains: params.buyer, mode: 'insensitive' };
    }

    // Status filter
    if (params.status) {
      where.status = params.status;
    }

    // Determine sort order
    let orderBy: Prisma.OCDSReleaseOrderByWithRelationInput[];
    switch (params.sort) {
      case 'closingSoon':
        orderBy = [{ closingAt: 'asc' }, { publishedAt: 'desc' }];
        break;
      case 'relevance':
        orderBy = params.keywords
          ? [{ publishedAt: 'desc' }, { updatedAt: 'desc' }]
          : [{ publishedAt: 'desc' }];
        break;
      case 'latest':
      default:
        orderBy = [
          { publishedAt: 'desc' },
          { updatedAt: 'desc' },
          { closingAt: 'desc' },
          { ocid: 'desc' },
        ];
        break;
    }

    // Execute query with pagination
    const [releases, total] = await Promise.all([
      prisma.oCDSRelease.findMany({
        select: {
          ocid: true,
          tenderTitle: true,
          tenderDisplayTitle: true,
          tenderDescription: true,
          buyerName: true,
          mainCategory: true,
          detailedCategory: true,
          closingAt: true,
          submissionMethods: true,
          status: true,
          publishedAt: true,
          updatedAt: true,
        },
        where,
        skip,
        take: pageSize,
        orderBy,
      }),
      prisma.oCDSRelease.count({ where }),
    ]);

    // Convert to proper Tender format (matching the expected structure)
    let tenders: any[] = releases.map((release) => {
      const submissionMethods = release.submissionMethods
        ? JSON.parse(release.submissionMethods)
        : [];

      return {
        ocid: release.ocid,
        id: release.ocid,
        date: release.publishedAt?.toISOString() || '',
        tag: [],
        initiationType: 'tender',
        buyer: release.buyerName ? {
          id: release.buyerName,
          name: release.buyerName,
        } : undefined,
        tender: {
          id: release.ocid,
          title: release.tenderTitle || release.tenderDisplayTitle || release.ocid,
          description: release.tenderDescription || undefined,
          status: release.status || 'active',
          mainProcurementCategory: release.mainCategory || undefined,
          tenderPeriod: release.closingAt ? {
            endDate: release.closingAt.toISOString(),
          } : undefined,
          submissionMethod: submissionMethods.length > 0 ? submissionMethods : undefined,
        },
        publishedAt: release.publishedAt?.toISOString(),
        updatedAt: release.updatedAt?.toISOString(),
        closingAt: release.closingAt?.toISOString(),
        status: release.status || undefined,
        detailedCategory: release.detailedCategory || undefined,
      };
    });

    // Post-filter submission methods (for array field compatibility)
    if (params.submissionMethods && params.submissionMethods.length > 0) {
      tenders = tenders.filter((tender) =>
        tender.tender?.submissionMethod?.some((method: string) =>
          params.submissionMethods!.includes(method)
        )
      );
    }

    const response: SearchResponse = {
      data: tenders,
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

    console.log(`✅ Search completed in ${duration}ms - ${total} results (page ${page}/${Math.ceil(total / pageSize)})`);

    return NextResponse.json(response, { headers });
  } catch (error) {
    console.error('❌ Error searching tenders:', error);

    return NextResponse.json(
      {
        error: 'Failed to search tenders',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
