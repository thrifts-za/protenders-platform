/**
 * Feedback API Route
 * POST /api/feedback - Submit feedback from users
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const type = (body.type || '').toString();
    const title = (body.title || '').toString();
    const description = (body.description || '').toString();
    const email = body.email ? body.email.toString() : null;
    const priority = (body.priority || 'medium').toString();

    if (!type || !title || !description) {
      return NextResponse.json(
        { error: 'type, title and description are required' },
        { status: 400 }
      );
    }

    if (!['feature', 'bug', 'improvement', 'feedback'].includes(type)) {
      return NextResponse.json(
        { error: 'type must be one of feature|bug|improvement|feedback' },
        { status: 400 }
      );
    }

    if (!['low', 'medium', 'high', 'critical'].includes(priority)) {
      return NextResponse.json(
        { error: 'priority must be one of low|medium|high|critical' },
        { status: 400 }
      );
    }

    const feedback = await prisma.feedback.create({
      data: {
        type,
        title,
        description,
        email,
        priority,
        status: 'pending',
        userAgent: request.headers.get('user-agent') || undefined,
        ipAddress:
          request.headers.get('x-forwarded-for') ||
          request.headers.get('x-real-ip') ||
          undefined,
      },
    });

    return NextResponse.json(
      {
        id: feedback.id,
        type: feedback.type,
        title: feedback.title,
        description: feedback.description,
        email: feedback.email,
        priority: feedback.priority,
        status: feedback.status,
        createdAt: feedback.createdAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ Error submitting feedback:', error);
    return NextResponse.json(
      {
        error: 'Failed to submit feedback',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

