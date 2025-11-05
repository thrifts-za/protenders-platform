/**
 * Admin: Cancel current enrichment backfill (jobs namespace)
 * POST /api/admin/jobs/enrichment/cancel
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(_req: NextRequest) {
  try {
    await prisma.config.upsert({
      where: { key: 'enrich_backfill_cancel' },
      update: { value: 'true' },
      create: { key: 'enrich_backfill_cancel', value: 'true' },
    });
    return NextResponse.json({ cancelled: true });
  } catch (error) {
    console.error('Failed to set cancel flag (jobs route):', error);
    return NextResponse.json({ error: 'Failed to cancel backfill' }, { status: 500 });
  }
}

