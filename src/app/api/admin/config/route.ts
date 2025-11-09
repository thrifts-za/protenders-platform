/**
 * Admin Config API Route
 * GET /api/admin/config
 * PUT /api/admin/config
 *
 * Returns and updates platform configuration
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/admin/config
 * Get platform configuration
 */
export async function GET(request: NextRequest) {
  try {
    // Try to get notification bar config from database
    let notificationBarMessage = '🚀 Beta Version - Best viewed on desktop for optimal experience';

    try {
      const storedConfig = await prisma.platformConfig.findFirst({
        where: { key: 'notificationBar' }
      });
      if (storedConfig && storedConfig.value) {
        const parsed = JSON.parse(storedConfig.value as string);
        notificationBarMessage = parsed.message || notificationBarMessage;
      }
    } catch (dbError) {
      // If table doesn't exist or error, use default
      console.warn('Could not fetch notification bar config:', dbError);
    }

    // Return platform configuration
    const config = {
      platform: {
        name: 'ProTenders',
        version: '2.0',
        environment: process.env.NODE_ENV || 'development',
      },
      features: {
        alerts: true,
        savedSearches: true,
        tenderPacks: true,
        aiIntelligence: true,
        analytics: true,
      },
      notificationBar: {
        message: notificationBarMessage,
        enabled: true,
      },
      sync: {
        enabled: true,
        autoSync: true,
        syncInterval: '0 2 * * *', // Daily at 2 AM
        maxPagesPerDay: 2,
        maxScrapeDetails: 50,
      },
      limits: {
        maxAlertsPerUser: 10,
        maxSavedTendersPerUser: 100,
        maxSearchResultsPerPage: 50,
      },
      api: {
        rateLimit: 100,
        rateLimitWindow: '15m',
        maxRequestSize: '10mb',
      },
    };

    return NextResponse.json({
      config,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching config:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch config',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/config
 * Update platform configuration
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Handle notification bar updates
    if (body.notificationBar) {
      try {
        await prisma.platformConfig.upsert({
          where: { key: 'notificationBar' },
          create: {
            key: 'notificationBar',
            value: JSON.stringify({ message: body.notificationBar.message }),
          },
          update: {
            value: JSON.stringify({ message: body.notificationBar.message }),
            updatedAt: new Date(),
          },
        });
      } catch (dbError) {
        console.warn('Could not persist notification bar config:', dbError);
        // Continue even if database update fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Configuration updated',
      config: body,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating config:', error);

    return NextResponse.json(
      {
        error: 'Failed to update config',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
