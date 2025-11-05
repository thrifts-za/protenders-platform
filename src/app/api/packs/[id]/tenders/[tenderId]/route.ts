/**
 * Pack Tenders Removal API
 * DELETE /api/packs/:id/tenders/:tenderId - Remove tender from pack
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; tenderId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    const { id, tenderId } = await params;

    const pack = await prisma.tenderPack.findUnique({ where: { id } });
    if (!pack || pack.userId !== user.id) {
      return NextResponse.json({ error: 'Pack not found' }, { status: 404 });
    }

    const link = await prisma.tenderPackTender.findUnique({
      where: { packId_tenderId: { packId: id, tenderId } },
    });
    if (!link) return NextResponse.json({ error: 'Not in pack' }, { status: 404 });

    await prisma.tenderPackTender.delete({
      where: { packId_tenderId: { packId: id, tenderId } },
    });

    const count = await prisma.tenderPackTender.count({ where: { packId: id } });
    await prisma.tenderPack.update({ where: { id }, data: { tenderCount: count } });

    return NextResponse.json({ message: 'Tender removed from pack', tenderId, packId: id });
  } catch (error) {
    console.error('❌ Error removing tender from pack:', error);
    return NextResponse.json({ error: 'Failed to remove tender from pack' }, { status: 500 });
  }
}

