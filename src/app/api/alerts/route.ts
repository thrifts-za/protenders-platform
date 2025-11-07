/**
 * Alerts API Route
 * GET /api/alerts - List user alerts
 * POST /api/alerts - Create new alert
 *
 * Alerts are stored as SavedSearch with alertFrequency != 'none'
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/alerts
 * List all alerts for the authenticated user
 */
export async function GET(request: NextRequest) {
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

    // Get all saved searches that have alerting enabled
    const alerts = await prisma.savedSearch.findMany({
      where: {
        userId: user.id,
        alertFrequency: {
          not: 'none',
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        _count: {
          select: {
            alertLogs: true,
          },
        },
      },
    });

    // Format response
    const formattedAlerts = alerts.map((alert) => ({
      id: alert.id,
      name: alert.name,
      keywords: alert.keywords,
      categories: alert.categories ? JSON.parse(alert.categories) : [],
      closingInDays: alert.closingInDays,
      submissionMethods: alert.submissionMethods
        ? JSON.parse(alert.submissionMethods)
        : [],
      buyer: alert.buyer,
      status: alert.status,
      alertFrequency: alert.alertFrequency,
      lastAlertSent: alert.lastAlertSent?.toISOString(),
      createdAt: alert.createdAt.toISOString(),
      updatedAt: alert.updatedAt.toISOString(),
      executionCount: alert._count.alertLogs,
    }));

    return NextResponse.json({
      data: formattedAlerts,
      total: formattedAlerts.length,
    });
  } catch (error) {
    console.error('❌ Error fetching alerts:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch alerts',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/alerts
 * Create a new alert
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
    if (!body.name || !body.alertFrequency) {
      return NextResponse.json(
        { error: 'Name and alertFrequency are required' },
        { status: 400 }
      );
    }

    // Validate alertFrequency
    if (!['daily', 'weekly'].includes(body.alertFrequency)) {
      return NextResponse.json(
        { error: 'alertFrequency must be "daily" or "weekly"' },
        { status: 400 }
      );
    }

    // Create the alert (SavedSearch)
    const alert = await prisma.savedSearch.create({
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
        alertFrequency: body.alertFrequency,
      },
    });

    // Format response
    const formattedAlert = {
      id: alert.id,
      name: alert.name,
      keywords: alert.keywords,
      categories: alert.categories ? JSON.parse(alert.categories) : [],
      closingInDays: alert.closingInDays,
      submissionMethods: alert.submissionMethods
        ? JSON.parse(alert.submissionMethods)
        : [],
      buyer: alert.buyer,
      status: alert.status,
      alertFrequency: alert.alertFrequency,
      lastAlertSent: alert.lastAlertSent?.toISOString(),
      createdAt: alert.createdAt.toISOString(),
      updatedAt: alert.updatedAt.toISOString(),
    };

    return NextResponse.json(formattedAlert, { status: 201 });
  } catch (error) {
    console.error('❌ Error creating alert:', error);

    return NextResponse.json(
      {
        error: 'Failed to create alert',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
