import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

/**
 * POST /api/waiting-list
 * Create a new waiting list entry
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingEntry = await prisma.waitingListEntry.findUnique({
      where: { email: body.email },
    });

    if (existingEntry) {
      return NextResponse.json(
        { error: 'Email already registered on waiting list' },
        { status: 409 }
      );
    }

    // Create waiting list entry
    const entry = await prisma.waitingListEntry.create({
      data: {
        name: body.name,
        email: body.email,
        company: body.company || null,
        phoneNumber: body.phoneNumber || null,
        jobTitle: body.jobTitle || null,
        interest: body.interest || 'medium',
        message: body.message || null,
        source: body.source || 'tender-page',
        referrer: body.referrer || null,
        userId: body.userId || null,
        status: 'pending',
      },
    });

    // Update user if authenticated
    if (body.userId) {
      try {
        await prisma.user.update({
          where: { id: body.userId },
          data: {
            waitingListStatus: 'waiting_list',
            waitingListDate: new Date(),
            rsvpInterest: body.interest,
          },
        });
      } catch (error) {
        console.error('Failed to update user:', error);
        // Don't fail the request if user update fails
      }
    }

    // TODO: Send notification email
    // await sendWaitingListEmail(entry);

    return NextResponse.json({
      success: true,
      entry: {
        id: entry.id,
        name: entry.name,
        email: entry.email,
        createdAt: entry.createdAt,
      },
    });
  } catch (error) {
    console.error('Waiting list creation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create waiting list entry',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/waiting-list
 * Get all waiting list entries (Admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where: any = {};
    if (status && status !== 'all') {
      where.status = status;
    }

    // Fetch entries with pagination
    const [entries, total] = await Promise.all([
      prisma.waitingListEntry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
            },
          },
        },
      }),
      prisma.waitingListEntry.count({ where }),
    ]);

    // Get statistics
    const stats = await prisma.waitingListEntry.groupBy({
      by: ['status'],
      _count: true,
    });

    const statusCounts = stats.reduce((acc, stat) => {
      acc[stat.status] = stat._count;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      entries,
      total,
      stats: {
        total,
        pending: statusCounts.pending || 0,
        contacted: statusCounts.contacted || 0,
        converted: statusCounts.converted || 0,
        declined: statusCounts.declined || 0,
      },
    });
  } catch (error) {
    console.error('Waiting list fetch error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch waiting list',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
