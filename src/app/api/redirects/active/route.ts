import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/redirects/active
 * Returns all active redirects for middleware caching
 */
export async function GET() {
  try {
    const redirects = await prisma.redirect.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        fromPath: true,
        toPath: true,
        statusCode: true,
        preserveQuery: true,
      },
    });

    return NextResponse.json(redirects, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    console.error("Error fetching active redirects:", error);
    return NextResponse.json(
      { error: "Failed to fetch redirects" },
      { status: 500 }
    );
  }
}
