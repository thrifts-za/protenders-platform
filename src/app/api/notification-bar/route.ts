/**
 * Notification Bar API Route
 * GET /api/notification-bar
 *
 * Returns notification bar message for public display
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/notification-bar
 * Get notification bar message
 */
export async function GET() {
  try {
    let message = '🚀 Beta Version - Best viewed on desktop for optimal experience';

    try {
      const storedConfig = await prisma.platformConfig.findFirst({
        where: { key: 'notificationBar' }
      });
      if (storedConfig && storedConfig.value) {
        const parsed = JSON.parse(storedConfig.value as string);
        message = parsed.message || message;
      }
    } catch (dbError) {
      // If table doesn't exist or error, use default
      console.warn('Could not fetch notification bar config:', dbError);
    }

    return NextResponse.json({
      message,
      enabled: true,
    });
  } catch (error) {
    console.error('Error fetching notification bar:', error);

    return NextResponse.json(
      {
        message: '🚀 Beta Version - Best viewed on desktop for optimal experience',
        enabled: true,
      },
      { status: 200 } // Still return 200 with default message
    );
  }
}
