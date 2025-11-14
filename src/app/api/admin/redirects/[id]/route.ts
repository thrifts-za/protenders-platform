import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * PUT /api/admin/redirects/[id]
 * Update an existing redirect
 */
export async function PUT(
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
    const body = await request.json();
    const { fromPath, toPath, statusCode, isActive, preserveQuery, notes } = body;

    // Check if redirect exists
    const existing = await prisma.redirect.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Redirect not found" },
        { status: 404 }
      );
    }

    // If fromPath is being changed, check for conflicts
    if (fromPath && fromPath !== existing.fromPath) {
      const conflict = await prisma.redirect.findUnique({
        where: { fromPath },
      });

      if (conflict) {
        return NextResponse.json(
          { error: "A redirect for this path already exists" },
          { status: 400 }
        );
      }
    }

    // Update redirect
    const redirect = await prisma.redirect.update({
      where: { id },
      data: {
        fromPath,
        toPath,
        statusCode,
        isActive,
        preserveQuery,
        notes,
      },
    });

    return NextResponse.json({ redirect });
  } catch (error) {
    console.error("Error updating redirect:", error);
    return NextResponse.json(
      { error: "Failed to update redirect" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/redirects/[id]
 * Delete a redirect
 */
export async function DELETE(
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

    // Delete redirect
    await prisma.redirect.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting redirect:", error);
    return NextResponse.json(
      { error: "Failed to delete redirect" },
      { status: 500 }
    );
  }
}
