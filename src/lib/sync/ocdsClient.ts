export interface OCDSRelease {
  ocid: string;
  id: string;
  date?: string;
  tag?: string[];
  tender?: {
    id?: string;
    title?: string;
    description?: string;
    status?: string;
    procurementMethod?: string;
    procurementMethodDetails?: string;
    mainProcurementCategory?: string;
    tenderPeriod?: { startDate?: string; endDate?: string };
    documents?: Array<{
      id?: string;
      title?: string;
      url?: string;
      datePublished?: string;
      dateModified?: string;
      format?: string;
      description?: string;
    }>;
    procuringEntity?: { id?: string; name?: string };
  };
  buyer?: { id?: string; name?: string };
  parties?: unknown[];
}

export interface ReleasePackageResponse {
  releases?: OCDSRelease[];
  links?: { next?: string };
}

const BASE = `${(process.env.OCDS_BASE_URL || 'https://ocds-api.etenders.gov.za').replace(/\/$/, '')}/api/OCDSReleases`;

async function fetchJsonWithRetry(url: string, attempts = 3, timeoutMs = 45000): Promise<any> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      const controller = new AbortController();
      const to = setTimeout(() => controller.abort(), i === 0 ? timeoutMs : Math.max(timeoutMs, 60000));
      const res = await fetch(url, { headers: { Accept: "application/json" }, cache: "no-store", signal: controller.signal });
      clearTimeout(to);
      if (res.ok) return res.json();
      lastErr = new Error(`HTTP ${res.status}`);
    } catch (e) {
      lastErr = e;
    }
    const delay = 500 * Math.pow(2, i);
    await new Promise((r) => setTimeout(r, delay));
  }
  throw lastErr instanceof Error ? lastErr : new Error("Failed OCDS fetch after retries");
}

export async function fetchReleases(
  params: { from: string; to: string; page?: number; pageSize?: number }
): Promise<ReleasePackageResponse> {
  const { from, to, page = 1, pageSize = 100 } = params;
  const url = `${BASE}?PageNumber=${page}&PageSize=${pageSize}&dateFrom=${from}&dateTo=${to}`;
  return fetchJsonWithRetry(url, 3) as Promise<ReleasePackageResponse>;
}

