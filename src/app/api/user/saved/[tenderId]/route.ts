/**
 * User Saved Tender Detail API Route
 * PUT /api/user/saved/:tenderId - Save/bookmark a tender
 * DELETE /api/user/saved/:tenderId - Remove saved tender
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * PUT /api/user/saved/:tenderId
 * Save/bookmark a tender (upsert)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ tenderId: string }> }
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

    const { tenderId } = await params;
    const body = await request.json();

    // Upsert tender if full tender data is provided
    if (body.tenderData) {
      const tenderData = body.tenderData;
      await prisma.tender.upsert({
        where: { id: tenderId },
        update: {
          title: tenderData.title || null,
          description: tenderData.description || null,
          mainProcurementCategory: tenderData.mainProcurementCategory || null,
          status: tenderData.status || null,
          endDate: tenderData.closingDate ? new Date(tenderData.closingDate) : null,
          valueAmount: tenderData.value?.amount || null,
          valueCurrency: tenderData.value?.currency || 'ZAR',
        },
        create: {
          id: tenderId,
          ocid: tenderData.ocid || tenderId,
          title: tenderData.title || 'Untitled Tender',
          description: tenderData.description || null,
          mainProcurementCategory: tenderData.mainProcurementCategory || null,
          status: tenderData.status || 'active',
          startDate: tenderData.publishedDate ? new Date(tenderData.publishedDate) : new Date(),
          endDate: tenderData.closingDate ? new Date(tenderData.closingDate) : null,
          valueAmount: tenderData.value?.amount || null,
          valueCurrency: tenderData.value?.currency || 'ZAR',
        },
      });
    } else {
      // Check if tender exists in database
      const tender = await prisma.tender.findUnique({
        where: { id: tenderId },
      });

      if (!tender) {
        return NextResponse.json(
          { error: 'Tender not found. Please provide tenderData in request body.' },
          { status: 404 }
        );
      }
    }

    // Upsert saved tender
    const savedTender = await prisma.savedTender.upsert({
      where: {
        userId_tenderId: {
          userId: user.id,
          tenderId,
        },
      },
      update: {
        notes: body.notes !== undefined ? body.notes : undefined,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        tenderId,
        notes: body.notes || null,
      },
      include: {
        tender: {
          select: {
            id: true,
            ocid: true,
            title: true,
            description: true,
            mainProcurementCategory: true,
            status: true,
            startDate: true,
            endDate: true,
            valueAmount: true,
            valueCurrency: true,
          },
        },
      },
    });

    // Format response
    const formattedSavedTender = {
      id: savedTender.id,
      tenderId: savedTender.tenderId,
      notes: savedTender.notes,
      savedAt: savedTender.createdAt.toISOString(),
      updatedAt: savedTender.updatedAt.toISOString(),
      tender: {
        id: savedTender.tender.id,
        ocid: savedTender.tender.ocid,
        title: savedTender.tender.title,
        description: savedTender.tender.description,
        mainProcurementCategory: savedTender.tender.mainProcurementCategory,
        status: savedTender.tender.status,
        startDate: savedTender.tender.startDate?.toISOString(),
        endDate: savedTender.tender.endDate?.toISOString(),
        valueAmount: savedTender.tender.valueAmount,
        valueCurrency: savedTender.tender.valueCurrency,
      },
    };

    return NextResponse.json(formattedSavedTender);
  } catch (error) {
    console.error('❌ Error saving tender:', error);

    return NextResponse.json(
      {
        error: 'Failed to save tender',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/saved/:tenderId
 * Remove a saved tender
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tenderId: string }> }
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

    const { tenderId } = await params;

    // Check if saved tender exists
    const savedTender = await prisma.savedTender.findUnique({
      where: {
        userId_tenderId: {
          userId: user.id,
          tenderId,
        },
      },
    });

    if (!savedTender) {
      return NextResponse.json(
        { error: 'Saved tender not found' },
        { status: 404 }
      );
    }

    // Delete the saved tender
    await prisma.savedTender.delete({
      where: {
        userId_tenderId: {
          userId: user.id,
          tenderId,
        },
      },
    });

    return NextResponse.json(
      { message: 'Saved tender removed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error removing saved tender:', error);

    return NextResponse.json(
      {
        error: 'Failed to remove saved tender',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
