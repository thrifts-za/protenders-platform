/**
 * Admin Alert Logs
 * GET /api/admin/alerts/logs?limit=100
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-middleware';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 }
    );
  }

  try {
    const limit = Math.min(parseInt(request.nextUrl.searchParams.get('limit') || '100'), 500);
    const logs = await prisma.alertLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: { select: { email: true, name: true } },
        savedSearch: { select: { name: true, alertFrequency: true } },
      },
    });
    return NextResponse.json({
      data: logs.map((l) => ({
        id: l.id,
        user: l.user?.email || l.user?.name || 'Unknown',
        savedSearchId: l.savedSearchId,
        savedSearchName: l.savedSearch?.name,
        alertFrequency: l.savedSearch?.alertFrequency,
        tendersFound: l.tendersFound,
        emailSent: l.emailSent,
        error: l.error,
        createdAt: l.createdAt,
      })),
    });
  } catch (error) {
    console.error('❌ Error fetching admin alert logs:', error);
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}

