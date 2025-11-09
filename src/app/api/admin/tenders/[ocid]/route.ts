/**
 * Admin Tender Detail
 * GET /api/admin/tenders/:ocid
 *
 * Migrated from TenderAPI Express route
 * Returns detailed tender information for admin catalog
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-middleware";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ ocid: string }> }
) {
  // Require admin authentication
  try {
    await requireAdmin();
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 }
    );
  }

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

/**
 * Update tender enrichment/admin-editable fields
 * PUT /api/admin/tenders/:ocid
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ ocid: string }> }
) {
  try {
    const { ocid } = await params;
    const body = await request.json();

    // Whitelist editable fields
    const allowed: Record<string, any> = {};
    const map = [
      'tenderTitle',
      'contactPerson',
      'contactEmail',
      'briefingDate',
      'briefingTime',
      'briefingVenue',
      'briefingMeetingLink',
      'hasBriefing',
      'briefingCompulsory',
      'specialConditions',
    ];

    for (const k of map) {
      if (k in body) allowed[k] = body[k];
    }

    if (Object.keys(allowed).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields provided' },
        { status: 400 }
      );
    }

    // Update all releases for this OCID to keep denormalized fields consistent
    const res = await prisma.oCDSRelease.updateMany({
      where: { ocid },
      data: allowed,
    });

    // Log audit (best effort)
    try {
      await prisma.auditLog.create({
        data: {
          userId: 'admin',
          action: 'UPDATE',
          entity: 'OCDSRelease',
          entityId: ocid,
          after: JSON.stringify(allowed),
        },
      });
    } catch {}

    // Return latest record
    const latest = await prisma.oCDSRelease.findFirst({
      where: { ocid },
      orderBy: { date: 'desc' },
      select: {
        ocid: true,
        tenderTitle: true,
        contactPerson: true,
        contactEmail: true,
        briefingDate: true,
        briefingTime: true,
        briefingVenue: true,
        briefingMeetingLink: true,
        hasBriefing: true,
        briefingCompulsory: true,
        specialConditions: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ updated: res.count, tender: latest });
  } catch (error) {
    console.error('Error updating tender:', error);
    return NextResponse.json(
      { error: 'Failed to update tender' },
      { status: 500 }
    );
  }
}
