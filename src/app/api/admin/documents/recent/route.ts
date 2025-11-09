/**
 * Admin Recent Documents
 * GET /api/admin/documents/recent
 *
 * Migrated from TenderAPI Express route
 * Returns recent tender documents from latest releases
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from '@/lib/auth-middleware';

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_request: NextRequest) {
  try {
    await requireAdmin();
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 }
    );
  }

  try {
    const releases = await prisma.oCDSRelease.findMany({
      orderBy: { date: "desc" },
      take: 50,
      select: { json: true, ocid: true, tenderTitle: true, date: true },
    });

    const documents: Array<{
      ocid: string;
      tenderTitle: string | null;
      date: Date;
      title?: string;
      url?: string;
      format?: string;
    }> = [];

    for (const release of releases) {
      const data = JSON.parse(release.json);
      const docs = data.tender?.documents || [];
      for (const doc of docs.slice(0, 3)) {
        documents.push({
          ocid: release.ocid,
          tenderTitle: release.tenderTitle,
          date: release.date,
          title: doc.title,
          url: doc.url,
          format: doc.format,
        });
      }
    }

    return NextResponse.json({ data: documents.slice(0, 100) });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}
