/**
 * Tender Packs API
 * GET /api/packs - List user's packs
 * POST /api/packs - Create a new pack
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '20')));
    const skip = (page - 1) * pageSize;

    const [packs, total] = await Promise.all([
      prisma.tenderPack.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: pageSize,
        select: {
          id: true,
          name: true,
          description: true,
          isPublic: true,
          tenderCount: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.tenderPack.count({ where: { userId: user.id } }),
    ]);

    return NextResponse.json({
      data: packs.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        isPublic: p.isPublic,
        tenderCount: p.tenderCount,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('❌ Error listing packs:', error);
    return NextResponse.json({ error: 'Failed to list packs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const body = await request.json();
    const name = (body.name || '').toString().trim();
    const description = body.description ? body.description.toString() : null;
    const isPublic = Boolean(body.isPublic);

    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    const pack = await prisma.tenderPack.create({
      data: {
        userId: user.id,
        name,
        description,
        isPublic,
      },
    });

    return NextResponse.json(
      {
        id: pack.id,
        name: pack.name,
        description: pack.description,
        isPublic: pack.isPublic,
        tenderCount: pack.tenderCount,
        createdAt: pack.createdAt.toISOString(),
        updatedAt: pack.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ Error creating pack:', error);
    return NextResponse.json({ error: 'Failed to create pack' }, { status: 500 });
  }
}

