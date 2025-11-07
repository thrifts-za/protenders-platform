/**
 * Alerts Runner (Cron)
 * POST /api/cron/alerts-run
 *
 * Sends email alerts for SavedSearch records that are due (daily/weekly).
 * Secured by CRON_SECRET (Authorization: Bearer <secret>), like /api/cron/sync.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { runSavedSearchAlerts } from '@/lib/alertsRunner';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 120; // 2 minutes

type Frequency = 'daily' | 'weekly';

function isDue(freq: Frequency, last?: Date | null) {
  if (!last) return true;
  const now = Date.now();
  const delta = now - last.getTime();
  if (freq === 'daily') return delta >= 24 * 60 * 60 * 1000;
  return delta >= 7 * 24 * 60 * 60 * 1000;
}

export async function POST(request: NextRequest) {
  const started = Date.now();
  try {
    // Verify cron secret (header, query param, or Vercel Cron header)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    const url = new URL(request.url);
    const secretParam = url.searchParams.get('secret');
    const isVercelCron = !!request.headers.get('x-vercel-cron');
    const authorized =
      (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
      (cronSecret && secretParam === cronSecret) ||
      isVercelCron;
    if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Pick SavedSearch records with alertFrequency daily/weekly and due
    const { processed, emails, totalFound } = await runSavedSearchAlerts();
    return NextResponse.json({ success: true, processed, emails, totalFound, durationMs: Date.now() - started });
  } catch (error) {
    console.error('❌ Alerts run error:', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
