/**
 * User Preferences API Route
 * GET /api/user/preferences - Get user preferences
 * PUT /api/user/preferences - Update user preferences
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/user/preferences
 * Get user preferences
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
      include: {
        preferences: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // If no preferences exist, return defaults
    if (!user.preferences) {
      return NextResponse.json({
        defaultSearchFilters: null,
        notificationSettings: {
          email: true,
          alertEmails: true,
        },
        dashboardLayout: null,
        theme: 'light',
        language: 'en',
        timezone: 'Africa/Johannesburg',
      });
    }

    // Parse JSON fields
    const preferences = {
      id: user.preferences.id,
      defaultSearchFilters: user.preferences.defaultSearchFilters
        ? JSON.parse(user.preferences.defaultSearchFilters)
        : null,
      notificationSettings: user.preferences.notificationSettings
        ? JSON.parse(user.preferences.notificationSettings)
        : { email: true, alertEmails: true },
      dashboardLayout: user.preferences.dashboardLayout
        ? JSON.parse(user.preferences.dashboardLayout)
        : null,
      theme: user.preferences.theme || 'light',
      language: user.preferences.language || 'en',
      timezone: user.preferences.timezone || 'Africa/Johannesburg',
      createdAt: user.preferences.createdAt.toISOString(),
      updatedAt: user.preferences.updatedAt.toISOString(),
    };

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('❌ Error fetching preferences:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch preferences',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user/preferences
 * Update user preferences
 */
export async function PUT(request: NextRequest) {
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

    // Validate theme
    if (body.theme && !['light', 'dark', 'auto'].includes(body.theme)) {
      return NextResponse.json(
        { error: 'theme must be "light", "dark" or "auto"' },
        { status: 400 }
      );
    }

    // Upsert preferences
    const preferences = await prisma.userPreferences.upsert({
      where: { userId: user.id },
      update: {
        defaultSearchFilters:
          body.defaultSearchFilters !== undefined
            ? JSON.stringify(body.defaultSearchFilters)
            : undefined,
        notificationSettings:
          body.notificationSettings !== undefined
            ? JSON.stringify(body.notificationSettings)
            : undefined,
        dashboardLayout:
          body.dashboardLayout !== undefined
            ? JSON.stringify(body.dashboardLayout)
            : undefined,
        theme: body.theme !== undefined ? body.theme : undefined,
        language: body.language !== undefined ? body.language : undefined,
        timezone: body.timezone !== undefined ? body.timezone : undefined,
      },
      create: {
        userId: user.id,
        defaultSearchFilters: body.defaultSearchFilters
          ? JSON.stringify(body.defaultSearchFilters)
          : null,
        notificationSettings: body.notificationSettings
          ? JSON.stringify(body.notificationSettings)
          : JSON.stringify({ email: true, alertEmails: true }),
        dashboardLayout: body.dashboardLayout
          ? JSON.stringify(body.dashboardLayout)
          : null,
        theme: body.theme || 'light',
        language: body.language || 'en',
        timezone: body.timezone || 'Africa/Johannesburg',
      },
    });

    // Parse and format response
    const formattedPreferences = {
      id: preferences.id,
      defaultSearchFilters: preferences.defaultSearchFilters
        ? JSON.parse(preferences.defaultSearchFilters)
        : null,
      notificationSettings: preferences.notificationSettings
        ? JSON.parse(preferences.notificationSettings)
        : { email: true, alertEmails: true },
      dashboardLayout: preferences.dashboardLayout
        ? JSON.parse(preferences.dashboardLayout)
        : null,
      theme: preferences.theme || 'light',
      language: preferences.language || 'en',
      timezone: preferences.timezone || 'Africa/Johannesburg',
      createdAt: preferences.createdAt.toISOString(),
      updatedAt: preferences.updatedAt.toISOString(),
    };

    return NextResponse.json(formattedPreferences);
  } catch (error) {
    console.error('❌ Error updating preferences:', error);

    return NextResponse.json(
      {
        error: 'Failed to update preferences',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
