/**
 * Fetch today's eTenders OCDS releases (≤2 pages) and normalize key fields.
 *
 * Run:
 *   npx tsx scripts/fetch-ocds-today.ts [--maxPages=1]
 *
 * Environment (optional):
 *   OCDS_BASE_URL=https://ocds-api.etenders.gov.za
 */

import { setTimeout as delay } from 'timers/promises';
import * as path from 'node:path';
import * as crypto from 'node:crypto';

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
  documents: Array<{ title?: string | null; url?: string | null; datePublished?: string | null; format?: string | null }>;
  counts: { documents: number; awards: number; contracts: number };
  sources: { 
    organOfState: string; 
    tenderNumber: string; 
    province: string; 
    place: string; 
    enquiries: string; 
  };
};

const BASE_URL = process.env.OCDS_BASE_URL || 'https://ocds-api.etenders.gov.za';

function ymd(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function startOfDayZ(date: Date): string {
  return `${ymd(date)}T00:00:00Z`;
}

function endOfDayZ(date: Date): string {
  return `${ymd(date)}T23:59:59Z`;
}

function buildUrl(pageNumber: number, pageSize: number, fromISO: string, toISO: string): string {
  const params = new URLSearchParams({
    PageNumber: String(pageNumber),
    PageSize: String(pageSize),
    dateFrom: fromISO,
    dateTo: toISO,
  });
  return `${BASE_URL}/api/OCDSReleases?${params.toString()}`;
}

async function fetchJson<T>(url: string, attempt = 1): Promise<T> {
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 60000);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { 'accept': 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } catch (err) {
    if (attempt < 2) {
      // small backoff and retry once for transient issues
      await delay(750);
      return fetchJson<T>(url, attempt + 1);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchBuffer(url: string, attempt = 1): Promise<Buffer> {
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 60000);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { 'accept': '*/*' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const ab = await res.arrayBuffer();
    return Buffer.from(ab);
  } catch (err) {
    if (attempt < 2) {
      await delay(750);
      return fetchBuffer(url, attempt + 1);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

function deriveTenderNumber(t: any): string | null {
  if (!t) return null;
  if (typeof t.title === 'string') {
    const title = t.title.trim();
    const m = title.match(/\b(RFQ|RFP|RFB|RFT|RFI|RFA|RFPQ|RFBQ|EOI)[-_\s:/]*([A-Z0-9/\.-]{3,})/i);
    if (m) return (m[0] || title).replace(/\s+/g, '');
  }
  if (typeof t.id === 'string' && t.id.trim()) {
    const id = t.id.trim();
    // If id is purely numeric (portal record), prefer parsed title if available
    if (!/^[0-9]+$/.test(id)) return id;
    return id; // fallback numeric id
  }
  return null;
}

function addressToPlace(addr?: any): string | null {
  if (!addr) return null;
  const parts = [addr.streetAddress, addr.locality, addr.region, addr.postalCode]
    .filter(Boolean)
    .map((s) => String(s).trim())
    .filter((s) => s.length > 0);
  return parts.length ? parts.join(', ') : null;
}

function pickEnquiries(release: Release): NormalizedTender['enquiries'] {
  const parties = Array.isArray(release.parties) ? release.parties : [];
  const buyerId = release.buyer?.id;
  // Prefer buyer/procuring entity contact
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
  const norm: NormalizedTender = {
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
    documents: documents.map((d: any) => ({
      title: d.title ?? null,
      url: d.url ?? null,
      datePublished: d.datePublished ?? null,
      format: d.format ?? null,
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
    },
  };
  return norm;
}

function cleanLine(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

const PROVINCES = [
  'Gauteng','Western Cape','Eastern Cape','Northern Cape','KwaZulu-Natal','KwaZulu Natal','Free State','Limpopo','North West','Mpumalanga'
];

type Enriched = Partial<Pick<NormalizedTender,
  'province' | 'place' | 'enquiries' | 'tenderNumber' | 'tenderType'>> & {
    sources?: Partial<NormalizedTender['sources']>;
  };

function extractFromText(text: string): Enriched {
  const out: Enriched = { sources: {} };
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  // Helper to capture after a label
  const pickAfter = (label: string): string | null => {
    const i = lines.findIndex((l) => l.toLowerCase().startsWith(label.toLowerCase()))
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
  if (province) {
    out.province = province;
    out.sources!.province = 'doc.text';
  }

  // Place / venue / address
  const placeLabels = [
    'Place where goods, works or services are required',
    'Place where goods, works or services are required:',
    'Delivery Address', 'Delivery address', 'Physical Address', 'Venue', 'Briefing Venue'
  ];
  let place: string | null = null;
  for (const lab of placeLabels) {
    const v = pickAfter(lab);
    if (v) { place = v; break; }
  }
  // NOTE: Avoid free-form fallback from PDFs; too noisy. Only accept labeled values.
  if (place) {
    out.place = cleanLine(place);
    out.sources!.place = 'doc.text';
  }

  // Enquiries / contact details
  let contactName = pickAfter('Contact Person') || pickAfter('Contact person') || pickAfter('Enquiries');
  let email = null as string | null;
  let telephone = pickAfter('Telephone number') || pickAfter('Telephone') || pickAfter('Tel');
  let fax = pickAfter('Fax Number') || pickAfter('Fax');

  // generic email, phone regex scans
  if (!email) {
    const m = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    if (m) email = m[0];
  }
  if (!telephone && (contactName || email)) {
    const m = text.match(/(?:\+27|0)\s?\d{2}\s?\d{3}\s?\d{4}\b/);
    if (m) {
      const candidate = cleanLine(m[0]);
      const digits = candidate.replace(/\D/g, '');
      const uniqueDigits = new Set(digits.split('')).size;
      if (digits.length >= 10 && uniqueDigits >= 4) telephone = candidate; // filter obvious noise (e.g., repeated zeros)
    }
  }
  if (!fax) {
    const m = text.match(/fax[:,]?\s*((?:\+27|0)\s?\d{2}\s?\d{3}\s?\d{4})/i);
    if (m) fax = cleanLine(m[1]);
  }
  if (contactName || email || telephone || fax) {
    out.enquiries = { name: contactName || null, email: email || null, telephone: telephone || null, faxNumber: fax || null, url: null };
    out.sources!.enquiries = 'doc.text';
  }

  // Tender number (if not present or better in text)
  const tenderNumber = pickAfter('Tender Number') || pickAfter('RFQ Number') || pickAfter('RFP Number');
  if (tenderNumber) {
    out.tenderNumber = tenderNumber;
    out.sources!.tenderNumber = 'doc.text';
  }

  // Tender type
  const tt = pickAfter('Tender Type') || pickAfter('Procurement Method') || pickAfter('Method');
  if (tt) {
    out.tenderType = tt;
  }

  return out;
}

async function parseDocumentToText(url: string): Promise<string | null> {
  try {
    const buf = await fetchBuffer(url);
    const ext = path.extname(new URL(url).pathname).toLowerCase();
    if (ext === '.docx') {
      // lazy import
      const mammoth = await import('mammoth');
      const res = await mammoth.extractRawText({ buffer: buf });
      return res.value || null;
    }
    if (ext === '.pdf') {
      // lazy import
      const pdfParse = (await import('pdf-parse')).default as (b: Buffer) => Promise<{ text: string }>;
      const res = await pdfParse(buf);
      return res.text || null;
    }
    // fallback: try to interpret as utf8
    return buf.toString('utf8');
  } catch (e) {
    return null;
  }
}

async function fetchReleaseDetail(ocid: string): Promise<Release | null> {
  const url = `${BASE_URL}/api/OCDSReleases/release/${encodeURIComponent(ocid)}`;
  try {
    return await fetchJson<Release>(url);
  } catch (e) {
    return null;
  }
}

function mergeEnriched(base: NormalizedTender, add: Enriched): NormalizedTender {
  const next = { ...base };
  if (add.province && !base.province) { next.province = add.province; next.sources.province = add.sources?.province || next.sources.province; }
  if (add.place && !base.place) { next.place = add.place; next.sources.place = add.sources?.place || next.sources.place; }
  if (add.enquiries && !base.enquiries) { next.enquiries = add.enquiries; next.sources.enquiries = add.sources?.enquiries || next.sources.enquiries; }
  if (add.tenderNumber && (!base.tenderNumber || base.tenderNumber === base.ocid)) { next.tenderNumber = add.tenderNumber; next.sources.tenderNumber = add.sources?.tenderNumber || next.sources.tenderNumber; }
  if (add.tenderType && !base.tenderType) { next.tenderType = add.tenderType; }
  return next;
}

async function main() {
  const maxPagesArg = process.argv.find((a) => a.startsWith('--maxPages='));
  const maxPages = maxPagesArg ? Math.max(1, Math.min(2, parseInt(maxPagesArg.split('=')[1] || '2', 10))) : 2;
  const pageSize = 50; // reasonable default; API caps browser at 1000
  const enrich = process.argv.includes('--enrich');
  const maxDetailsArg = process.argv.find((a) => a.startsWith('--maxDetails='));
  const maxDetails = maxDetailsArg ? Math.max(1, parseInt(maxDetailsArg.split('=')[1] || '10', 10)) : 10; // limit detail calls
  const maxDocTendersArg = process.argv.find((a) => a.startsWith('--maxDocTenders='));
  const maxDocTenders = maxDocTendersArg ? Math.max(0, parseInt(maxDocTendersArg.split('=')[1] || '5', 10)) : 5;

  const today = new Date();
  const dateFrom = startOfDayZ(today);
  const dateTo = endOfDayZ(today);

  const pages: Release[] = [];

  // Page 1
  const url1 = buildUrl(1, pageSize, dateFrom, dateTo);
  const pkg1 = await fetchJson<ReleasePackage>(url1).catch((e) => {
    console.error('Failed to fetch page 1:', e);
    return { releases: [] } as ReleasePackage;
  });
  if (Array.isArray(pkg1.releases)) pages.push(...pkg1.releases);

  // Page 2 (optional, only if link exists and within limit)
  if (maxPages >= 2 && pkg1.links?.next) {
    const url2 = pkg1.links.next;
    const pkg2 = await fetchJson<ReleasePackage>(url2).catch(async (e) => {
      // transient fail: retry once after tiny delay
      await delay(500);
      try { return await fetchJson<ReleasePackage>(url2); } catch (e2) { console.error('Failed to fetch page 2:', e2); return { releases: [] } as ReleasePackage; }
    });
    if (Array.isArray(pkg2.releases)) pages.push(...pkg2.releases);
  }

  const normalized = pages.map(normalize);

  if (enrich && normalized.length) {
    // 1) Enrich from release detail (parties/contact/address) for a subset
    const subset = normalized.slice(0, maxDetails);
    for (let i = 0; i < subset.length; i++) {
      const n = subset[i];
      if (!n.ocid) continue;
      const det = await fetchReleaseDetail(n.ocid);
      if (det) {
        const fromDet = normalize(det);
        // prefer more complete fields from detail
        const merged = mergeEnriched(n, {
          province: fromDet.province,
          place: fromDet.place,
          enquiries: fromDet.enquiries,
          tenderNumber: fromDet.tenderNumber,
          tenderType: fromDet.tenderType,
          sources: fromDet.sources,
        });
        Object.assign(n, merged);
        // also consider better closing date/type from detail
        if (!n.closingDate && fromDet.closingDate) n.closingDate = fromDet.closingDate;
        if (!n.tenderType && fromDet.tenderType) n.tenderType = fromDet.tenderType;
      }
    }

    // 2) Enrich from first document text for a subset
    const docSubset = normalized.slice(0, maxDocTenders);
    for (let i = 0; i < docSubset.length; i++) {
      const n = docSubset[i];
      const firstDoc = n.documents?.[0];
      if (!firstDoc?.url) continue;
      const text = await parseDocumentToText(firstDoc.url);
      if (!text) continue;
      const extra = extractFromText(text);
      const merged = mergeEnriched(n, extra);
      Object.assign(n, merged);
    }
  }

  const output = {
    params: { dateFrom, dateTo, maxPages, pageSize },
    meta: { count: normalized.length, baseUrl: BASE_URL },
    tenders: normalized,
  };

  // Print JSON to stdout
  console.log(JSON.stringify(output, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
