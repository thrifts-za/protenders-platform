import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-middleware';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Update submission status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Require admin authentication
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

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    const validStatuses = ['unread', 'read', 'replied', 'spam'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const submission = await prisma.contactSubmission.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(submission);
  } catch (error) {
    console.error('Error updating contact submission:', error);
    return NextResponse.json(
      { error: 'Failed to update submission' },
      { status: 500 }
    );
  }
}

// Delete submission
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Require admin authentication
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

    await prisma.contactSubmission.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting contact submission:', error);
    return NextResponse.json(
      { error: 'Failed to delete submission' },
      { status: 500 }
    );
  }
}
