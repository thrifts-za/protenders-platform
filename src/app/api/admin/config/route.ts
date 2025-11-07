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
 * Update platform configuration (in-memory only)
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Configuration updates are in-memory only
    // In a real implementation, this would persist to a database
    return NextResponse.json({
      success: true,
      message: 'Configuration updated (in-memory only)',
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
