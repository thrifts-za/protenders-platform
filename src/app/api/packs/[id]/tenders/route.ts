/**
 * Pack Tenders API
 * POST /api/packs/:id/tenders - Add a tender to a pack
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    const { id } = await params;

    const body = await request.json();
    const tenderId = (body.tenderId || '').toString();
    if (!tenderId) return NextResponse.json({ error: 'tenderId is required' }, { status: 400 });

    const pack = await prisma.tenderPack.findUnique({ where: { id } });
    if (!pack || pack.userId !== user.id) {
      return NextResponse.json({ error: 'Pack not found' }, { status: 404 });
    }

    const tender = await prisma.tender.findUnique({ where: { id: tenderId } });
    if (!tender) return NextResponse.json({ error: 'Tender not found' }, { status: 404 });

    await prisma.tenderPackTender.upsert({
      where: { packId_tenderId: { packId: id, tenderId } },
      update: {},
      create: { packId: id, tenderId },
    });

    // Update tenderCount
    const count = await prisma.tenderPackTender.count({ where: { packId: id } });
    await prisma.tenderPack.update({ where: { id }, data: { tenderCount: count } });

    return NextResponse.json({ message: 'Tender added to pack', tenderId, packId: id });
  } catch (error) {
    console.error('❌ Error adding tender to pack:', error);
    return NextResponse.json({ error: 'Failed to add tender to pack' }, { status: 500 });
  }
}

