/**
 * Admin: Cleanup stale backfill jobs
 * POST /api/admin/jobs/enrich-backfill/cleanup
 * Marks ENRICH_BACKFILL jobs stuck in RUNNING > 10 minutes as FAILED (stale).
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(_req: NextRequest) {
  try {
    const cutoff = new Date(Date.now() - 10 * 60 * 1000);
    const stale = await prisma.jobLog.findMany({
      where: { type: 'ENRICH_BACKFILL', status: 'RUNNING', startedAt: { lt: cutoff } },
      select: { id: true },
    });
    for (const j of stale) {
      await prisma.jobLog.update({ where: { id: j.id }, data: { status: 'FAILED', finishedAt: new Date(), note: 'Marked stale (timeout/overlap)' } });
    }
    return NextResponse.json({ cleaned: stale.length });
  } catch (error) {
    console.error('Cleanup failed:', error);
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
  }
}

