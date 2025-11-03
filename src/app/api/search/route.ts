import { NextRequest, NextResponse } from "next/server";

// Use the correct backend API URL that queries our database
const EXTERNAL_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://tender-spotlight-pro.onrender.com";

export async function GET(req: NextRequest) {
  const qs = req.nextUrl.searchParams.toString();
  const url = `${EXTERNAL_BASE}/api/search${qs ? `?${qs}` : ""}`;

  console.log(`[Search API] Proxying to: ${url}`);

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`[Search API] Upstream error: ${res.status} ${res.statusText}`);
      return NextResponse.json({
        error: "Upstream error",
        statusText: res.statusText,
        url: url // Include URL for debugging
      }, { status: res.status });
    }

    const data = await res.json();
    console.log(`[Search API] Success: ${data.total || 0} tenders found`);
    return NextResponse.json(data);
  } catch (err) {
    console.error(`[Search API] Proxy failed:`, err);
    return NextResponse.json({
      error: "Search proxy failed",
      message: err instanceof Error ? err.message : "Unknown error"
    }, { status: 502 });
  }
}
