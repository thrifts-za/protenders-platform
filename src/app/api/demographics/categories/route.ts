/**
 * PPPFA Categories API Route
 * GET /api/demographics/categories
 *
 * Returns all PPPFA (Preferential Procurement Policy Framework Act) categories
 * for tracking demographic empowerment spend
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/demographics/categories
 * Get all PPPFA categories with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    const categories = await prisma.pPPFACategory.findMany({
      where: activeOnly ? { active: true } : undefined,
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        active: true,
        sortOrder: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      categories,
      count: categories.length,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Error fetching PPPFA categories:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch PPPFA categories',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
