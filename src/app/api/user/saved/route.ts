/**
 * User Saved Tenders API Route
 * GET /api/user/saved - List saved tenders
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/user/saved
 * Get all saved tenders for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Parse query parameters for pagination
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '20'), 100);
    const skip = (page - 1) * pageSize;

    // Get saved tenders with associated tender data
    const [savedTenders, total] = await Promise.all([
      prisma.savedTender.findMany({
        where: {
          userId: user.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: pageSize,
        include: {
          tender: {
            select: {
              id: true,
              ocid: true,
              title: true,
              description: true,
              mainProcurementCategory: true,
              status: true,
              startDate: true,
              endDate: true,
              valueAmount: true,
              valueCurrency: true,
            },
          },
        },
      }),
      prisma.savedTender.count({
        where: {
          userId: user.id,
        },
      }),
    ]);

    // Format response
    const formattedSavedTenders = savedTenders.map((saved) => ({
      id: saved.id,
      tenderId: saved.tenderId,
      notes: saved.notes,
      savedAt: saved.createdAt.toISOString(),
      updatedAt: saved.updatedAt.toISOString(),
      tender: {
        id: saved.tender.id,
        ocid: saved.tender.ocid,
        title: saved.tender.title,
        description: saved.tender.description,
        mainProcurementCategory: saved.tender.mainProcurementCategory,
        status: saved.tender.status,
        startDate: saved.tender.startDate?.toISOString(),
        endDate: saved.tender.endDate?.toISOString(),
        valueAmount: saved.tender.valueAmount,
        valueCurrency: saved.tender.valueCurrency,
      },
    }));

    return NextResponse.json({
      data: formattedSavedTenders,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('❌ Error fetching saved tenders:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch saved tenders',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
