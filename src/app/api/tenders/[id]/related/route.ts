import { NextResponse } from "next/server";
import { getRelatedTenders } from "@/lib/recommendations";

/**
 * GET /api/tenders/[id]/related
 * Get related tenders for internal linking automation
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "6", 10);

    const relatedTenders = await getRelatedTenders(id, limit);

    return NextResponse.json(
      { relatedTenders },
      {
        headers: {
          // Cache for 5 minutes
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching related tenders:", error);
    return NextResponse.json(
      { error: "Failed to fetch related tenders", relatedTenders: [] },
      { status: 500 }
    );
  }
}
