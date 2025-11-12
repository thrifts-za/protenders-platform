/**
 * eTenders Site API Enrichment Module
 * 
 * Provides reusable functions for enriching OCDS tender data with additional
 * fields from the eTenders site API (PaginatedTenderOpportunities endpoint).
 */

import { setTimeout as delay } from 'timers/promises';
import {
  RATE_LIMIT_DELAY_MS,
  RATE_LIMIT_DELAY_ETENDERS_MS,
  RATE_LIMIT_DELAY_RETRY_MS,
  HTTP_TIMEOUT_MS,
  MAX_RETRY_ATTEMPTS,
  ETENDERS_API_BASE,
  ETENDERS_DOWNLOAD_BASE,
} from './constants';
import { normalizeProvince, validateSpecialConditions } from './validation';

export type EtendersRow = {
  id: number;
  tender_No: string;
  organ_of_State: string;
  date_Published?: string;
  closing_Date?: string;
  province?: string;
  category?: string | null;
  briefingSession?: boolean;
  briefingCompulsory?: boolean;
  compulsory_briefing_session?: string | null;
  briefingVenue?: string | null;
  contactPerson?: string | null;
  email?: string | null;
  telephone?: string | null;
  fax?: string | null;
  conditions?: string | null;
  delivery?: string | null;
  type?: string | null;
};

export interface EnrichmentData {
  province?: string;
  deliveryLocation?: string;
  specialConditions?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactTelephone?: string;
  briefingDate?: string;
  briefingTime?: string;
  briefingVenue?: string;
  briefingMeetingLink?: string;
  tenderType?: string;
  detailedCategory?: string;
  hasBriefing?: boolean;
  briefingCompulsory?: boolean;
  documents?: Array<{
    id?: string;
    title?: string;
    url?: string;
    datePublished?: string;
    dateModified?: string;
    format?: string;
  }>;

  // Phase 2: Deep Filtering Enhancement Fields
  organOfStateType?: string;
  hasESubmission?: boolean;
  estimatedValueMin?: number | null;
  estimatedValueMax?: number | null;
  documentCount?: number;
  hasDocuments?: boolean;
  city?: string | null;
  district?: string | null;
  tenderTypeCategory?: string | null;
  dataQualityScore?: number;
  municipalityType?: string | null;
  departmentLevel?: string | null;

  // Human-readable display title
  displayTitle?: string | null;
}

export interface EtendersQueryContext {
  buyerName?: string;
  title?: string;
  tenderIdHint?: string;
}

// Search strategy toggles (env-configurable)
const ENRICH_SEARCH_STRATEGY = (process.env.ENRICH_SEARCH_STRATEGY || 'simple').toLowerCase();
const ENRICH_USE_TITLE = (process.env.ENRICH_USE_TITLE || 'false').toLowerCase() === 'true';

/**
 * Fetch JSON with retry logic and timeout
 */
async function fetchJsonWithRetry<T>(url: string, attempt = 1, maxAttempts = MAX_RETRY_ATTEMPTS): Promise<T> {
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), HTTP_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const is5xx = /HTTP\s*5\d{2}/i.test(msg);
    const allowed = is5xx ? Math.max(maxAttempts, 4) : maxAttempts;
    if (attempt < allowed) {
      // Exponential backoff with small jitter
      const base = RATE_LIMIT_DELAY_RETRY_MS * Math.pow(2, attempt - 1);
      const jitter = Math.floor(Math.random() * 250);
      await delay(base + jitter);
      return fetchJsonWithRetry<T>(url, attempt + 1, maxAttempts);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Query eTenders site API by tender number
 */
export async function queryEtendersByTenderNo(
  tenderNo: string,
  attempt = 1,
  maxAttempts = MAX_RETRY_ATTEMPTS,
  ctx?: EtendersQueryContext
): Promise<EtendersRow | null> {
  if (attempt === 1) {
    console.log(`🔍 Querying eTenders API for tender: ${tenderNo}`);
  }
  // Helper to run one paged search attempt
  const normalize = (s: string) => s.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  const buildUrl = (q: string, start: number, withStatus: boolean) => {
    const p = new URLSearchParams({ draw: '1', start: String(start), length: '200', 'search[value]': q });
    if (withStatus) p.set('status', '1');
    return `${ETENDERS_API_BASE}?${p.toString()}`;
  };

  const scorePick = (data: EtendersRow[]) => {
    const qRaw = tenderNo.trim();
    const qNorm = normalize(qRaw);
    const isNumericOnly = /^[0-9]+$/.test(qRaw);
    // 1) Exact
    let target = data.find((r) => (r.tender_No || '').trim().toLowerCase() === qRaw.toLowerCase());
    if (target) return target;
    // 2) Normalized exact
    target = data.find((r) => normalize(r.tender_No || '') === qNorm);
    if (target) return target;
    // 3) Context scoring
    if (ctx && data.length) {
      const norm = (s?: string) => (s ? s.replace(/[^A-Za-z0-9]/g, '').toUpperCase() : '');
      const contains = (a: string, b: string) => a.includes(b) || b.includes(a);
      const buyerNorm = norm(ctx.buyerName);
      const titleTokens = (ctx.title || '')
        .toLowerCase()
        .split(/[^a-z0-9]+/i)
        .filter((t) => t && t.length > 3);
      const idHint = ctx.tenderIdHint ? parseInt(ctx.tenderIdHint, 10) : undefined;

      let best: { row: EtendersRow; score: number } | null = null;
      for (const row of data) {
        let score = 0;
        const rn = norm(row.tender_No);
        const buyerRow = norm(row.organ_of_State);

        if (rn === qNorm) score += 100;
        else if (contains(rn, qNorm)) score += 40;

        if (buyerNorm) {
          if (buyerRow === buyerNorm) score += 40;
          else if (contains(buyerRow, buyerNorm)) score += 25;
        }

        if (titleTokens.length) {
          const hay = `${(row as any).conditions || ''} ${(row as any).delivery || ''} ${row.tender_No}`.toLowerCase();
          let hits = 0;
          for (const tk of titleTokens) if (hay.includes(tk)) hits++;
          if (hits >= 3) score += 15; else if (hits >= 1) score += 5;
        }

        if (idHint && row.id === idHint) score += 80;

        if (!best || score > best.score) best = { row, score };
      }

      const threshold = isNumericOnly ? 60 : 40; // be stricter for numeric-only
      if (best && best.score >= threshold) return best.row;
    }

    // 4) Loose normalized contains
    target = data.find((r) => {
      const rn = normalize(r.tender_No || '');
      return rn.includes(qNorm) || qNorm.includes(rn);
    });
    if (target) return target;
    return null;
  };

  const runAttempt = async (q: string, withStatus: boolean, pages?: number[]): Promise<EtendersRow | null> => {
    const isNumericOnly = /^[0-9]+$/.test(q.trim());
    const defaultPages = isNumericOnly ? [0, 200] : [0, 200, 400];
    const pagePlan = pages && pages.length ? pages : defaultPages;
    for (const start of pagePlan) {
      const url = buildUrl(q, start, withStatus);
      const res = await fetchJsonWithRetry<{ data: EtendersRow[] }>(url, 1, maxAttempts);
      const data = Array.isArray(res.data) ? res.data : [];
      console.log(`📊 eTenders API returned ${data.length} results for search: ${q} (start=${start}, withStatus=${withStatus})`);
      const pick = scorePick(data);
      if (pick) return pick;
      if (data.length < 200) break; // no more pages
    }
    return null;
  };

  try {
    const qNo = tenderNo.trim();
    // Build stronger queries from title: drop pure years and very short numbers, prefer tokens with letters
    const rawTitle = (ctx?.title || '').trim();
    const titleTokensAll = rawTitle.split(/[^a-z0-9]+/i).filter(Boolean);
    const strongTokens = titleTokensAll.filter((t) => {
      const tt = t.trim();
      if (!tt) return false;
      if (tt.length <= 3) return false;
      if (/^\d{1,3}$/.test(tt)) return false; // drop very short pure numbers
      if (/^\d{4}$/.test(tt)) return false; // drop pure year tokens
      return /[a-z]/i.test(tt); // must contain letters
    });
    const titleQ = strongTokens.slice(0, 6).join(' ');
    // Prefer tokens that have both letters and digits (e.g., SCMU8, E2056NTCSAMWP) for a tighter query
    const alphaNumTokens = titleTokensAll.filter((t) => /[a-z]/i.test(t) && /\d/.test(t));
    const alphaNumQ = alphaNumTokens.slice(0, 2).join(' ');
    // Compound query using first two strong tokens (if available) to narrow broad prefixes like "SCMU8"
    const compoundQ = strongTokens.length >= 2 ? `${strongTokens[0]} ${strongTokens[1]}` : '';

    let hit: EtendersRow | null = null;

    if (ENRICH_SEARCH_STRATEGY === 'simple') {
      // Simple, low-aggression search: just tender number, 1 page, published; then all statuses.
      hit = await runAttempt(qNo, true, [0]);
      if (!hit) hit = await runAttempt(qNo, false, [0]);
      if (!hit && ENRICH_USE_TITLE) {
        if (alphaNumQ) hit = await runAttempt(alphaNumQ, true, [0]);
        if (!hit && compoundQ) hit = await runAttempt(compoundQ, true, [0]);
        if (!hit && titleQ) hit = await runAttempt(titleQ, true, [0]);
        if (!hit && alphaNumQ) hit = await runAttempt(alphaNumQ, false, [0]);
        if (!hit && compoundQ) hit = await runAttempt(compoundQ, false, [0]);
        if (!hit && titleQ) hit = await runAttempt(titleQ, false, [0]);
      }
    } else {
      // Hybrid (aggressive) strategy: multi-attempt with paging and fallbacks
      // 1) tender number (published)
      hit = await runAttempt(qNo, true);
      // 2) alphanumeric tokens (published) – prefer tighter query first
      if (!hit && alphaNumQ) hit = await runAttempt(alphaNumQ, true, [0, 200]);
      // 3) compound (published)
      if (!hit && compoundQ) hit = await runAttempt(compoundQ, true, [0, 200]);
      // 4) title tokens (published)
      if (!hit && titleQ) hit = await runAttempt(titleQ, true);
      // 5) tender number (all statuses)
      if (!hit) hit = await runAttempt(qNo, false);
      // 6) alphanumeric tokens (all statuses)
      if (!hit && alphaNumQ) hit = await runAttempt(alphaNumQ, false, [0, 200]);
      // 7) compound (all statuses)
      if (!hit && compoundQ) hit = await runAttempt(compoundQ, false, [0, 200]);
      // 8) title tokens (all statuses)
      if (!hit && titleQ) hit = await runAttempt(titleQ, false);
    }
    if (hit) {
      console.log(`✅ Found match via multi-attempt search: ${hit.tender_No}`);
      return hit;
    }

    console.log(`⚠️  No suitable match found for tender ${tenderNo} in eTenders results`);
    return null;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const is5xx = /HTTP\s*5\d{2}/i.test(msg);
    const allowed = is5xx ? Math.max(maxAttempts, 4) : maxAttempts;
    if (attempt < allowed) {
      const base = RATE_LIMIT_DELAY_ETENDERS_MS * Math.pow(2, attempt - 1);
      const jitter = Math.floor(Math.random() * 250);
      await delay(base + jitter); // Retry with backoff + jitter
      return queryEtendersByTenderNo(tenderNo, attempt + 1, maxAttempts, ctx);
    }
    console.error(
      `Failed to query eTenders for ${tenderNo}: ${err instanceof Error ? err.message : 'Unknown error'}`
    );
    return null;
  }
}

/**
 * Normalize delivery/venue address string
 */
export function normalizeDelivery(delivery?: string | null): string | null {
  if (!delivery) return null;
  let s = delivery.replace(/-+/g, ', ').replace(/\s+,/g, ',').replace(/,\s+/g, ', ').trim();
  s = s.replace(/\s{2,}/g, ' ');
  return s || null;
}

/**
 * Extract briefing meeting ID and passcode from venue text
 */
function extractMeetingInfo(venue?: string | null): { meetingId?: string; passcode?: string } {
  if (!venue) return {};
  const meetingIdMatch = venue.match(/meeting\s*id[:\s-]*([0-9\s]+)/i);
  const passcodeMatch = venue.match(/passcode[:\s-]*([A-Za-z0-9\-]+)/i);
  return {
    meetingId: meetingIdMatch ? meetingIdMatch[1].trim() : undefined,
    passcode: passcodeMatch ? passcodeMatch[1].trim() : undefined,
  };
}

/**
 * Phase 2: Classify organ of state into standardized types
 */
function classifyOrganOfState(organOfStateName?: string): string | null {
  if (!organOfStateName) return null;
  const name = organOfStateName.toLowerCase();

  // Local municipalities (159)
  if (name.includes('local municipality') && !name.includes('district')) {
    return 'Local Municipality';
  }

  // District municipalities (44)
  if (name.includes('district municipality')) {
    return 'District Municipality';
  }

  // Metro municipalities (8)
  if (name.includes('metro') || name.includes('metropolitan municipality')) {
    return 'Metro Municipality';
  }

  // SETAs (21)
  if (name.includes('seta') || name.includes('education and training authority')) {
    return 'SETA';
  }

  // State-Owned Enterprises (37)
  if (name.includes('soc ltd') || name.includes(' limited') || name.includes('(pty)')) {
    return 'State-Owned Enterprise';
  }

  // Departments - try to distinguish national vs provincial
  if (name.includes('department') || name.startsWith('dept')) {
    // Provincial departments usually mention the province
    const provinces = ['western cape', 'eastern cape', 'gauteng', 'kwazulu', 'limpopo', 'mpumalanga', 'northern cape', 'north west', 'free state'];
    const isProvincial = provinces.some(prov => name.includes(prov));

    if (isProvincial) {
      return 'Provincial Department';
    }
    return 'National Department';
  }

  // Agencies, Authorities, Boards (141)
  if (name.includes('agency') || name.includes('authority') || name.includes('board') ||
      name.includes('commission') || name.includes('council')) {
    return 'Agency/Authority';
  }

  // Public entities
  if (name.includes('entity')) {
    return 'Public Entity';
  }

  return 'Other';
}

/**
 * Phase 2: Detect if tender supports electronic submission
 */
function detectESubmission(row: EtendersRow, deliveryLocation?: string | null): boolean {
  // Check delivery and type fields for electronic submission keywords
  const text = `${row.delivery || ''} ${row.type || ''} ${deliveryLocation || ''}`.toLowerCase();

  return text.includes('electronic') ||
         text.includes('e-tender') ||
         text.includes('portal') ||
         text.includes('online submission') ||
         text.includes('etender') ||
         text.includes('central supplier database');
}

/**
 * Phase 2: Extract estimated value from various fields
 */
function extractEstimatedValue(row: EtendersRow, rawOcdsData?: any): { min: number | null; max: number | null } {
  // Try OCDS value field first if available
  if (rawOcdsData?.tender?.value?.amount) {
    const amount = parseFloat(rawOcdsData.tender.value.amount);
    if (!isNaN(amount) && amount > 0) {
      return { min: amount, max: amount };
    }
  }

  // Extract from conditions or delivery text with regex
  // Match patterns like: "R1,500,000", "R1.5M", "R 2 million", "ZAR 500000"
  const text = `${row.conditions || ''} ${row.delivery || ''}`;

  // Pattern 1: R1,500,000 or R1500000
  const pattern1 = /R\s*([0-9,]+(?:\.[0-9]{2})?)/gi;
  // Pattern 2: R1.5M or R2M
  const pattern2 = /R\s*([0-9.]+)\s*(?:million|m\b)/gi;

  const matches1 = Array.from(text.matchAll(pattern1));
  const matches2 = Array.from(text.matchAll(pattern2));

  const values: number[] = [];

  // Parse pattern 1 matches
  for (const match of matches1) {
    const numStr = match[1].replace(/,/g, '');
    const num = parseFloat(numStr);
    if (!isNaN(num) && num > 1000) { // Minimum R1000 to avoid false positives
      values.push(num);
    }
  }

  // Parse pattern 2 matches (millions)
  for (const match of matches2) {
    const num = parseFloat(match[1]) * 1000000;
    if (!isNaN(num) && num > 0) {
      values.push(num);
    }
  }

  if (values.length === 0) {
    return { min: null, max: null };
  }

  // If multiple values found, use min and max
  const min = Math.min(...values);
  const max = Math.max(...values);

  return { min, max };
}

/**
 * Phase 2: Extract city and district from location text
 */
function extractCityAndDistrict(
  deliveryLocation?: string | null,
  briefingVenue?: string | null,
  province?: string
): { city: string | null; district: string | null } {
  const text = `${deliveryLocation || ''} ${briefingVenue || ''}`.toLowerCase();

  // Known major cities in South Africa
  const knownCities = [
    'johannesburg', 'cape town', 'durban', 'pretoria', 'port elizabeth', 'bloemfontein',
    'polokwane', 'nelspruit', 'kimberley', 'pietermaritzburg', 'east london', 'george',
    'richards bay', 'rustenburg', 'soweto', 'benoni', 'springs', 'roodepoort', 'midrand',
    'sandton', 'centurion', 'randburg', 'boksburg', 'alberton', 'germiston', 'krugersdorp',
    'uitenhage', 'mahikeng', 'mmabatho', 'thohoyandou', 'giyani', 'tzaneen', 'musina',
    'phalaborwa', 'witbank', 'emalahleni', 'secunda', 'standerton', 'ermelo', 'upington',
    'kathu', 'kuruman', 'postmasburg', 'springbok', 'welkom', 'bethlehem', 'kroonstad',
    'sasolburg', 'parys', 'worcester', 'paarl', 'stellenbosch', 'somerset west', 'knysna',
    'oudtshoorn', 'mossel bay', 'beaufort west', 'ladysmith', 'newcastle', 'dundee',
    'vryheid', 'ulundi', 'empangeni', 'eshowe', 'greytown', 'kokstad', 'mthatha', 'umtata',
    'queenstown', 'butterworth', 'king williams town', 'grahamstown', 'makhanda'
  ];

  // Find city
  const city = knownCities.find(c => text.includes(c)) || null;

  // Extract district patterns (e.g., "Cape Winelands District", "Ugu District")
  const districtMatch = text.match(/([a-z\s]+)\s+district/i);
  const district = districtMatch ? districtMatch[1].trim() : null;

  return {
    city: city ? city.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : null,
    district: district ? district.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : null
  };
}

/**
 * Phase 2: Normalize tender type to standard categories
 */
function normalizeTenderType(rawType?: string | null): string | null {
  if (!rawType) return null;
  const type = rawType.toLowerCase();

  // RFQ - Request for Quotation
  if (type.includes('rfq') || type.includes('quotation')) {
    return 'RFQ';
  }

  // RFP - Request for Proposal
  if (type.includes('rfp') || type.includes('proposal')) {
    return 'RFP';
  }

  // RFI - Request for Information
  if (type.includes('rfi') || type.includes('information')) {
    return 'RFI';
  }

  // EOI - Expression of Interest
  if (type.includes('eoi') || type.includes('expression of interest')) {
    return 'EOI';
  }

  // Bid
  if (type.includes('bid')) {
    return 'Bid';
  }

  // Contract
  if (type.includes('contract')) {
    return 'Contract';
  }

  // Pre-qualification
  if (type.includes('pre-qual') || type.includes('prequalification')) {
    return 'Pre-qualification';
  }

  // Framework Agreement
  if (type.includes('framework')) {
    return 'Framework Agreement';
  }

  // Price Quotation
  if (type.includes('price')) {
    return 'Price Quotation';
  }

  return 'Other';
}

/**
 * Phase 2: Calculate data quality score (0-100)
 */
function calculateDataQualityScore(enrichment: EnrichmentData): number {
  let score = 0;
  const maxScore = 100;

  // Critical fields (60 points)
  if (enrichment.province) score += 15;
  if (enrichment.detailedCategory) score += 15;
  if (enrichment.contactEmail) score += 15;
  if (enrichment.organOfStateType) score += 15;

  // Important fields (30 points)
  if (enrichment.contactPerson) score += 5;
  if (enrichment.contactTelephone) score += 5;
  if (enrichment.deliveryLocation) score += 5;
  if (enrichment.tenderType) score += 5;
  if (enrichment.documents && enrichment.documents.length > 0) score += 10;

  // Nice-to-have fields (10 points)
  if (enrichment.briefingVenue) score += 3;
  if (enrichment.specialConditions) score += 3;
  if (enrichment.city) score += 2;
  if (enrichment.estimatedValueMin || enrichment.estimatedValueMax) score += 2;

  return Math.min(score, maxScore);
}

/**
 * Generate human-readable display title
 * Format: "{Buyer} - {Category}: {Short Description}"
 *
 * STRICT LENGTH LIMIT: Max 100 characters for clean one-line display
 *
 * Examples:
 * - "ESKOM - Disposals: 132/66kV 20MVA Transformer"
 * - "KZN Public Works - Maintenance: KwaDukuza District Office"
 * - "Companies Tribunal - Financial Services: External Audit"
 */
function generateDisplayTitle(
  enrichment: EnrichmentData,
  context: EtendersQueryContext,
  description?: string
): string | null {
  const MAX_TITLE_LENGTH = 100; // Strict limit for clean one-liner UI
  const MAX_BUYER_LENGTH = 35; // Max buyer name length
  const MAX_CATEGORY_LENGTH = 25; // Max category length

  // 1. Buyer name (shortened if too long)
  const buyer = context.buyerName || 'Government Entity';
  const shortBuyer = buyer.length > MAX_BUYER_LENGTH
    ? buyer.substring(0, MAX_BUYER_LENGTH - 3) + '...'
    : buyer;

  // 2. Category (use detailed category, fallback to tender type)
  let category = '';
  if (enrichment.detailedCategory) {
    category = enrichment.detailedCategory.split(':')[0].trim(); // Get main part before colon
  } else if (enrichment.tenderType) {
    category = enrichment.tenderType.split('(')[0].trim(); // Remove parenthetical details
  } else if (enrichment.tenderTypeCategory) {
    category = enrichment.tenderTypeCategory;
  }

  // Truncate category if too long
  if (category.length > MAX_CATEGORY_LENGTH) {
    category = category.substring(0, MAX_CATEGORY_LENGTH - 3) + '...';
  }

  // 3. Calculate how much space we have left for description
  // Format will be: "{buyer} - {category}: {description}"
  const baseLength = shortBuyer.length + (category ? ` - ${category}: `.length : ` - `.length);
  const remainingSpace = MAX_TITLE_LENGTH - baseLength;

  let snippet = '';
  if (description && description.length > 10 && remainingSpace > 20) {
    // Extract first meaningful sentence or phrase
    let desc = description
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    // Remove common prefixes
    desc = desc
      .replace(/^(appointment of|provision of|supply of|supply and|request for|tender for)\s+/i, '')
      .replace(/^(the|a|an)\s+/i, '');

    // Take first sentence or remaining space, whichever is shorter
    const firstSentenceMatch = desc.match(/^[^.!?]+[.!?]/);
    if (firstSentenceMatch) {
      desc = firstSentenceMatch[0].replace(/[.!?]$/, '').trim();
    }

    // Truncate to fit remaining space
    if (desc.length > remainingSpace) {
      snippet = desc.substring(0, remainingSpace - 3) + '...';
    } else {
      snippet = desc;
    }
  }

  // Build final title with strict length enforcement
  let finalTitle = '';
  if (!category) {
    // No category, just buyer (fallback scenario)
    finalTitle = shortBuyer;
  } else if (!snippet || snippet.length < 10) {
    // Buyer - Category (no description or too short)
    finalTitle = `${shortBuyer} - ${category}`;
  } else {
    // Full format: Buyer - Category: Description
    finalTitle = `${shortBuyer} - ${category}: ${snippet}`;
  }

  // Final safety check - ensure we never exceed max length
  if (finalTitle.length > MAX_TITLE_LENGTH) {
    finalTitle = finalTitle.substring(0, MAX_TITLE_LENGTH - 3) + '...';
  }

  return finalTitle;
}

/**
 * Convert eTenders API row to enrichment data
 */
export function enrichFromEtendersRow(row: EtendersRow): EnrichmentData {
  const enrichment: EnrichmentData = {};

  // Normalize and validate province
  if (row.province) {
    enrichment.province = normalizeProvince(row.province) || row.province;
  }

  const place = normalizeDelivery(row.delivery || row.briefingVenue || null);
  if (place) {
    enrichment.deliveryLocation = place;
  }

  if (row.contactPerson || row.email || row.telephone || row.fax) {
    enrichment.contactPerson = row.contactPerson || undefined;
    enrichment.contactEmail = row.email || undefined;
    enrichment.contactTelephone = row.telephone || undefined;
  }

  // Validate and clean special conditions
  if (row.conditions) {
    enrichment.specialConditions = validateSpecialConditions(row.conditions) || row.conditions.trim();
  }

  // Briefing information
  if (row.briefingSession !== undefined || row.briefingCompulsory !== undefined || row.briefingVenue) {
    if (typeof row.briefingSession === 'boolean') {
      enrichment.hasBriefing = row.briefingSession;
    }
    if (typeof row.briefingCompulsory === 'boolean') {
      enrichment.briefingCompulsory = row.briefingCompulsory;
    }
    if (row.compulsory_briefing_session) {
      // Try to parse date and time from the string
      const parts = row.compulsory_briefing_session.split(/\s+-\s+/);
      if (parts.length === 2) {
        enrichment.briefingDate = parts[0].trim();
        enrichment.briefingTime = parts[1].trim();
      } else {
        enrichment.briefingDate = row.compulsory_briefing_session;
      }
      // If compulsory session text exists but boolean is missing, assume compulsory
      if (enrichment.briefingCompulsory === undefined) {
        enrichment.briefingCompulsory = true;
      }
      // Briefing session certainly exists if we have this field
      enrichment.hasBriefing = true;
    }

    const venue = normalizeDelivery(row.briefingVenue || null);
    if (venue) {
      enrichment.briefingVenue = venue;
      const meetingInfo = extractMeetingInfo(row.briefingVenue);
      if (meetingInfo.meetingId) {
        enrichment.briefingMeetingLink = meetingInfo.meetingId;
      }
    }
  }

  if (row.type) {
    enrichment.tenderType = row.type;
  }

  // Detailed category from eTenders
  if (row.category && row.category.trim()) {
    enrichment.detailedCategory = row.category.trim();
  }

  // Support documents from eTenders API
  const anyRow: any = row as any;
  if (Array.isArray(anyRow.supportDocument) && anyRow.supportDocument.length) {
    enrichment.documents = anyRow.supportDocument.map((d: any) => ({
      id: String(d.supportDocumentID || d.id || ''),
      title: d.fileName || d.title || undefined,
      url: d.supportDocumentID && d.extension
        ? `${ETENDERS_DOWNLOAD_BASE}?blobName=${d.supportDocumentID}${d.extension}&downloadedFileName=${encodeURIComponent(d.fileName || '')}`
        : undefined,
      datePublished: d.datePublished || undefined,
      dateModified: d.dateModified || undefined,
      format: (d.extension || '').replace(/^\./, ''),
    }));
  }

  // Phase 2: Deep Filtering Enhancement Fields

  // 1. Organ of State Type Classification
  const organType = classifyOrganOfState(row.organ_of_State);
  if (organType) {
    enrichment.organOfStateType = organType;

    // Set municipality/department subtypes
    if (organType.includes('Municipality')) {
      enrichment.municipalityType = organType.replace(' Municipality', '');
    } else if (organType.includes('Department')) {
      enrichment.departmentLevel = organType.replace(' Department', '');
    }
  }

  // 2. Electronic Submission Detection
  enrichment.hasESubmission = detectESubmission(row, enrichment.deliveryLocation);

  // 3. Estimated Value Extraction
  const estimatedValue = extractEstimatedValue(row);
  enrichment.estimatedValueMin = estimatedValue.min;
  enrichment.estimatedValueMax = estimatedValue.max;

  // 4. Document Count
  if (enrichment.documents) {
    enrichment.documentCount = enrichment.documents.length;
    enrichment.hasDocuments = enrichment.documents.length > 0;
  } else {
    enrichment.documentCount = 0;
    enrichment.hasDocuments = false;
  }

  // 5. City and District Extraction
  const location = extractCityAndDistrict(
    enrichment.deliveryLocation,
    enrichment.briefingVenue,
    enrichment.province
  );
  enrichment.city = location.city;
  enrichment.district = location.district;

  // 6. Tender Type Normalization
  enrichment.tenderTypeCategory = normalizeTenderType(row.type);

  // 7. Data Quality Score (calculated after all fields are populated)
  enrichment.dataQualityScore = calculateDataQualityScore(enrichment);

  return enrichment;
}

/**
 * Enrich tender data by querying eTenders site API
 * 
 * @param tenderNumber - The tender number to query
 * @param rateLimitDelay - Delay in milliseconds between API calls (default: from constants)
 * @returns Enrichment data or null if not found/failed
 */
export async function enrichTenderFromEtenders(
  tenderNumber: string,
  rateLimitDelay = RATE_LIMIT_DELAY_MS,
  ctx?: EtendersQueryContext
): Promise<EnrichmentData | null> {
  if (!tenderNumber || !tenderNumber.trim()) {
    console.log(`⚠️  Empty tender number provided`);
    return null;
  }

  console.log(`🔄 Starting enrichment for tender: ${tenderNumber}`);
  const row = await queryEtendersByTenderNo(tenderNumber, 1, MAX_RETRY_ATTEMPTS, ctx);
  if (!row) {
    console.log(`❌ No data found in eTenders for tender: ${tenderNumber}`);
    return null;
  }

  console.log(`⏳ Rate limiting delay: ${rateLimitDelay}ms`);
  await delay(rateLimitDelay); // Rate limiting

  const enriched = enrichFromEtendersRow(row);

  // Generate human-readable display title
  if (ctx) {
    enriched.displayTitle = generateDisplayTitle(enriched, ctx, row.description);
  }

  console.log(`✅ Enrichment complete for ${tenderNumber}:`, {
    province: enriched.province || 'N/A',
    hasContact: !!(enriched.contactEmail || enriched.contactPerson),
    hasBriefing: !!(enriched.briefingDate || enriched.briefingVenue),
    displayTitle: enriched.displayTitle || 'N/A',
  });
  return enriched;
}
