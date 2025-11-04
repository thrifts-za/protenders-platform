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
} from './constants';
import { normalizeProvince, validateSpecialConditions } from './validation';

export type EtendersRow = {
  id: number;
  tender_No: string;
  organ_of_State: string;
  date_Published?: string;
  closing_Date?: string;
  province?: string;
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
}

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
    if (attempt < maxAttempts) {
      await delay(RATE_LIMIT_DELAY_RETRY_MS); // Retry after delay
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
  maxAttempts = MAX_RETRY_ATTEMPTS
): Promise<EtendersRow | null> {
  const params = new URLSearchParams({
    draw: '1',
    start: '0',
    length: '20',
    status: '1',
    'search[value]': tenderNo,
  });
  const url = `${ETENDERS_API_BASE}?${params.toString()}`;
  try {
    const res = await fetchJsonWithRetry<{ data: EtendersRow[] }>(url, 1, maxAttempts);
    const data = Array.isArray(res.data) ? res.data : [];
    const target = data.find(
      (r) => (r.tender_No || '').trim().toLowerCase() === tenderNo.trim().toLowerCase()
    );
    return target || null;
  } catch (err) {
    if (attempt < maxAttempts) {
      await delay(RATE_LIMIT_DELAY_ETENDERS_MS); // Retry with delay
      return queryEtendersByTenderNo(tenderNo, attempt + 1, maxAttempts);
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
    if (row.compulsory_briefing_session) {
      // Try to parse date and time from the string
      const parts = row.compulsory_briefing_session.split(/\s+-\s+/);
      if (parts.length === 2) {
        enrichment.briefingDate = parts[0].trim();
        enrichment.briefingTime = parts[1].trim();
      } else {
        enrichment.briefingDate = row.compulsory_briefing_session;
      }
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
  rateLimitDelay = RATE_LIMIT_DELAY_MS
): Promise<EnrichmentData | null> {
  if (!tenderNumber || !tenderNumber.trim()) return null;

  const row = await queryEtendersByTenderNo(tenderNumber);
  if (!row) return null;

  await delay(rateLimitDelay); // Rate limiting
  return enrichFromEtendersRow(row);
}

