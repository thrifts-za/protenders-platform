/**
 * API Client for Tender Data
 * Connects to Render backend via Vercel proxy
 */

import type {
  Tender,
  TenderSearchParams,
  TenderSearchResponse,
  TenderTimeline,
} from "@/types/tender";

// Base URLs
const isServer = typeof window === "undefined";
const PUBLIC_ORIGIN = (process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.protenders.co.za").replace(/\/$/, "");
const ORIGIN_API_BASE = `${PUBLIC_ORIGIN}/api`;
const LOCAL_API_BASE = "/api"; // next route/proxy
const API_BASE_URL = isServer ? ORIGIN_API_BASE : LOCAL_API_BASE;
const AI_BASE_URL = isServer ? `${PUBLIC_ORIGIN}/ai` : "/ai";

/**
 * Transform flat API response to nested OCDS structure
 */
function transformFlatToOCDS(flatTender: Record<string, unknown>): Tender {
  return {
    ocid: flatTender.id || flatTender.ocid || "",
    id: flatTender.id || "",
    date: flatTender.publishedAt || flatTender.date || "",
    tag: flatTender.tag || ["tender"],
    initiationType: flatTender.initiationType || "tender",
    raw: (flatTender as any).raw || flatTender,
    publishedAt: flatTender.publishedAt,
    updatedAt: flatTender.updatedAt,
    closingAt: flatTender.closingDate,
    status: flatTender.status || "active",
    buyer: {
      id: flatTender.buyerId || "",
      name: flatTender.buyerName || "Unknown Buyer",
    },
    tender: {
      id: flatTender.tenderId || flatTender.id || "",
      title: flatTender.displayTitle || flatTender.title || "Untitled Tender",
      description: flatTender.description || "",
      status: flatTender.status || "active",
      mainProcurementCategory: flatTender.mainProcurementCategory || "",
      procurementMethod: flatTender.procurementMethod,
      submissionMethod: flatTender.submissionMethods || [],
      tenderPeriod: {
        startDate: flatTender.publishedAt,
        endDate: flatTender.closingDate,
      },
      value: flatTender.value ? {
        amount: flatTender.value,
        currency: flatTender.currency || "ZAR",
      } : undefined,
    },
  };
}

/**
 * Search tenders with filters
 */
export async function searchTenders(
  params: TenderSearchParams = {}
): Promise<TenderSearchResponse> {
  const searchParams = new URLSearchParams();

  // Add query parameters
  if (params.keywords) searchParams.append("keywords", params.keywords);
  if (params.categories?.length) {
    params.categories.forEach((cat) => searchParams.append("categories", cat));
  }
  if (params.closingInDays !== undefined)
    searchParams.append("closingInDays", params.closingInDays.toString());
  if (params.submissionMethods?.length) {
    params.submissionMethods.forEach((method) =>
      searchParams.append("submissionMethods", method)
    );
  }
  if (params.buyer) searchParams.append("buyer", params.buyer);
  if (params.status) searchParams.append("status", params.status);
  if (params.page) searchParams.append("page", params.page.toString());
  if (params.pageSize)
    searchParams.append("pageSize", params.pageSize.toString());
  if (params.sort) searchParams.append("sort", params.sort);
  if (params.publishedSince)
    searchParams.append("publishedSince", params.publishedSince);
  if (params.updatedSince)
    searchParams.append("updatedSince", params.updatedSince);

  const localUrl = `${LOCAL_API_BASE}/search?${searchParams.toString()}`;
  const originUrl = `${ORIGIN_API_BASE}/search?${searchParams.toString()}`;

  // Try local (Next API) first on client; server uses origin directly
  const primaryUrl = isServer ? originUrl : localUrl;
  let response = await fetch(primaryUrl, {
    headers: {
      "Content-Type": "application/json",
    },
    // For Server Components, we want to cache but allow revalidation
    next: { revalidate: 300 }, // 5 minutes
  });
  if (!response.ok && !isServer) {
    // Fallback to origin if local route not available in dev
    try {
      response = await fetch(originUrl, { headers: { "Content-Type": "application/json" }, cache: "no-store" });
    } catch (e) {
      // ignore; handled below
    }
  }
  if (!response || !response.ok) {
    throw new Error(`Failed to fetch tenders: ${response ? response.statusText : "no response"}`);
  }

  const apiResponse = await response.json();

  // Transform API response to match TenderSearchResponse type
  // API returns { data, total, page, pageSize } with flat tender objects
  // Type expects { results, total, page, pageSize, totalPages } with nested OCDS structure
  const transformedTenders = (apiResponse.data || []).map(transformFlatToOCDS);

  return {
    results: transformedTenders,
    total: apiResponse.total || 0,
    page: apiResponse.page || 1,
    pageSize: apiResponse.pageSize || 10,
    totalPages: Math.ceil((apiResponse.total || 0) / (apiResponse.pageSize || 10)),
  };
}

/**
 * Get a single tender by ID
 */
export async function getTenderById(id: string): Promise<Tender> {
  const encId = encodeURIComponent(id);
  const localUrl = `${LOCAL_API_BASE}/tenders/${encId}`;
  const originUrl = `${ORIGIN_API_BASE}/tenders/${encId}`;
  let response = await fetch(isServer ? originUrl : localUrl, {
    headers: {
      "Content-Type": "application/json",
    },
    // Cache tender details for 1 hour
    next: { revalidate: 3600 },
  });
  if (!response.ok && !isServer) {
    try {
      response = await fetch(originUrl, { headers: { "Content-Type": "application/json" }, cache: "no-store" });
    } catch {}
  }
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Tender not found: ${id}`);
    }
    throw new Error(`Failed to fetch tender: ${response.statusText}`);
  }

  const data = await response.json();
  // If the API returns flat structure (no nested "tender" field), transform to OCDS-like shape
  if (data && typeof data === 'object' && !data.tender) {
    return transformFlatToOCDS(data as Record<string, unknown>);
  }
  return data as Tender;
}

/**
 * Get tender timeline (history of changes)
 */
export async function getTenderTimeline(id: string): Promise<TenderTimeline> {
  const localUrl = `${LOCAL_API_BASE}/tenders/${id}/timeline`;
  const originUrl = `${ORIGIN_API_BASE}/tenders/${id}/timeline`;
  let response = await fetch(isServer ? originUrl : localUrl, {
    headers: {
      "Content-Type": "application/json",
    },
    next: { revalidate: 3600 },
  });
  if (!response.ok && !isServer) {
    try { response = await fetch(originUrl, { headers: { "Content-Type": "application/json" }, cache: "no-store" }); } catch {}
  }
  if (!response.ok) {
    throw new Error(`Failed to fetch tender timeline: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get related tenders (recommendations)
 */
export async function getRelatedTenders(ocid: string): Promise<Tender[]> {
  const localUrl = `${LOCAL_API_BASE}/recommendations/related?ocid=${ocid}`;
  const originUrl = `${ORIGIN_API_BASE}/recommendations/related?ocid=${ocid}`;
  let response = await fetch(isServer ? originUrl : localUrl, {
    headers: {
      "Content-Type": "application/json",
    },
    next: { revalidate: 3600 },
  });
  if (!response.ok && !isServer) {
    try { response = await fetch(originUrl, { headers: { "Content-Type": "application/json" }, cache: "no-store" }); } catch {}
  }
  if (!response.ok) {
    throw new Error(`Failed to fetch related tenders: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get facets for filters (categories, buyers, etc.)
 */
export async function getFacets(): Promise<Record<string, unknown>> {
  const localUrl = `${LOCAL_API_BASE}/facets`;
  const originUrl = `${ORIGIN_API_BASE}/facets`;
  let response = await fetch(isServer ? originUrl : localUrl, {
    headers: {
      "Content-Type": "application/json",
    },
    next: { revalidate: 3600 },
  });
  if (!response.ok && !isServer) {
    try { response = await fetch(originUrl, { headers: { "Content-Type": "application/json" }, cache: "no-store" }); } catch {}
  }
  if (!response.ok) {
    throw new Error(`Failed to fetch facets: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get insights and statistics
 */
export async function getInsights(): Promise<Record<string, unknown>> {
  const url = `${API_BASE_URL}/insights/stats`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch insights: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get comprehensive tender intelligence
 */
export async function getTenderIntelligence(tenderId: string): Promise<unknown> {
  const url = `${AI_BASE_URL}/tenders/${encodeURIComponent(tenderId)}/intelligence`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store", // Always fetch fresh intelligence data
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(`Failed to fetch tender intelligence: ${response.statusText}`);
  }

  const data = await response.json();
  return data.success ? data.data : null;
}

/**
 * Get AI opportunity score for a tender
 */
export async function getAIOpportunityScore(tenderId: string): Promise<unknown> {
  const url = `${AI_BASE_URL}/tenders/${encodeURIComponent(tenderId)}/opportunity-score`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return data.success ? data.data : null;
}

/**
 * Get AI financial intelligence
 */
export async function getAIFinancialIntelligence(tenderId: string): Promise<unknown> {
  const url = `${AI_BASE_URL}/tenders/${encodeURIComponent(tenderId)}/financial-intelligence`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return data.success ? data.data : null;
}

/**
 * Get AI competitor intelligence
 */
export async function getAICompetitorIntelligence(tenderId: string): Promise<unknown> {
  const url = `${AI_BASE_URL}/tenders/${encodeURIComponent(tenderId)}/competitor-intelligence`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return data.success ? data.data : null;
}

/**
 * Get AI document analysis
 */
export async function getAIDocumentAnalysis(tenderId: string): Promise<unknown> {
  const url = `${AI_BASE_URL}/tenders/${encodeURIComponent(tenderId)}/document-analysis`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return data.success ? data.data : null;
}

/**
 * Get AI bid strategy
 */
export async function getAIBidStrategy(tenderId: string): Promise<unknown> {
  const url = `${AI_BASE_URL}/tenders/${encodeURIComponent(tenderId)}/bid-strategy`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return data.success ? data.data : null;
}

/**
 * Get AI system health
 */
export async function getAIHealth(): Promise<unknown> {
  const url = `${AI_BASE_URL}/health`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    next: { revalidate: 60 }, // Cache for 1 minute
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return data.success ? data.data : null;
}

/**
 * Process historical data (trigger)
 */
export async function processHistoricalData(): Promise<unknown> {
  const url = `${AI_BASE_URL}/process-historical`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to process historical data: ${response.statusText}`);
  }

  return response.json();
}
