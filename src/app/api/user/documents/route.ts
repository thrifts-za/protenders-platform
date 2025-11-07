/**
 * User Documents API
 * GET /api/user/documents - List user's uploaded documents (Puter)
 * POST /api/user/documents - Register a Puter document
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const docs = await prisma.puterDocument.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: { id: true, puterFileId: true, category: true, metadata: true, createdAt: true, updatedAt: true },
    });

    return NextResponse.json({
      data: docs.map((d) => ({
        id: d.id,
        puterFileId: d.puterFileId,
        category: d.category,
        metadata: d.metadata ? JSON.parse(d.metadata) : null,
        createdAt: d.createdAt.toISOString(),
        updatedAt: d.updatedAt.toISOString(),
      })),
      total: docs.length,
    });
  } catch (error) {
    console.error('❌ Error listing user documents:', error);
    return NextResponse.json({ error: 'Failed to list documents' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const body = await request.json();
    const puterFileId = (body.puterFileId || '').toString();
    if (!puterFileId) return NextResponse.json({ error: 'puterFileId is required' }, { status: 400 });

    const category = body.category ? body.category.toString() : null;
    const metadata = body.metadata ? JSON.stringify(body.metadata) : null;

    const doc = await prisma.puterDocument.create({
      data: {
        puterFileId,
        userId: user.id,
        category,
        metadata,
      },
    });

    return NextResponse.json(
      {
        id: doc.id,
        puterFileId: doc.puterFileId,
        category: doc.category,
        metadata: doc.metadata ? JSON.parse(doc.metadata) : null,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ Error registering document:', error);
    return NextResponse.json({ error: 'Failed to register document' }, { status: 500 });
  }
}

