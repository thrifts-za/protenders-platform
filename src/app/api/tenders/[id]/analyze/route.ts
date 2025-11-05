/**
 * Tender Analyze API Route
 * POST /api/tenders/:id/analyze
 *
 * Enqueues analysis for a tender's documents.
 * Creates a placeholder AIDocumentProcessing job.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify tender exists (via OCDSRelease or Tender)
    const exists = await prisma.oCDSRelease.findFirst({
      where: { ocid: id },
      select: { ocid: true },
    });

    if (!exists) {
      return NextResponse.json(
        { error: 'Tender not found' },
        { status: 404 }
      );
    }

    // Create a placeholder AI processing job for the tender bundle
    const job = await prisma.aIDocumentProcessing.create({
      data: {
        documentId: `${id}-bundle`,
        provider: 'puter',
        processingType: 'analyze',
        status: 'pending',
      },
    });

    return NextResponse.json(
      {
        message: 'Analysis enqueued',
        jobId: job.id,
        provider: job.provider,
        status: job.status,
      },
      { status: 202 }
    );
  } catch (error) {
    console.error('❌ Error enqueuing tender analysis:', error);
    return NextResponse.json(
      {
        error: 'Failed to enqueue analysis',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

