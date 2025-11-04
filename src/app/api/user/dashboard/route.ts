/**
 * User Dashboard API Route
 * GET /api/user/dashboard - Get user dashboard data with stats
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/user/dashboard
 * Get comprehensive dashboard data for the authenticated user
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

    // Get user stats in parallel
    const [
      savedTendersCount,
      alertsCount,
      tenderPacksCount,
      recentSavedTenders,
      recentAlertLogs,
      activeAlerts,
    ] = await Promise.all([
      // Total saved tenders
      prisma.savedTender.count({
        where: { userId: user.id },
      }),

      // Total alerts (SavedSearch with alertFrequency != 'none')
      prisma.savedSearch.count({
        where: {
          userId: user.id,
          alertFrequency: { not: 'none' },
        },
      }),

      // Total tender packs
      prisma.tenderPack.count({
        where: { userId: user.id },
      }),

      // Recent saved tenders (last 5)
      prisma.savedTender.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          tender: {
            select: {
              id: true,
              ocid: true,
              title: true,
              mainProcurementCategory: true,
              status: true,
              endDate: true,
            },
          },
        },
      }),

      // Recent alert logs (last 10)
      prisma.alertLog.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          savedSearch: {
            select: {
              name: true,
            },
          },
        },
      }),

      // Active alerts
      prisma.savedSearch.findMany({
        where: {
          userId: user.id,
          alertFrequency: { not: 'none' },
        },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          alertFrequency: true,
          lastAlertSent: true,
          _count: {
            select: {
              alertLogs: true,
            },
          },
        },
      }),
    ]);

    // Format response
    const dashboard = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        memberSince: user.createdAt.toISOString(),
        lastLogin: user.lastLoginAt?.toISOString(),
      },
      stats: {
        savedTenders: savedTendersCount,
        activeAlerts: alertsCount,
        tenderPacks: tenderPacksCount,
      },
      recentActivity: {
        savedTenders: recentSavedTenders.map((saved) => ({
          id: saved.id,
          tenderId: saved.tender.id,
          tenderOcid: saved.tender.ocid,
          tenderTitle: saved.tender.title,
          category: saved.tender.mainProcurementCategory,
          status: saved.tender.status,
          closingDate: saved.tender.endDate?.toISOString(),
          savedAt: saved.createdAt.toISOString(),
        })),
        alertLogs: recentAlertLogs.map((log) => ({
          id: log.id,
          alertName: log.savedSearch.name,
          tendersFound: log.tendersFound,
          emailSent: log.emailSent,
          executedAt: log.createdAt.toISOString(),
          hasError: !!log.error,
        })),
      },
      activeAlerts: activeAlerts.map((alert) => ({
        id: alert.id,
        name: alert.name,
        frequency: alert.alertFrequency,
        lastExecuted: alert.lastAlertSent?.toISOString(),
        totalExecutions: alert._count.alertLogs,
      })),
    };

    return NextResponse.json(dashboard);
  } catch (error) {
    console.error('❌ Error fetching dashboard:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch dashboard',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
