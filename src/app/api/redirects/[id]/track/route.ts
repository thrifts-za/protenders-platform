import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * POST /api/redirects/[id]/track
 * Tracks redirect usage analytics
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Update redirect analytics
    await prisma.redirect.update({
      where: { id },
      data: {
        hitCount: { increment: 1 },
        lastUsedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking redirect:", error);
    // Return success anyway to avoid blocking redirects
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
