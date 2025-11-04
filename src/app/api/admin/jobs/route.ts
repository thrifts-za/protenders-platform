/**
 * Admin Jobs API Route
 * GET /api/admin/jobs
 *
 * Migrated from TenderAPI Express route
 * Returns background job status and history
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface JobLog {
  id: string;
  type: string;
  status: string;
  startedAt: string;
  finishedAt: string | null;
  note: string | null;
  metadata: unknown;
}

interface JobsResponse {
  recentJobs: JobLog[];
  statistics: {
    total: number;
    pending: number;
    running: number;
    success: number;
    failed: number;
  };
  lastSyncAt: string | null;
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type') || undefined;

    console.log('Fetching admin job logs...');

    // Build where clause
    const where = type ? { type } : {};

    // Fetch job logs and statistics in parallel
    const [recentJobs, statistics, lastSync] = await Promise.all([
      // Recent jobs
      prisma.jobLog.findMany({
        where,
        orderBy: { startedAt: 'desc' },
        take: Math.min(limit, 100),
        select: {
          id: true,
          type: true,
          status: true,
          startedAt: true,
          finishedAt: true,
          note: true,
          metadata: true,
        },
      }),

      // Job statistics
      Promise.all([
        prisma.jobLog.count(),
        prisma.jobLog.count({ where: { status: 'PENDING' } }),
        prisma.jobLog.count({ where: { status: 'RUNNING' } }),
        prisma.jobLog.count({ where: { status: 'SUCCESS' } }),
        prisma.jobLog.count({ where: { status: 'FAILED' } }),
      ]).then(([total, pending, running, success, failed]) => ({
        total,
        pending,
        running,
        success,
        failed,
      })),

      // Last successful sync
      prisma.jobLog.findFirst({
        where: {
          type: 'SYNC',
          status: 'SUCCESS',
        },
        orderBy: { finishedAt: 'desc' },
        select: { finishedAt: true },
      }),
    ]);

    const response: JobsResponse = {
      recentJobs: recentJobs.map((job) => ({
        id: job.id,
        type: job.type,
        status: job.status,
        startedAt: job.startedAt.toISOString(),
        finishedAt: job.finishedAt?.toISOString() || null,
        note: job.note,
        metadata: job.metadata ? JSON.parse(job.metadata as string) : null,
      })),
      statistics,
      lastSyncAt: lastSync?.finishedAt?.toISOString() || null,
    };

    const duration = Date.now() - startTime;

    const headers = new Headers();
    headers.set('X-Data-Source', 'local-db');
    headers.set('X-Response-Time', `${duration}ms`);

    console.log(`Job logs fetched in ${duration}ms`);

    return NextResponse.json(response, { headers });
  } catch (error) {
    console.error('Error fetching job logs:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch job logs',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
