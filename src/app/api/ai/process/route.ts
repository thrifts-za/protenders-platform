/**
 * AI Process API
 * POST /api/ai/process - Enqueue a document for AI processing
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const documentId = (body.documentId || '').toString();
    const provider = (body.provider || 'puter').toString();
    const processingType = (body.processingType || 'analyze').toString();

    if (!documentId) {
      return NextResponse.json({ error: 'documentId is required' }, { status: 400 });
    }

    const job = await prisma.aIDocumentProcessing.create({
      data: { documentId, provider, processingType, status: 'pending' },
    });

    return NextResponse.json(
      { message: 'Processing enqueued', jobId: job.id, provider: job.provider, status: job.status },
      { status: 202 }
    );
  } catch (error) {
    console.error('❌ Error enqueuing AI processing:', error);
    return NextResponse.json({ error: 'Failed to enqueue processing' }, { status: 500 });
  }
}

