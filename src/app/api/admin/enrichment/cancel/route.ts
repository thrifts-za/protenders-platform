/**
 * Admin: Cancel current enrichment backfill
 * POST /api/admin/enrichment/cancel
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-middleware';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(_req: NextRequest) {
  try {
    await requireAdmin();
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 }
    );
  }

  try {
    await prisma.config.upsert({
      where: { key: 'enrich_backfill_cancel' },
      update: { value: 'true' },
      create: { key: 'enrich_backfill_cancel', value: 'true' },
    });
    return NextResponse.json({ cancelled: true });
  } catch (error) {
    console.error('Failed to set cancel flag:', error);
    return NextResponse.json({ error: 'Failed to cancel backfill' }, { status: 500 });
  }
}

