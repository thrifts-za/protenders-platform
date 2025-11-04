/**
 * Related Tenders Recommendations API Route
 * GET /api/recommendations/related
 *
 * Returns related/similar tenders based on query parameters
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/recommendations/related
 * Get related tenders based on ocid, category, or keywords
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ocid = searchParams.get('ocid');
    const category = searchParams.get('category');
    const keywords = searchParams.get('keywords');
    const buyer = searchParams.get('buyer');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);

    // If OCID provided, get related from TenderFeatures first
    if (ocid) {
      const features = await prisma.tenderFeatures.findUnique({
        where: { ocid },
      });

      if (features?.relatedOcids) {
        const relatedOcids = JSON.parse(features.relatedOcids);
        if (relatedOcids.length > 0) {
          const related = await prisma.oCDSRelease.findMany({
            where: {
              ocid: {
                in: relatedOcids.slice(0, limit),
              },
            },
            select: {
              ocid: true,
              tenderTitle: true,
              tenderDescription: true,
              buyerName: true,
              mainCategory: true,
              status: true,
              closingAt: true,
              publishedAt: true,
            },
          });

          return NextResponse.json({
            data: related.map(r => ({
              ocid: r.ocid,
              title: r.tenderTitle,
              description: r.tenderDescription,
              buyer: r.buyerName,
              category: r.mainCategory,
              status: r.status,
              closingDate: r.closingAt?.toISOString(),
              publishedDate: r.publishedAt?.toISOString(),
            })),
            total: related.length,
            method: 'features',
          });
        }
      }

      // Fallback: Get tender and find similar by category
      const tender = await prisma.oCDSRelease.findFirst({
        where: { ocid },
        orderBy: { date: 'desc' },
      });

      if (tender) {
        const similar = await prisma.oCDSRelease.findMany({
          where: {
            mainCategory: tender.mainCategory,
            ocid: { not: ocid },
          },
          orderBy: {
            publishedAt: 'desc',
          },
          take: limit,
          select: {
            ocid: true,
            tenderTitle: true,
            tenderDescription: true,
            buyerName: true,
            mainCategory: true,
            status: true,
            closingAt: true,
            publishedAt: true,
          },
        });

        return NextResponse.json({
          data: similar.map(r => ({
            ocid: r.ocid,
            title: r.tenderTitle,
            description: r.tenderDescription,
            buyer: r.buyerName,
            category: r.mainCategory,
            status: r.status,
            closingDate: r.closingAt?.toISOString(),
            publishedDate: r.publishedAt?.toISOString(),
          })),
          total: similar.length,
          method: 'category_match',
        });
      }
    }

    // If category provided, get tenders in that category
    if (category) {
      const tenders = await prisma.oCDSRelease.findMany({
        where: {
          mainCategory: category,
        },
        orderBy: {
          publishedAt: 'desc',
        },
        take: limit,
        select: {
          ocid: true,
          tenderTitle: true,
          tenderDescription: true,
          buyerName: true,
          mainCategory: true,
          status: true,
          closingAt: true,
          publishedAt: true,
        },
      });

      return NextResponse.json({
        data: tenders.map(r => ({
          ocid: r.ocid,
          title: r.tenderTitle,
          description: r.tenderDescription,
          buyer: r.buyerName,
          category: r.mainCategory,
          status: r.status,
          closingDate: r.closingAt?.toISOString(),
          publishedDate: r.publishedAt?.toISOString(),
        })),
        total: tenders.length,
        method: 'category',
      });
    }

    // If buyer provided, get tenders from that buyer
    if (buyer) {
      const tenders = await prisma.oCDSRelease.findMany({
        where: {
          buyerName: {
            contains: buyer,
            mode: 'insensitive',
          },
        },
        orderBy: {
          publishedAt: 'desc',
        },
        take: limit,
        select: {
          ocid: true,
          tenderTitle: true,
          tenderDescription: true,
          buyerName: true,
          mainCategory: true,
          status: true,
          closingAt: true,
          publishedAt: true,
        },
      });

      return NextResponse.json({
        data: tenders.map(r => ({
          ocid: r.ocid,
          title: r.tenderTitle,
          description: r.tenderDescription,
          buyer: r.buyerName,
          category: r.mainCategory,
          status: r.status,
          closingDate: r.closingAt?.toISOString(),
          publishedDate: r.publishedAt?.toISOString(),
        })),
        total: tenders.length,
        method: 'buyer',
      });
    }

    // If keywords provided, search by keywords
    if (keywords) {
      const kw = keywords.toLowerCase();
      const tenders = await prisma.oCDSRelease.findMany({
        where: {
          OR: [
            { tenderTitle: { contains: kw, mode: 'insensitive' } },
            { tenderDescription: { contains: kw, mode: 'insensitive' } },
          ],
        },
        orderBy: {
          publishedAt: 'desc',
        },
        take: limit,
        select: {
          ocid: true,
          tenderTitle: true,
          tenderDescription: true,
          buyerName: true,
          mainCategory: true,
          status: true,
          closingAt: true,
          publishedAt: true,
        },
      });

      return NextResponse.json({
        data: tenders.map(r => ({
          ocid: r.ocid,
          title: r.tenderTitle,
          description: r.tenderDescription,
          buyer: r.buyerName,
          category: r.mainCategory,
          status: r.status,
          closingDate: r.closingAt?.toISOString(),
          publishedDate: r.publishedAt?.toISOString(),
        })),
        total: tenders.length,
        method: 'keywords',
      });
    }

    return NextResponse.json(
      { error: 'Please provide ocid, category, buyer, or keywords parameter' },
      { status: 400 }
    );
  } catch (error) {
    console.error('❌ Error fetching related tenders:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch related tenders',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
