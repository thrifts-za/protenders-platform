import { NextRequest, NextResponse } from "next/server";

// Proxy to actual facets API endpoint
const EXTERNAL_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://tender-spotlight-pro.onrender.com";
// Alternatively use the facets endpoint if it exists
const FACETS_URL = process.env.NEXT_PUBLIC_FACETS_URL || "https://api.protenders.co.za/api/facets";

export async function GET(req: NextRequest) {
  const qs = req.nextUrl.searchParams.toString();
  // Try the facets endpoint first, fallback to search API base
  let url = `${FACETS_URL}${qs ? `?${qs}` : ""}`;
  
  try {
    const res = await fetch(url, { 
      headers: { Accept: "application/json" }, 
      cache: "no-store" 
    });
    
    if (res.ok) {
      const data = await res.json();
      console.log(`[Facets API] Success from ${url}`);
      return NextResponse.json(data);
    }
    
    // Fallback: try the main API base
    url = `${EXTERNAL_BASE}/api/facets${qs ? `?${qs}` : ""}`;
    const fallbackRes = await fetch(url, { 
      headers: { Accept: "application/json" }, 
      cache: "no-store" 
    });
    
    if (!fallbackRes.ok) {
      console.error(`[Facets API] Both endpoints failed: ${res.status} and ${fallbackRes.status}`);
      return NextResponse.json({ 
        error: "Upstream error", 
        statusText: fallbackRes.statusText 
      }, { status: fallbackRes.status });
    }
    
    const data = await fallbackRes.json();
    console.log(`[Facets API] Success from fallback: ${url}`);
    return NextResponse.json(data);
  } catch (err) {
    console.error(`[Facets API] Proxy failed:`, err);
    return NextResponse.json({ 
      error: "Facets proxy failed",
      message: err instanceof Error ? err.message : "Unknown error"
    }, { status: 502 });
  }
}

