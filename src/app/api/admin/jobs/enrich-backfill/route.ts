/**
 * Admin Job: Enrichment Backfill
 * POST /api/admin/jobs/enrich-backfill
 *
 * Runs a bounded enrichment backfill over a selected date range (year or all-time).
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { backfillEnrichment } from '@/lib/enrichment/backfill';
import { requireAdmin } from '@/lib/auth-middleware';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes

function yearRange(year: string): { from: string; to: string } {
  if (year === '2024') return { from: '2024-01-01', to: '2024-12-31' };
  if (year === '2025') return { from: '2025-01-01', to: '2025-12-31' };
  const now = new Date();
  const y = now.getUTCFullYear();
  return { from: `${y}-01-01`, to: `${y}-12-31` };
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 }
    );
  }

  try {
    // Prevent overlapping runs (last 10 minutes)
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000);
    const running = await prisma.jobLog.count({ where: { type: 'ENRICH_BACKFILL', status: 'RUNNING', startedAt: { gte: tenMinAgo } } });
    if (running > 0) {
      return NextResponse.json({ error: 'Another backfill is running. Try again in a few minutes.' }, { status: 409 });
    }
    const body = await request.json().catch(() => ({}));
    const { year = 'all-time', limit = 1000, delay = 300 } = body || {};

    // Resolve date range
    let from: string;
    let to: string;
    if (year === 'all-time') {
      const minDate = await prisma.oCDSRelease.aggregate({ _min: { date: true } });
      const start = minDate._min.date || new Date('2021-01-01T00:00:00Z');
      from = start.toISOString().slice(0, 10);
      const end = new Date();
      to = end.toISOString().slice(0, 10);
    } else {
      const rng = yearRange(String(year));
      from = rng.from;
      to = rng.to;
    }

    // Create job log entry
    const job = await prisma.jobLog.create({
      data: {
        type: 'ENRICH_BACKFILL',
        status: 'RUNNING',
        startedAt: new Date(),
        metadata: JSON.stringify({ year, from, to, limit, delay, manual: true }),
      },
    });

    // Clear cancel flag and run bounded backfill (within ~4.5 minutes)
    try {
      await prisma.config.upsert({ where: { key: 'enrich_backfill_cancel' }, update: { value: 'false' }, create: { key: 'enrich_backfill_cancel', value: 'false' } });
    } catch (e) {
      console.warn('Config table not available; proceeding without cancel flag support');
    }
    const res = await backfillEnrichment({ from, to, limit: Number(limit), delayMs: Number(delay), timeBudgetMs: 270000, cancelFlagKey: 'enrich_backfill_cancel' });

    const baseNote = `processed=${res.processed}, updated=${res.updated}, skipped=${res.skipped}, failures=${res.failures}`;
    const status = res.cancelled ? 'CANCELLED' : 'SUCCESS';
    const note = res.cancelled
      ? `Backfill cancelled (${baseNote})`
      : res.stoppedEarly
      ? `Backfill partial (timebox) — ${baseNote}`
      : `Backfill completed — ${baseNote}`;

    await prisma.jobLog.update({
      where: { id: job.id },
      data: {
        status,
        finishedAt: new Date(),
        note,
        metadata: JSON.stringify({ ...res, year, from, to, limit, delay }),
      },
    });

    return NextResponse.json({ jobId: job.id, from, to, result: res });
  } catch (error) {
    console.error('❌ Enrich backfill failed:', error);
    return NextResponse.json({ error: 'Backfill failed', message: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
