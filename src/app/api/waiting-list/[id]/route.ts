import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/waiting-list/[id]
 * Update waiting list entry status (Admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role
    // @ts-expect-error - role exists on session.user
    if (session.user.role !== 'ADMIN' && session.user.role !== 'DEV') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    // Validate status if provided
    const validStatuses = ['pending', 'contacted', 'converted', 'declined'];
    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    // Build update data
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (body.status) {
      updateData.status = body.status;

      // Set timestamps based on status
      if (body.status === 'contacted' && !body.contactedAt) {
        updateData.contactedAt = new Date();
      }
      if (body.status === 'converted' && !body.convertedAt) {
        updateData.convertedAt = new Date();
      }
    }

    if (body.contactedAt) {
      updateData.contactedAt = new Date(body.contactedAt);
    }

    if (body.convertedAt) {
      updateData.convertedAt = new Date(body.convertedAt);
    }

    // Update entry
    const entry = await prisma.waitingListEntry.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, entry });
  } catch (error) {
    console.error('Waiting list update error:', error);
    return NextResponse.json(
      {
        error: 'Failed to update waiting list entry',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/waiting-list/[id]
 * Delete waiting list entry (Admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role
    // @ts-expect-error - role exists on session.user
    if (session.user.role !== 'ADMIN' && session.user.role !== 'DEV') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    // Delete entry
    await prisma.waitingListEntry.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Waiting list delete error:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete waiting list entry',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
