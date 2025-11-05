/**
 * AI Provider Status API
 * GET /api/ai/status/:provider
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  if (provider === 'puter') {
    return NextResponse.json({ provider, status: 'available' });
  }
  return NextResponse.json({ provider, status: 'unknown' });
}

