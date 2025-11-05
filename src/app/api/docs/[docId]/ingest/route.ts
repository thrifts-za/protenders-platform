/**
 * Document ingest API
 * POST /api/docs/:docId/ingest - Register a document for processing
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ docId: string }> }
) {
  try {
    const { docId } = await params;
    const body = await request.json().catch(() => ({}));

    // Try to find in Document table
    const doc = await prisma.document.findFirst({ where: { docId } });

    // Create or update registry
    const reg = await prisma.docRegistry.upsert({
      where: { docId },
      update: {
        ocid: body.ocid ?? doc?.ocid ?? undefined,
        title: body.title ?? doc?.title ?? undefined,
        mimeType: body.mimeType ?? doc?.format ?? undefined,
        originalUrl: body.originalUrl ?? doc?.url ?? undefined,
        status: 'available',
      },
      create: {
        docId,
        ocid: body.ocid ?? doc?.ocid ?? null,
        title: body.title ?? doc?.title ?? null,
        mimeType: body.mimeType ?? doc?.format ?? null,
        originalUrl: body.originalUrl ?? doc?.url ?? '',
        status: 'available',
      },
    });

    return NextResponse.json({
      message: 'Document registered',
      docId: reg.docId,
      ocid: reg.ocid,
      originalUrl: reg.originalUrl,
      status: reg.status,
    });
  } catch (error) {
    console.error('❌ Error ingesting document:', error);
    return NextResponse.json({ error: 'Failed to ingest document' }, { status: 500 });
  }
}

