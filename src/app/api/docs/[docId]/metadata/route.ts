/**
 * Document metadata API
 * GET /api/docs/:docId/metadata
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

    // Prefer DocRegistry if present
    const registry = await prisma.docRegistry.findUnique({ where: { docId } });

    if (registry) {
      return NextResponse.json({
        docId: registry.docId,
        ocid: registry.ocid,
        title: registry.title,
        mimeType: registry.mimeType,
        sizeBytes: registry.sizeBytes,
        originalUrl: registry.originalUrl,
        status: registry.status,
        errorMessage: registry.errorMessage,
        fetchedAt: registry.fetchedAt.toISOString(),
        lastAccessedAt: registry.lastAccessedAt.toISOString(),
        accessCount: registry.accessCount,
      });
    }

    // Fallback to Document table
    const doc = await prisma.document.findFirst({ where: { docId } });
    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json({
      docId,
      ocid: doc.ocid,
      title: doc.title,
      mimeType: doc.format,
      originalUrl: doc.url,
      source: 'document-table',
      datePublished: doc.datePublished?.toISOString() ?? null,
      dateModified: doc.dateModified?.toISOString() ?? null,
    });
  } catch (error) {
    console.error('❌ Error fetching document metadata:', error);
    return NextResponse.json({ error: 'Failed to fetch document metadata' }, { status: 500 });
  }
}

