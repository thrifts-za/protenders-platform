/**
 * Alert Logs API Route
 * GET /api/alerts/logs - Get alert execution logs
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/alerts/logs
 * Get alert execution logs for the authenticated user
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

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const savedSearchId = searchParams.get('savedSearchId');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '20'), 100);
    const skip = (page - 1) * pageSize;

    // Build where clause
    const where: any = {
      userId: user.id,
    };

    if (savedSearchId) {
      where.savedSearchId = savedSearchId;
    }

    // Get logs with pagination
    const [logs, total] = await Promise.all([
      prisma.alertLog.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: pageSize,
        include: {
          savedSearch: {
            select: {
              name: true,
              alertFrequency: true,
            },
          },
        },
      }),
      prisma.alertLog.count({ where }),
    ]);

    // Format response
    const formattedLogs = logs.map((log) => ({
      id: log.id,
      savedSearchId: log.savedSearchId,
      savedSearchName: log.savedSearch.name,
      alertFrequency: log.savedSearch.alertFrequency,
      tendersFound: log.tendersFound,
      emailSent: log.emailSent,
      error: log.error,
      createdAt: log.createdAt.toISOString(),
    }));

    return NextResponse.json({
      data: formattedLogs,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('❌ Error fetching alert logs:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch alert logs',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
