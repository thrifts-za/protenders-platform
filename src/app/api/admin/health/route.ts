/**
 * Admin Health Check API Route
 * GET /api/admin/health
 *
 * Migrated from TenderAPI Express route
 * Returns system health status
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  checks: {
    database: {
      status: 'up' | 'down';
      responseTime: number;
      error?: string;
    };
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
  };
  version: string;
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Database health check
    const dbStartTime = Date.now();
    let dbStatus: 'up' | 'down' = 'up';
    let dbError: string | undefined;
    let dbResponseTime = 0;

    try {
      await prisma.$queryRaw`SELECT 1`;
      dbResponseTime = Date.now() - dbStartTime;
    } catch (error) {
      dbStatus = 'down';
      dbError = error instanceof Error ? error.message : 'Database connection failed';
      dbResponseTime = Date.now() - dbStartTime;
    }

    // Memory usage
    const memUsage = process.memoryUsage();
    const memoryPercentage = Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100);

    // Determine overall health status
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    if (dbStatus === 'down') {
      overallStatus = 'unhealthy';
    } else if (memoryPercentage > 90 || dbResponseTime > 1000) {
      overallStatus = 'degraded';
    }

    const health: HealthStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {
        database: {
          status: dbStatus,
          responseTime: dbResponseTime,
          error: dbError,
        },
        memory: {
          used: memUsage.heapUsed,
          total: memUsage.heapTotal,
          percentage: memoryPercentage,
        },
      },
      version: process.env.npm_package_version || '0.1.0',
    };

    const duration = Date.now() - startTime;

    const headers = new Headers();
    headers.set('X-Response-Time', `${duration}ms`);

    const statusCode = overallStatus === 'unhealthy' ? 503 : 200;

    console.log(`Health check completed in ${duration}ms - Status: ${overallStatus}`);

    return NextResponse.json(health, { headers, status: statusCode });
  } catch (error) {
    console.error('Error in health check:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Health check failed',
      },
      { status: 503 }
    );
  }
}
