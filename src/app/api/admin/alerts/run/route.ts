/**
 * Admin Alerts Runner
 * POST /api/admin/alerts/run
 *
 * Triggers the saved search alerts runner with admin session.
 */

import { NextRequest, NextResponse } from 'next/server';
import { runSavedSearchAlerts } from '@/lib/alertsRunner';
import { requireAdmin } from '@/lib/auth-middleware';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(_request: NextRequest) {
  try {
    await requireAdmin();
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 }
    );
  }

  try {
    const { processed, emails, totalFound } = await runSavedSearchAlerts();
    return NextResponse.json({ success: true, processed, emails, totalFound });
  } catch (error) {
    console.error('❌ Admin alerts run error:', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

