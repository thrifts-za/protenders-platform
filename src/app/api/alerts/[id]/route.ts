/**
 * Alert Detail API Route
 * PUT /api/alerts/:id - Update alert
 * DELETE /api/alerts/:id - Delete alert
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * PUT /api/alerts/:id
 * Update an existing alert
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Check if alert exists and belongs to user
    const existingAlert = await prisma.savedSearch.findUnique({
      where: { id },
    });

    if (!existingAlert) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      );
    }

    if (existingAlert.userId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden - Alert does not belong to user' },
        { status: 403 }
      );
    }

    // Validate alertFrequency if provided
    if (body.alertFrequency && !['none', 'daily', 'weekly'].includes(body.alertFrequency)) {
      return NextResponse.json(
        { error: 'alertFrequency must be "none", "daily" or "weekly"' },
        { status: 400 }
      );
    }

    // Update the alert
    const updatedAlert = await prisma.savedSearch.update({
      where: { id },
      data: {
        name: body.name !== undefined ? body.name : existingAlert.name,
        keywords: body.keywords !== undefined ? body.keywords : existingAlert.keywords,
        categories:
          body.categories !== undefined
            ? JSON.stringify(body.categories)
            : existingAlert.categories,
        closingInDays:
          body.closingInDays !== undefined
            ? body.closingInDays
            : existingAlert.closingInDays,
        submissionMethods:
          body.submissionMethods !== undefined
            ? JSON.stringify(body.submissionMethods)
            : existingAlert.submissionMethods,
        buyer: body.buyer !== undefined ? body.buyer : existingAlert.buyer,
        status: body.status !== undefined ? body.status : existingAlert.status,
        alertFrequency:
          body.alertFrequency !== undefined
            ? body.alertFrequency
            : existingAlert.alertFrequency,
      },
    });

    // Format response
    const formattedAlert = {
      id: updatedAlert.id,
      name: updatedAlert.name,
      keywords: updatedAlert.keywords,
      categories: updatedAlert.categories
        ? JSON.parse(updatedAlert.categories)
        : [],
      closingInDays: updatedAlert.closingInDays,
      submissionMethods: updatedAlert.submissionMethods
        ? JSON.parse(updatedAlert.submissionMethods)
        : [],
      buyer: updatedAlert.buyer,
      status: updatedAlert.status,
      alertFrequency: updatedAlert.alertFrequency,
      lastAlertSent: updatedAlert.lastAlertSent?.toISOString(),
      createdAt: updatedAlert.createdAt.toISOString(),
      updatedAt: updatedAlert.updatedAt.toISOString(),
    };

    return NextResponse.json(formattedAlert);
  } catch (error) {
    console.error('❌ Error updating alert:', error);

    return NextResponse.json(
      {
        error: 'Failed to update alert',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/alerts/:id
 * Delete an alert
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { id } = await params;

    // Check if alert exists and belongs to user
    const existingAlert = await prisma.savedSearch.findUnique({
      where: { id },
    });

    if (!existingAlert) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      );
    }

    if (existingAlert.userId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden - Alert does not belong to user' },
        { status: 403 }
      );
    }

    // Delete the alert (cascade will delete related AlertLogs)
    await prisma.savedSearch.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Alert deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error deleting alert:', error);

    return NextResponse.json(
      {
        error: 'Failed to delete alert',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
