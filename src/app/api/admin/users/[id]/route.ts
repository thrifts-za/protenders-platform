/**
 * Admin User Management API
 * DELETE /api/admin/users/[id] - Delete a user
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Prevent admin from deleting themselves
    if (session.user.id === id) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      select: { email: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete user (cascade will delete related records)
    await prisma.user.delete({
      where: { id },
    });

    console.log(`✅ Admin deleted user: ${user.email} (${id})`);

    return NextResponse.json(
      {
        message: "User deleted successfully",
        deletedUser: { id, email: user.email },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Admin delete user error:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
