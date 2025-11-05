/**
 * AI Providers API
 * GET /api/ai/providers
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  // Placeholder list of providers
  return NextResponse.json({
    providers: [
      { id: 'puter', name: 'Puter (local)', status: 'available' },
    ],
    recommended: 'puter',
  });
}

