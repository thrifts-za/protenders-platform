import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { suggestRedirectsFor404 } from "@/lib/error-logging";

/**
 * GET /api/admin/404-errors/[id]/suggestions
 * Get redirect suggestions for a 404 error
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Get the 404 error
    const error = await prisma.errorLog.findUnique({
      where: { id },
      select: { path: true },
    });

    if (!error) {
      return NextResponse.json(
        { error: "404 error not found" },
        { status: 404 }
      );
    }

    // Get suggestions
    const suggestions = await suggestRedirectsFor404(error.path);

    return NextResponse.json({ suggestions });
  } catch (err) {
    console.error("Error getting suggestions:", err);
    return NextResponse.json(
      { error: "Failed to get suggestions" },
      { status: 500 }
    );
  }
}
