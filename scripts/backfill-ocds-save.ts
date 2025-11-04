/**
 * Backfill OCDS releases for a date range (≤2 pages/day),
 * enrich with eTenders site details, and save to DB.
 *
 * Usage examples:
 *   npx tsx scripts/backfill-ocds-save.ts --from=2025-10-01 --to=2025-10-31 --maxPages=2 --maxScrape=50
 *   npx tsx scripts/backfill-ocds-save.ts --date=2025-10-03 --maxPages=2 --maxScrape=50
 */

import { config as loadEnv } from 'dotenv';
import { resolve as resolvePath } from 'node:path';
loadEnv({ path: resolvePath(__dirname, '../.env.local') });
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});
import { setTimeout as delay } from 'timers/promises';

const BASE_URL = process.env.OCDS_BASE_URL || 'https://ocds-api.etenders.gov.za';

type ReleasePackage = { releases?: Release[]; links?: { next?: string } };
type Release = {
  ocid?: string;
  id?: string;
  date?: string;
  tender?: any;
  buyer?: { id?: string; name?: string };
};

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
};

function getArg(name: string): string | undefined {
  const a = process.argv.find((x) => x.startsWith(`--${name}=`));
  return a ? a.split('=')[1] : undefined;
}

function ymd(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function startOfDayZ(date: Date): string { return `${ymd(date)}T00:00:00Z`; }
function endOfDayZ(date: Date): string { return `${ymd(date)}T23:59:59Z`; }
function toISODate(s?: string | null): Date | null { if (!s) return null; const d = new Date(s); return isNaN(d.getTime()) ? null : d; }

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as T;
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

async function listOcdsForDay(day: Date, maxPages: number, pageSize: number): Promise<Release[]> {
  const releases: Release[] = [];
  const url1 = `${BASE_URL}/api/OCDSReleases?PageNumber=1&PageSize=${pageSize}&dateFrom=${startOfDayZ(day)}&dateTo=${endOfDayZ(day)}`;
  try {
    const pkg1 = await fetchJson<ReleasePackage>(url1);
    if (Array.isArray(pkg1.releases)) releases.push(...pkg1.releases);
    if (maxPages >= 2 && pkg1.links?.next) {
      try { const pkg2 = await fetchJson<ReleasePackage>(pkg1.links.next); if (Array.isArray(pkg2.releases)) releases.push(...pkg2.releases); } catch {}
    }
  } catch {}
  return releases;
}

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

function normalizeDelivery(delivery?: string | null): string | null {
  if (!delivery) return null;
  let s = delivery.replace(/-+/g, ', ').replace(/\s+,/g, ',').replace(/,\s+/g, ', ').trim();
  s = s.replace(/\s{2,}/g, ' ');
  return s || null;
}

async function saveReleaseWithEnrichment(r: Release, maxScrape: number) {
  const ocid = r.ocid || null;
  const releaseId = r.id || null;
  const date = r.date || null;
  const t = r.tender || {};
  const tenderNumber = deriveTenderNumber(t);
  const tenderTitle = typeof t.title === 'string' ? t.title : null;
  const tenderType = t.procurementMethodDetails || t.procurementMethod || null;
  const mainCategory = t.mainProcurementCategory || null;
  const buyerName = r.buyer?.name || null;
  const closingAt = t.tenderPeriod?.endDate || null;

  // Site enrichment by tender number (if known)
  let site: EtendersRow | null = null;
  if (tenderNumber && maxScrape > 0) {
    site = await queryEtendersByTenderNo(tenderNumber);
    await delay(300);
  }

  // Upsert OCDSRelease (requires ocid, releaseId, date)
  if (ocid && releaseId && date) {
    const dateObj = toISODate(date);
    if (dateObj) {
      const existing = await prisma.oCDSRelease.findFirst({ where: { ocid, date: dateObj } });
      const data = {
        ocid,
        releaseId,
        date: dateObj,
        tag: '["compiled"]',
        json: JSON.stringify(r),
        buyerName: buyerName || undefined,
        tenderTitle: tenderTitle || undefined,
        tenderDisplayTitle: tenderTitle || undefined,
        tenderDescription: t.description || undefined,
        mainCategory: mainCategory || undefined,
        closingAt: toISODate(closingAt) || undefined,
        submissionMethods: Array.isArray(t.submissionMethod) ? JSON.stringify(t.submissionMethod) : undefined,
        awardSuppliers: undefined,
        status: t.status || undefined,
        publishedAt: dateObj,
        updatedAt: new Date(),
        tenderType: tenderType || (site?.type || undefined),
        province: site?.province || undefined,
        deliveryLocation: normalizeDelivery(site?.delivery || site?.briefingVenue || null) || undefined,
        specialConditions: site?.conditions ? site.conditions.trim() : undefined,
        contactPerson: site?.contactPerson || undefined,
        contactEmail: site?.email || undefined,
        contactTelephone: site?.telephone || undefined,
        enquiryDeadline: undefined,
        briefingDate: undefined,
        briefingTime: undefined,
        briefingVenue: normalizeDelivery(site?.briefingVenue || null) || undefined,
        briefingMeetingLink: undefined,
      } as const;
      if (existing) {
        await prisma.oCDSRelease.update({ where: { id: existing.id }, data });
      } else {
        await prisma.oCDSRelease.create({ data });
      }

      // Upsert Tender
      await prisma.tender.upsert({
        where: { ocid_tenderId: { ocid, tenderId: tenderNumber || '' } },
        update: {
          title: tenderTitle || undefined,
          description: t.description || undefined,
          mainProcurementCategory: mainCategory || undefined,
          procurementMethod: t.procurementMethod || undefined,
          procurementMethodDetails: tenderType || undefined,
          submissionMethod: Array.isArray(t.submissionMethod) ? JSON.stringify(t.submissionMethod) : undefined,
          submissionMethodDetails: t.submissionMethodDetails || undefined,
          startDate: toISODate(t.tenderPeriod?.startDate) || toISODate(date) || undefined,
          endDate: toISODate(closingAt) || undefined,
          status: t.status || undefined,
          valueAmount: t.value?.amount || undefined,
          valueCurrency: t.value?.currency || undefined,
        },
        create: {
          ocid,
          tenderId: tenderNumber || undefined,
          title: tenderTitle || undefined,
          description: t.description || undefined,
          mainProcurementCategory: mainCategory || undefined,
          procurementMethod: t.procurementMethod || undefined,
          procurementMethodDetails: tenderType || undefined,
          submissionMethod: Array.isArray(t.submissionMethod) ? JSON.stringify(t.submissionMethod) : undefined,
          submissionMethodDetails: t.submissionMethodDetails || undefined,
          startDate: toISODate(t.tenderPeriod?.startDate) || toISODate(date) || undefined,
          endDate: toISODate(closingAt) || undefined,
          status: t.status || undefined,
          valueAmount: t.value?.amount || undefined,
          valueCurrency: t.value?.currency || undefined,
        },
      });

      // Upsert Documents (if available)
      const docs: any[] = Array.isArray(t.documents) ? t.documents : [];
      for (const d of docs) {
        if (!d?.url) continue;
        let docId: string | null = null;
        try { const u = new URL(String(d.url)); docId = u.searchParams.get('blobName'); } catch {}
        // Ensure docId is always a string (fallback to hash if not found in URL)
        const docIdFinal = docId || require('crypto').createHash('sha1').update(String(d.url)).digest('hex');
        const parentIdValue = tenderNumber || '';
        await prisma.document.upsert({
          where: { ocid_parent_parentId_docId: { ocid, parent: 'tender', parentId: parentIdValue, docId: docIdFinal } },
          update: { title: d.title || undefined, url: d.url || undefined, datePublished: toISODate(d.datePublished) || undefined, format: d.format || undefined },
          create: { ocid, parent: 'tender', parentId: parentIdValue, docId: docIdFinal, title: d.title || undefined, url: d.url || undefined, datePublished: toISODate(d.datePublished) || undefined, format: d.format || undefined },
        }).catch(()=>{});
      }
    }
  }
}

function parseISODateOnly(s: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y, m, d] = s.split('-').map((x) => parseInt(x, 10));
  const dt = new Date(Date.UTC(y, m - 1, d));
  return isNaN(dt.getTime()) ? null : dt;
}

function* daysInRangeUTC(from: Date, to: Date) {
  let cur = new Date(from.getTime());
  while (cur.getTime() <= to.getTime()) { yield new Date(cur.getTime()); cur.setUTCDate(cur.getUTCDate() + 1); }
}

async function main() {
  const fromStr = getArg('from');
  const toStr = getArg('to');
  const dateStr = getArg('date');
  const maxPages = parseInt(getArg('maxPages') || '2', 10);
  const pageSize = parseInt(getArg('pageSize') || '50', 10);
  const maxScrape = parseInt(getArg('maxScrape') || '30', 10);

  if (dateStr) {
    const day = parseISODateOnly(dateStr);
    if (!day) throw new Error('Invalid --date');
    const list = await listOcdsForDay(day, Math.max(1, Math.min(2, maxPages)), pageSize);
    for (const r of list) await saveReleaseWithEnrichment(r, maxScrape);
    console.error(`Saved ${list.length} releases for ${ymd(day)}`);
    return;
  }

  if (!fromStr || !toStr) throw new Error('Pass --from=YYYY-MM-DD and --to=YYYY-MM-DD');
  const from = parseISODateOnly(fromStr);
  const to = parseISODateOnly(toStr);
  if (!from || !to) throw new Error('Invalid --from/--to');

  const start = from.getTime() <= to.getTime() ? from : to;
  const end = from.getTime() <= to.getTime() ? to : from;
  for (const day of daysInRangeUTC(start, end)) {
    const list = await listOcdsForDay(day, Math.max(1, Math.min(2, maxPages)), pageSize);
    for (const r of list) await saveReleaseWithEnrichment(r, maxScrape);
    console.error(`Saved ${list.length} releases for ${ymd(day)}`);
    await delay(400);
  }
}

main().finally(async () => { await prisma.$disconnect(); });
