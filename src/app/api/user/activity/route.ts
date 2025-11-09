/**
 * User Activity Logging API
 * POST /api/user/activity - Log a user activity
 * GET /api/user/activity - Get user's recent activities
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { logActivity, getUserActivities } from '@/lib/activity';

export const dynamic = 'force-dynamic';

/**
 * POST /api/user/activity
 * Log a user activity
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, entity, entityId, metadata } = body;

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    // Get user ID
    const { prisma } = await import('@/lib/prisma');
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await logActivity({
      userId: user.id,
      action,
      entity,
      entityId,
      metadata,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('❌ Error logging activity:', error);
    return NextResponse.json(
      { error: 'Failed to log activity' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/user/activity
 * Get user's recent activities
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    // Get user ID
    const { prisma } = await import('@/lib/prisma');
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const activities = await getUserActivities(user.id, limit);

    return NextResponse.json({ activities }, { status: 200 });
  } catch (error) {
    console.error('❌ Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}
