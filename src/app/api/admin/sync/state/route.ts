/**
 * Admin Sync State API Route
 * GET /api/admin/sync/state
 *
 * Returns the current synchronization state
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/admin/sync/state
 * Get current synchronization state
 */
export async function GET(request: NextRequest) {
  try {
    // Get the main sync state
    const syncState = await prisma.syncState.findUnique({
      where: { id: 'ocds_etenders_sa' },
    });

    if (!syncState) {
      return NextResponse.json(
        {
          error: 'Sync state not found',
          message: 'No sync state record exists. Run initial sync first.',
        },
        { status: 404 }
      );
    }

    // Get recent sync activity stats
    const [
      totalReleases,
      recentReleases,
    ] = await Promise.all([
      prisma.oCDSRelease.count(),

      prisma.oCDSRelease.count({
        where: {
          publishedAt: {
            gte: syncState.lastSyncedDate || new Date(0),
          },
        },
      }),
    ]);

    // Calculate sync health
    const now = new Date();
    const lastRunAgo = syncState.lastRunAt
      ? now.getTime() - syncState.lastRunAt.getTime()
      : null;
    const lastSuccessAgo = syncState.lastSuccessAt
      ? now.getTime() - syncState.lastSuccessAt.getTime()
      : null;

    const isHealthy =
      lastSuccessAgo !== null &&
      lastSuccessAgo < 24 * 60 * 60 * 1000; // Less than 24h ago

    return NextResponse.json({
      id: syncState.id,
      lastRunAt: syncState.lastRunAt?.toISOString(),
      lastSuccessAt: syncState.lastSuccessAt?.toISOString(),
      lastSyncedDate: syncState.lastSyncedDate?.toISOString(),
      stats: {
        totalReleases,
        recentReleases,
      },
      health: {
        status: isHealthy ? 'healthy' : 'warning',
        lastRunAgoMs: lastRunAgo,
        lastSuccessAgoMs: lastSuccessAgo,
      },
      updatedAt: syncState.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Error fetching sync state:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch sync state',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/sync/state
 * Update synchronization state fields
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Upsert the sync state record with provided fields
    const updated = await prisma.syncState.upsert({
      where: { id: 'ocds_etenders_sa' },
      update: {
        lastRunAt:
          body.lastRunAt !== undefined && body.lastRunAt !== null
            ? new Date(body.lastRunAt)
            : undefined,
        lastSuccessAt:
          body.lastSuccessAt !== undefined && body.lastSuccessAt !== null
            ? new Date(body.lastSuccessAt)
            : undefined,
        lastCursor:
          body.lastCursor !== undefined ? body.lastCursor : undefined,
        lastSyncedDate:
          body.lastSyncedDate !== undefined && body.lastSyncedDate !== null
            ? new Date(body.lastSyncedDate)
            : undefined,
        notes: body.notes !== undefined ? body.notes : undefined,
      },
      create: {
        id: 'ocds_etenders_sa',
        lastRunAt: body.lastRunAt ? new Date(body.lastRunAt) : null,
        lastSuccessAt: body.lastSuccessAt ? new Date(body.lastSuccessAt) : null,
        lastCursor: body.lastCursor ?? null,
        lastSyncedDate: body.lastSyncedDate
          ? new Date(body.lastSyncedDate)
          : null,
        notes: body.notes ?? null,
      },
    });

    return NextResponse.json({
      id: updated.id,
      lastRunAt: updated.lastRunAt?.toISOString() ?? null,
      lastSuccessAt: updated.lastSuccessAt?.toISOString() ?? null,
      lastSyncedDate: updated.lastSyncedDate?.toISOString() ?? null,
      lastCursor: updated.lastCursor ?? null,
      notes: updated.notes ?? null,
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Error updating sync state:', error);
    return NextResponse.json(
      {
        error: 'Failed to update sync state',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
