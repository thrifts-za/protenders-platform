/**
 * Save Search API Route
 * POST /api/savesearch - Save search criteria (creates alert)
 *
 * This is a convenience endpoint that creates a SavedSearch with optional alerting
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/savesearch
 * Save search criteria and optionally create an alert
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Validate alertFrequency if provided
    const alertFrequency = body.alertFrequency || 'none';
    if (!['none', 'daily', 'weekly'].includes(alertFrequency)) {
      return NextResponse.json(
        { error: 'alertFrequency must be "none", "daily" or "weekly"' },
        { status: 400 }
      );
    }

    // Create the saved search
    const savedSearch = await prisma.savedSearch.create({
      data: {
        userId: user.id,
        name: body.name,
        keywords: body.keywords || null,
        categories: body.categories
          ? JSON.stringify(body.categories)
          : null,
        closingInDays: body.closingInDays || null,
        submissionMethods: body.submissionMethods
          ? JSON.stringify(body.submissionMethods)
          : null,
        buyer: body.buyer || null,
        status: body.status || null,
        alertFrequency,
      },
    });

    // Format response
    const formattedSavedSearch = {
      id: savedSearch.id,
      name: savedSearch.name,
      keywords: savedSearch.keywords,
      categories: savedSearch.categories
        ? JSON.parse(savedSearch.categories)
        : [],
      closingInDays: savedSearch.closingInDays,
      submissionMethods: savedSearch.submissionMethods
        ? JSON.parse(savedSearch.submissionMethods)
        : [],
      buyer: savedSearch.buyer,
      status: savedSearch.status,
      alertFrequency: savedSearch.alertFrequency,
      lastAlertSent: savedSearch.lastAlertSent?.toISOString(),
      createdAt: savedSearch.createdAt.toISOString(),
      updatedAt: savedSearch.updatedAt.toISOString(),
      message:
        alertFrequency !== 'none'
          ? `Search saved and alert created with ${alertFrequency} frequency`
          : 'Search saved successfully',
    };

    return NextResponse.json(formattedSavedSearch, { status: 201 });
  } catch (error) {
    console.error('❌ Error saving search:', error);

    return NextResponse.json(
      {
        error: 'Failed to save search',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
