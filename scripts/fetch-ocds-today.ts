/**
 * Fetch today's eTenders OCDS releases (≤2 pages) and enrich missing fields.
 *
 * Usage:
 *   npm run fetch:ocds:today            # core fields or site fallback
 *   npm run fetch:ocds:today -- --maxPages=1
 *   npm run fetch:ocds:today -- --enrich --maxDetails=5 --maxDocTenders=3
 *   npm run fetch:ocds:today -- --scrape-page --maxPages=1 --maxScrape=10
 */

import { setTimeout as delay } from 'timers/promises';
import * as path from 'node:path';

type ReleasePackage = {
  uri?: string;
  version?: string;
  publishedDate?: string;
  releases?: Release[];
  links?: { next?: string; prev?: string };
};

type Release = {
  ocid?: string;
  id?: string;
  date?: string;
  tag?: string[];
  language?: string;
  tender?: any;
  buyer?: { id?: string; name?: string };
  parties?: Array<{
    id?: string;
    name?: string;
    roles?: string[];
    address?: {
      streetAddress?: string;
      locality?: string;
      region?: string;
      postalCode?: string;
      countryName?: string;
    };
    contactPoint?: {
      name?: string;
      email?: string;
      telephone?: string;
      faxNumber?: string;
      url?: string;
    };
  }>;
  awards?: any[];
  contracts?: any[];
};

type NormalizedTender = {
  ocid: string | null;
  releaseId: string | null;
  datePublished: string | null;
  organOfState: string | null;
  tenderNumber: string | null;
  tenderTitle: string | null;
  tenderType: string | null;
  category: string | null;
  value: { amount?: number; currency?: string } | null;
  closingDate: string | null;
  province: string | null;
  place: string | null;
  enquiries: { name?: string | null; email?: string | null; telephone?: string | null; faxNumber?: string | null; url?: string | null } | null;
  specialConditions: string | null;
  briefing: {
    exists?: boolean | null;
    compulsory?: boolean | null;
    dateTime?: string | null;
    date?: string | null;
    time?: string | null;
    venue?: string | null;
    meetingId?: string | null;
    passcode?: string | null;
  } | null;
  documents: Array<{ title?: string | null; url?: string | null; datePublished?: string | null; format?: string | null }>;
  counts: { documents: number; awards: number; contracts: number };
  sources: {
    organOfState: string;
    tenderNumber: string;
    province: string;
    place: string;
    enquiries: string;
    specialConditions?: string;
    briefing?: string;
  };
};

const BASE_URL = process.env.OCDS_BASE_URL || 'https://ocds-api.etenders.gov.za';

function ymd(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function startOfDayZ(date: Date): string { return `${ymd(date)}T00:00:00Z`; }
function endOfDayZ(date: Date): string { return `${ymd(date)}T23:59:59Z`; }

function buildUrl(pageNumber: number, pageSize: number, fromISO: string, toISO: string): string {
  const params = new URLSearchParams({
    PageNumber: String(pageNumber), PageSize: String(pageSize), dateFrom: fromISO, dateTo: toISO,
  });
  return `${BASE_URL}/api/OCDSReleases?${params.toString()}`;
}

async function fetchJson<T>(url: string, attempt = 1): Promise<T> {
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 60000);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { accept: 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } catch (err) {
    if (attempt < 2) { await delay(750); return fetchJson<T>(url, attempt + 1); }
    throw err;
  } finally { clearTimeout(timeout); }
}

async function fetchBuffer(url: string, attempt = 1): Promise<Buffer> {
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 60000);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { accept: '*/*' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const ab = await res.arrayBuffer();
    return Buffer.from(ab);
  } catch (err) {
    if (attempt < 2) { await delay(750); return fetchBuffer(url, attempt + 1); }
    throw err;
  } finally { clearTimeout(timeout); }
}

function deriveTenderNumber(t: any): string | null {
  if (!t) return null;
  if (typeof t.title === 'string') {
    const title = t.title.trim();
    const m = title.match(/\b(RFQ|RFP|RFB|RFT|RFI|RFA|RFPQ|RFBQ|EOI)[-_\s:/]*([A-Z0-9/\.-]{3,})/i);
    if (m) return (m[0] || title).replace(/\s+/g, '');
  }
  if (typeof t.id === 'string' && t.id.trim()) return t.id.trim();
  return null;
}

function addressToPlace(addr?: Release['parties'] extends (infer P)[] ? P['address'] : any): string | null {
  if (!addr) return null;
  const parts = [addr.streetAddress, addr.locality, addr.region, addr.postalCode]
    .filter(Boolean).map((s) => String(s).trim()).filter((s) => s.length > 0);
  return parts.length ? parts.join(', ') : null;
}

function pickEnquiries(release: Release): NormalizedTender['enquiries'] {
  const parties = Array.isArray(release.parties) ? release.parties : [];
  const buyerId = release.buyer?.id;
  const preferred = parties.find((p) => (p.id && p.id === buyerId) || (p.roles || []).includes('buyer') || (p.roles || []).includes('procuringEntity'))
    || parties.find((p) => p.contactPoint);
  if (preferred?.contactPoint) {
    const { name, email, telephone, faxNumber, url } = preferred.contactPoint;
    return { name: name || null, email: email || null, telephone: telephone || null, faxNumber: faxNumber || null, url: url || null };
  }
  return null;
}

function inferProvince(release: Release): string | null {
  const parties = Array.isArray(release.parties) ? release.parties : [];
  const buyerId = release.buyer?.id;
  const preferred = parties.find((p) => (p.id && p.id === buyerId) || (p.roles || []).includes('buyer') || (p.roles || []).includes('procuringEntity')) || parties[0];
  return preferred?.address?.region || null;
}

function pickPlace(release: Release): string | null {
  const parties = Array.isArray(release.parties) ? release.parties : [];
  const buyerId = release.buyer?.id;
  const preferred = parties.find((p) => (p.id && p.id === buyerId) || (p.roles || []).includes('buyer') || (p.roles || []).includes('procuringEntity')) || parties[0];
  return addressToPlace(preferred?.address);
}

function normalize(release: Release): NormalizedTender {
  const tender = release.tender || {};
  const documents = Array.isArray(tender.documents) ? tender.documents : [];
  return {
    ocid: release.ocid ?? null,
    releaseId: release.id ?? null,
    datePublished: release.date ?? null,
    organOfState: release.buyer?.name ?? null,
    tenderNumber: deriveTenderNumber(tender),
    tenderTitle: typeof tender.title === 'string' ? tender.title : null,
    tenderType: tender.procurementMethodDetails || tender.procurementMethod || null,
    category: tender.mainProcurementCategory || null,
    value: tender.value || null,
    closingDate: tender.tenderPeriod?.endDate || null,
    province: inferProvince(release),
    place: pickPlace(release),
    enquiries: pickEnquiries(release),
    specialConditions: null,
    briefing: null,
    documents: documents.map((d: any) => ({
      title: d.title ?? null, url: d.url ?? null, datePublished: d.datePublished ?? null, format: d.format ?? null,
    })),
    counts: {
      documents: documents.length,
      awards: Array.isArray(release.awards) ? release.awards.length : 0,
      contracts: Array.isArray(release.contracts) ? release.contracts.length : 0,
    },
    sources: {
      organOfState: 'ocds.release.buyer',
      tenderNumber: tender.id ? 'ocds.tender.id' : 'derived.from.title',
      province: 'ocds.parties.address.region',
      place: 'ocds.parties.address',
      enquiries: 'ocds.parties.contactPoint',
      specialConditions: 'unknown',
      briefing: 'unknown',
    },
  };
}

function cleanLine(s: string): string { return s.replace(/\s+/g, ' ').trim(); }

const PROVINCES = ['Gauteng','Western Cape','Eastern Cape','Northern Cape','KwaZulu-Natal','KwaZulu Natal','Free State','Limpopo','North West','Mpumalanga'];

type Enriched = Partial<Pick<NormalizedTender,
  'province' | 'place' | 'enquiries' | 'tenderNumber' | 'tenderType' | 'specialConditions' | 'briefing'>> & {
    sources?: Partial<NormalizedTender['sources']>;
  };

function extractFromText(text: string): Enriched {
  const out: Enriched = { sources: {} };
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  const pickAfter = (label: string): string | null => {
    const i = lines.findIndex((l) => l.toLowerCase().startsWith(label.toLowerCase()));
    if (i >= 0) {
      const v = lines[i].slice(label.length).replace(/^[:\s-]+/, '').trim();
      return v || null;
    }
    return null;
  };

  // Province
  let province = pickAfter('Province');
  if (!province) {
    const found = lines.find((l) => PROVINCES.some((p) => new RegExp(`(^|[^a-z])${p}([^a-z]|$)`, 'i').test(l)));
    if (found) province = PROVINCES.find((p) => found.toLowerCase().includes(p.toLowerCase())) || null;
  }
  if (province) { out.province = province; out.sources!.province = 'doc.text'; }

  // Place (only labeled)
  const placeLabels = [
    'Place where goods, works or services are required',
    'Delivery Address', 'Physical Address', 'Venue', 'Briefing Venue'
  ];
  let place: string | null = null;
  for (const lab of placeLabels) { const v = pickAfter(lab); if (v) { place = v; break; } }
  if (place) { out.place = cleanLine(place); out.sources!.place = 'doc.text'; }

  // Enquiries
  let contactName = pickAfter('Contact Person') || pickAfter('Enquiries');
  let email: string | null = null;
  let telephone = pickAfter('Telephone number') || pickAfter('Telephone') || pickAfter('Tel');
  let fax = pickAfter('Fax Number') || pickAfter('Fax');
  if (!email) { const m = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i); if (m) email = m[0]; }
  if (!telephone && (contactName || email)) {
    const m = text.match(/(?:\+27|0)\s?\d{2}\s?\d{3}\s?\d{4}\b/);
    if (m) {
      const candidate = cleanLine(m[0]);
      const digits = candidate.replace(/\D/g, '');
      const uniqueDigits = new Set(digits.split('')).size;
      if (digits.length >= 10 && uniqueDigits >= 4) telephone = candidate;
    }
  }
  if (!fax) { const m = text.match(/fax[:,]?\s*((?:\+27|0)\s?\d{2}\s?\d{3}\s?\d{4})/i); if (m) fax = cleanLine(m[1]); }
  if (contactName || email || telephone || fax) { out.enquiries = { name: contactName || null, email: email || null, telephone: telephone || null, faxNumber: fax || null, url: null }; out.sources!.enquiries = 'doc.text'; }

  // Tender type
  const tt = pickAfter('Tender Type') || pickAfter('Procurement Method') || pickAfter('Method');
  if (tt) { out.tenderType = tt; }

  // Special Conditions
  const scIdx = lines.findIndex((l) => /^special\s+conditions\b/i.test(l));
  if (scIdx >= 0) {
    const buf: string[] = [];
    for (let i = scIdx; i < Math.min(lines.length, scIdx + 8); i++) {
      const v = lines[i];
      if (i === scIdx) { const after = v.replace(/^special\s+conditions[:\s-]*/i, '').trim(); if (after) buf.push(after); continue; }
      if (/^[A-Z][A-Z \-]{3,}:?$/.test(v)) break;
      if (/^ENQUIR(I|E)ES\b/i.test(v) || /^BRIEFING\b/i.test(v)) break;
      buf.push(v);
    }
    const joined = cleanLine(buf.join(' '));
    if (joined) { out.specialConditions = joined; out.sources!.specialConditions = 'doc.text'; }
  }

  // Briefing Session
  const bIdx = lines.findIndex((l) => /^briefing\s+session\b/i.test(l));
  if (bIdx >= 0) {
    const b: NonNullable<NormalizedTender['briefing']> = {};
    const existsLine = lines.slice(bIdx, bIdx + 8).find((l) => /is there a briefing session\??/i.test(l));
    if (existsLine) b.exists = /yes/i.test(existsLine);
    const compLine = lines.slice(bIdx, bIdx + 8).find((l) => /is it compulsory\??/i.test(l));
    if (compLine) b.compulsory = /yes/i.test(compLine);
    const dtLine = lines.slice(bIdx, bIdx + 10).find((l) => /briefing date/i.test(l));
    if (dtLine) { const after = dtLine.replace(/.*briefing date( and time)?[:\s-]*/i, '').trim(); if (after) b.dateTime = after; }
    const venLine = lines.slice(bIdx, bIdx + 10).find((l) => /briefing venue/i.test(l));
    if (venLine) { const after = venLine.replace(/.*briefing venue[:\s-]*/i, '').trim(); if (after) b.venue = after; }
    const windowLines = lines.slice(bIdx, bIdx + 12).join(' \n ');
    const mid = windowLines.match(/meeting\s*id[:\s-]*([A-Za-z0-9\s]+)/i);
    const pass = windowLines.match(/passcode[:\s-]*([A-Za-z0-9\-]+)/i);
    if (mid) b.meetingId = cleanLine(mid[1]);
    if (pass) b.passcode = cleanLine(pass[1]);
    if (Object.keys(b).length) { out.briefing = b; out.sources!.briefing = 'doc.text'; }
  }

  return out;
}

async function parseDocumentToText(url: string): Promise<string | null> {
  try {
    const buf = await fetchBuffer(url);
    const ext = path.extname(new URL(url).pathname).toLowerCase();
    if (ext === '.docx') {
      const mammoth = await import('mammoth');
      const res = await (mammoth as any).extractRawText({ buffer: buf });
      return (res && res.value) || null;
    }
    if (ext === '.pdf') {
      const pdfParse = (await import('pdf-parse')).default as (b: Buffer) => Promise<{ text: string }>;
      const res = await pdfParse(buf);
      return res.text || null;
    }
    return buf.toString('utf8');
  } catch (e) { return null; }
}

async function fetchReleaseDetail(ocid: string): Promise<Release | null> {
  const url = `${BASE_URL}/api/OCDSReleases/release/${encodeURIComponent(ocid)}`;
  try { return await fetchJson<Release>(url); } catch { return null; }
}

function mergeEnriched(base: NormalizedTender, add: Enriched): NormalizedTender {
  const next = { ...base };
  if (add.province && !base.province) { next.province = add.province; next.sources.province = add.sources?.province || next.sources.province; }
  if (add.place && !base.place) { next.place = add.place; next.sources.place = add.sources?.place || next.sources.place; }
  if (add.enquiries && !base.enquiries) { next.enquiries = add.enquiries; next.sources.enquiries = add.sources?.enquiries || next.sources.enquiries; }
  if (add.tenderNumber && (!base.tenderNumber || base.tenderNumber === base.ocid)) { next.tenderNumber = add.tenderNumber; next.sources.tenderNumber = add.sources?.tenderNumber || next.sources.tenderNumber; }
  if (add.tenderType && !base.tenderType) { next.tenderType = add.tenderType; }
  if (add.specialConditions && !base.specialConditions) { next.specialConditions = add.specialConditions; next.sources.specialConditions = add.sources?.specialConditions || next.sources.specialConditions; }
  if (add.briefing && !base.briefing) { next.briefing = add.briefing; next.sources.briefing = add.sources?.briefing || next.sources.briefing; }
  return next;
}

// eTenders site enrichment via PaginatedTenderOpportunities (server-side DataTables)
type EtendersRow = {
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
  supportDocument?: Array<{
    supportDocumentID: string;
    fileName: string;
    extension: string;
    tendersID?: number;
    active?: boolean;
    dateModified?: string;
  }> | null;
};

async function queryEtendersByTenderNo(tenderNo: string): Promise<EtendersRow | null> {
  const base = 'https://www.etenders.gov.za/Home/PaginatedTenderOpportunities';
  const params = new URLSearchParams({ draw: '1', start: '0', length: '20', status: '1', 'search[value]': tenderNo });
  const url = `${base}?${params.toString()}`;
  try {
    const res = await fetchJson<{ data: EtendersRow[] }>(url);
    const data = Array.isArray(res.data) ? res.data : [];
    const target = data.find((r) => (r.tender_No || '').trim().toLowerCase() === tenderNo.trim().toLowerCase());
    return target || null;
  } catch { return null; }
}

// Fallback: page through current opportunities and filter by today's date
async function fetchEtendersPage(start: number, length: number, status = 1): Promise<EtendersRow[]> {
  const base = 'https://www.etenders.gov.za/Home/PaginatedTenderOpportunities';
  const params = new URLSearchParams({ draw: '1', start: String(start), length: String(length), status: String(status) });
  const url = `${base}?${params.toString()}`;
  try {
    const res = await fetchJson<{ data: EtendersRow[] }>(url);
    return Array.isArray(res.data) ? res.data : [];
  } catch { return []; }
}

function isSameDayISO(dateStr: string | undefined | null, dayISO: string): boolean {
  if (!dateStr) return false;
  const d = String(dateStr).slice(0, 10);
  return d === dayISO;
}

function normalizeDelivery(delivery?: string | null): string | null {
  if (!delivery) return null;
  let s = delivery.replace(/-+/g, ', ').replace(/\s+,/g, ',').replace(/,\s+/g, ', ').trim();
  s = s.replace(/\s{2,}/g, ' ');
  return s || null;
}

function normalizeFromEtendersRow(row: EtendersRow): NormalizedTender {
  const docs = Array.isArray(row.supportDocument) ? row.supportDocument : [];
  const documents = docs.map((d) => {
    const blobName = `${d.supportDocumentID}${d.extension || ''}`;
    const url = `https://www.etenders.gov.za/home/Download?blobName=${encodeURIComponent(blobName)}&downloadedFileName=${encodeURIComponent(d.fileName || blobName)}`;
    return { title: d.fileName || null, url, datePublished: row.date_Published || null, format: (d.extension || '').replace(/^\./, '') || null };
  });

  const place = normalizeDelivery(row.delivery || row.briefingVenue || null);
  return {
    ocid: null,
    releaseId: null,
    datePublished: row.date_Published || null,
    organOfState: row.organ_of_State || null,
    tenderNumber: (row.tender_No || '').trim() || null,
    tenderTitle: (row.tender_No || '').trim() || null,
    tenderType: row.type || null,
    category: null,
    value: null,
    closingDate: row.closing_Date || null,
    province: row.province || null,
    place: place,
    enquiries: (row.contactPerson || row.email || row.telephone || row.fax) ? {
      name: row.contactPerson || null,
      email: row.email || null,
      telephone: row.telephone || null,
      faxNumber: row.fax || null,
      url: null,
    } : null,
    specialConditions: row.conditions ? cleanLine(row.conditions) : null,
    briefing: (typeof row.briefingSession === 'boolean' || typeof row.briefingCompulsory === 'boolean' || row.compulsory_briefing_session || row.briefingVenue) ? {
      exists: typeof row.briefingSession === 'boolean' ? row.briefingSession : null,
      compulsory: typeof row.briefingCompulsory === 'boolean' ? row.briefingCompulsory : null,
      dateTime: row.compulsory_briefing_session || null,
      venue: place,
      meetingId: (row.briefingVenue || '').match(/meeting\s*id[:\s-]*([0-9\s]+)/i)?.[1]?.trim() || null,
      passcode: (row.briefingVenue || '').match(/passcode[:\s-]*([A-Za-z0-9\-]+)/i)?.[1]?.trim() || null,
    } : null,
    documents,
    counts: { documents: documents.length, awards: 0, contracts: 0 },
    sources: {
      organOfState: 'site.api',
      tenderNumber: 'site.api',
      province: 'site.api',
      place: 'site.api',
      enquiries: 'site.api',
      specialConditions: 'site.api',
      briefing: 'site.api',
    },
  };
}

async function main() {
  const maxPagesArg = process.argv.find((a) => a.startsWith('--maxPages='));
  const maxPages = maxPagesArg ? Math.max(1, Math.min(2, parseInt(maxPagesArg.split('=')[1] || '2', 10))) : 2;
  const pageSize = 50;
  const enrich = process.argv.includes('--enrich');
  const scrape = process.argv.includes('--scrape-page');
  const maxDetailsArg = process.argv.find((a) => a.startsWith('--maxDetails='));
  const maxDetails = maxDetailsArg ? Math.max(1, parseInt(maxDetailsArg.split('=')[1] || '10', 10)) : 10;
  const maxDocTendersArg = process.argv.find((a) => a.startsWith('--maxDocTenders='));
  const maxDocTenders = maxDocTendersArg ? Math.max(0, parseInt(maxDocTendersArg.split('=')[1] || '5', 10)) : 5;
  const maxScrapeArg = process.argv.find((a) => a.startsWith('--maxScrape='));
  const maxScrape = maxScrapeArg ? Math.max(1, parseInt(maxScrapeArg.split('=')[1] || '10', 10)) : 10;

  const today = new Date();
  const dateFrom = startOfDayZ(today);
  const dateTo = endOfDayZ(today);
  const todayISO = ymd(today);

  let releases: Release[] = [];
  let usedFallback = false;

  // Try OCDS list (page 1–2)
  try {
    const pkg1 = await fetchJson<ReleasePackage>(buildUrl(1, pageSize, dateFrom, dateTo));
    if (Array.isArray(pkg1.releases)) releases.push(...pkg1.releases);
    if (maxPages >= 2 && pkg1.links?.next) {
      try {
        const pkg2 = await fetchJson<ReleasePackage>(pkg1.links.next);
        if (Array.isArray(pkg2.releases)) releases.push(...pkg2.releases);
      } catch { /* ignore page 2 error */ }
    }
  } catch {
    // ignore; will fallback
  }

  let normalized: NormalizedTender[] = releases.map(normalize);

  // Fallback to site API if OCDS gave nothing
  if (normalized.length === 0) {
    usedFallback = true;
    const pageA = await fetchEtendersPage(0, pageSize, 1);
    const pageB = (maxPages >= 2) ? await fetchEtendersPage(pageSize, pageSize, 1) : [];
    const rows = [...pageA, ...pageB].filter((r) => isSameDayISO(r.date_Published, todayISO));
    normalized = rows.map(normalizeFromEtendersRow);
  }

  // Optional enrichments
  if (!usedFallback && enrich && normalized.length) {
    // Release detail enrichment
    for (const n of normalized.slice(0, maxDetails)) {
      if (!n.ocid) continue;
      const det = await fetchReleaseDetail(n.ocid);
      if (!det) continue;
      const fromDet = normalize(det);
      Object.assign(n, mergeEnriched(n, {
        province: fromDet.province,
        place: fromDet.place,
        enquiries: fromDet.enquiries,
        tenderNumber: fromDet.tenderNumber,
        tenderType: fromDet.tenderType,
        sources: fromDet.sources,
      }));
      if (!n.closingDate && fromDet.closingDate) n.closingDate = fromDet.closingDate;
    }

    // Document enrichment (first doc per tender)
    for (const n of normalized.slice(0, maxDocTenders)) {
      const firstDoc = n.documents?.[0];
      if (!firstDoc?.url) continue;
      const text = await parseDocumentToText(firstDoc.url);
      if (!text) continue;
      Object.assign(n, mergeEnriched(n, extractFromText(text)));
    }
  }

  // Optional site enrichment merge when OCDS provided base data
  if (!usedFallback && scrape && normalized.length) {
    let count = 0;
    for (const n of normalized) {
      if (count >= maxScrape) break;
      const no = (n.tenderNumber || '').trim();
      if (!no) continue;
      const row = await queryEtendersByTenderNo(no);
      if (row) {
        Object.assign(n, mergeEnriched(n, enrichedFromEtenders(row)));
        count++;
        await delay(350);
      }
    }
  }

  const output = { params: { dateFrom, dateTo, maxPages, pageSize }, meta: { count: normalized.length, baseUrl: BASE_URL, siteApiFallbackUsed: usedFallback }, tenders: normalized };
  console.log(JSON.stringify(output, null, 2));
}

main().catch((err) => { console.error(err); process.exit(1); });
