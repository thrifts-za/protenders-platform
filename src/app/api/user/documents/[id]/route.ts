/**
 * User Document Delete API
 * DELETE /api/user/documents/:id
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    const { id } = await params;

    const doc = await prisma.puterDocument.findUnique({ where: { id } });
    if (!doc || doc.userId !== user.id) return NextResponse.json({ error: 'Document not found' }, { status: 404 });

    await prisma.puterDocument.delete({ where: { id } });
    return NextResponse.json({ message: 'Document deleted' });
  } catch (error) {
    console.error('❌ Error deleting document:', error);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}

