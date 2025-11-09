/**
 * Admin Feedback Detail API Route
 * PATCH /api/admin/feedback/:id
 *
 * Update feedback status
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-middleware';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * PATCH /api/admin/feedback/:id
 * Update feedback status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const { status } = body;

    if (!status || !['pending', 'reviewed', 'resolved', 'dismissed'].includes(status)) {
      return NextResponse.json(
        {
          error: 'Invalid status',
          message: 'Status must be one of: pending, reviewed, resolved, dismissed',
        },
        { status: 400 }
      );
    }

    // Update feedback
    const feedback = await prisma.feedback
      .update({
        where: { id },
        data: {
          status,
          updatedAt: new Date(),
        },
      })
      .catch(() => null);

    if (!feedback) {
      return NextResponse.json(
        {
          error: 'Feedback not found',
          message: `Feedback with id ${id} does not exist`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      feedback,
    });
  } catch (error) {
    console.error('Error updating feedback:', error);

    return NextResponse.json(
      {
        error: 'Failed to update feedback',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
