/**
 * AI Health API
 * GET /api/ai/health
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({ ok: true, providers: ['puter'], timestamp: new Date().toISOString() });
}

