import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

/**
 * GET /api/admin/redirects
 * List all redirects
 */
export async function GET() {
  try {
    const session = await auth();

    // Check if user is admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const redirects = await prisma.redirect.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ redirects });
  } catch (error) {
    console.error("Error fetching redirects:", error);
    return NextResponse.json(
      { error: "Failed to fetch redirects" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/redirects
 * Create a new redirect
 */
export async function POST(request: Request) {
  try {
    const session = await auth();

    // Check if user is admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      fromPath,
      toPath,
      statusCode = 301,
      isActive = true,
      preserveQuery = true,
      notes,
    } = body;

    // Validate required fields
    if (!fromPath || !toPath) {
      return NextResponse.json(
        { error: "fromPath and toPath are required" },
        { status: 400 }
      );
    }

    // Check if redirect already exists
    const existing = await prisma.redirect.findUnique({
      where: { fromPath },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A redirect for this path already exists" },
        { status: 400 }
      );
    }

    // Create redirect
    const redirect = await prisma.redirect.create({
      data: {
        fromPath,
        toPath,
        statusCode,
        isActive,
        preserveQuery,
        notes,
        createdBy: session.user.id,
      },
    });

    return NextResponse.json({ redirect }, { status: 201 });
  } catch (error) {
    console.error("Error creating redirect:", error);
    return NextResponse.json(
      { error: "Failed to create redirect" },
      { status: 500 }
    );
  }
}
