/**
 * Tender Timeline API Route
 * GET /api/tenders/:id/timeline
 *
 * Returns timeline of events for a tender (changes, updates, documents added, etc.)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/tenders/:id/timeline
 * Get timeline of events for a tender
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get all OCDS releases for this tender (by OCID)
    const releases = await prisma.oCDSRelease.findMany({
      where: {
        ocid: id,
      },
      orderBy: {
        date: 'desc',
      },
      select: {
        ocid: true,
        releaseId: true,
        date: true,
        tag: true,
        tenderTitle: true,
        status: true,
        closingAt: true,
        publishedAt: true,
        updatedAt: true,
        buyerName: true,
        mainCategory: true,
      },
    });

    if (releases.length === 0) {
      return NextResponse.json(
        { error: 'Tender not found' },
        { status: 404 }
      );
    }

    // Get timeline events from TimelineEvent table if available
    const timelineEvents = await prisma.timelineEvent.findMany({
      where: {
        ocid: id,
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Build timeline from releases
    const timeline = releases.map((release) => {
      const tags = release.tag ? JSON.parse(release.tag) : [];

      return {
        date: release.date.toISOString(),
        releaseId: release.releaseId,
        type: tags.length > 0 ? tags[0] : 'release',
        tags,
        title: release.tenderTitle,
        status: release.status,
        closingDate: release.closingAt?.toISOString(),
        publishedAt: release.publishedAt?.toISOString(),
        updatedAt: release.updatedAt?.toISOString(),
        buyer: release.buyerName,
        category: release.mainCategory,
      };
    });

    // Add timeline events if available
    const events = timelineEvents.map((event) => ({
      date: event.date.toISOString(),
      type: event.type,
      payload: event.payload ? JSON.parse(event.payload) : null,
      createdAt: event.createdAt.toISOString(),
    }));

    // Merge and sort all timeline items
    const allTimeline = [
      ...timeline.map(t => ({ ...t, source: 'release' })),
      ...events.map(e => ({ ...e, source: 'event' })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({
      ocid: id,
      totalReleases: releases.length,
      totalEvents: timelineEvents.length,
      timeline: allTimeline,
      summary: {
        firstSeen: releases.length > 0
          ? releases[releases.length - 1].date.toISOString()
          : null,
        lastUpdated: releases.length > 0
          ? releases[0].date.toISOString()
          : null,
        currentStatus: releases.length > 0
          ? releases[0].status
          : null,
        title: releases.length > 0
          ? releases[0].tenderTitle
          : null,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching tender timeline:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch tender timeline',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
