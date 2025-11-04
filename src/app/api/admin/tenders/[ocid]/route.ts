/**
 * Admin Tender Detail
 * GET /api/admin/tenders/:ocid
 *
 * Migrated from TenderAPI Express route
 * Returns detailed tender information for admin catalog
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ ocid: string }> }
) {
  try {
    const { ocid } = await params;

    const tender = await prisma.oCDSRelease.findFirst({
      where: { ocid },
      orderBy: { date: "desc" },
    });

    if (!tender) {
      return NextResponse.json(
        { error: "Tender not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...tender,
      json: JSON.parse(tender.json),
    });
  } catch (error) {
    console.error("Error fetching tender detail:", error);
    return NextResponse.json(
      { error: "Failed to fetch tender detail" },
      { status: 500 }
    );
  }
}
