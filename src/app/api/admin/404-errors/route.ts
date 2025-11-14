import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/admin/404-errors
 * Get all 404 errors, ordered by hit count
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const errors = await prisma.errorLog.findMany({
      where: {
        statusCode: 404,
      },
      orderBy: {
        hitCount: "desc",
      },
      take: 100, // Limit to top 100 errors
      select: {
        id: true,
        path: true,
        hitCount: true,
        referer: true,
        userAgent: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ errors });
  } catch (error) {
    console.error("Error fetching 404 errors:", error);
    return NextResponse.json(
      { error: "Failed to fetch 404 errors" },
      { status: 500 }
    );
  }
}
