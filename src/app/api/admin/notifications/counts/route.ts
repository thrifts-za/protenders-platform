/**
 * Admin Notifications Counts API
 * GET /api/admin/notifications/counts
 *
 * Returns counts of unread/new submissions across all admin areas:
 * - Contact submissions (status: unread)
 * - Waiting list entries (status: pending)
 * - Feedback (status: pending)
 * - New users (registered in last 7 days, not viewed by admin)
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    // Calculate date 7 days ago for "new users"
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Fetch all counts in parallel
    const [
      unreadContactSubmissions,
      pendingWaitingList,
      pendingFeedback,
      newUsers,
    ] = await Promise.all([
      // Contact submissions with "unread" status
      prisma.contactSubmission.count({
        where: {
          status: 'unread',
        },
      }),

      // Waiting list entries with "pending" status
      prisma.waitingListEntry.count({
        where: {
          status: 'pending',
        },
      }),

      // Feedback with "pending" status
      prisma.feedback.count({
        where: {
          status: 'pending',
        },
      }),

      // New users registered in last 7 days (excluding admin users)
      prisma.user.count({
        where: {
          createdAt: {
            gte: sevenDaysAgo,
          },
          role: {
            in: ['USER', 'VIEWER'], // Exclude ADMIN and DEV
          },
        },
      }),
    ]);

    // Calculate total unread count
    const total =
      unreadContactSubmissions +
      pendingWaitingList +
      pendingFeedback +
      newUsers;

    const response = {
      total,
      counts: {
        contactSubmissions: unreadContactSubmissions,
        waitingList: pendingWaitingList,
        feedback: pendingFeedback,
        users: newUsers,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ Error fetching notification counts:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch notification counts',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
