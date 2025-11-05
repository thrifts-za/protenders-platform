/**
 * Document view API
 * GET /api/docs/:docId/view - Redirects to original URL if known
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ docId: string }> }
) {
  try {
    const { docId } = await params;

    const reg = await prisma.docRegistry.findUnique({ where: { docId } });
    if (reg?.originalUrl) {
      return NextResponse.redirect(reg.originalUrl);
    }

    const doc = await prisma.document.findFirst({ where: { docId } });
    if (doc?.url) {
      return NextResponse.redirect(doc.url);
    }

    return NextResponse.json({ error: 'Document URL not found' }, { status: 404 });
  } catch (error) {
    console.error('❌ Error redirecting to document:', error);
    return NextResponse.json({ error: 'Failed to open document' }, { status: 500 });
  }
}

