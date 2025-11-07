/**
 * Extract high-value fields from tender documents for a date (or today)
 * and save to DocSummary.
 *
 * Usage:
 *   npx tsx scripts/extract-docs.ts --date=2025-11-04 --maxDocs=2 --maxPages=1
 */

import { config as loadEnv } from 'dotenv';
import { resolve as resolvePath } from 'node:path';
loadEnv({ path: resolvePath(__dirname, '../.env.local') });

import { PrismaClient } from '@prisma/client';
import { setTimeout as delay } from 'timers/promises';
import * as path from 'node:path';
import { extractHighValueFields } from '../src/lib/extractors/docExtractor';

const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

const BASE_URL = process.env.OCDS_BASE_URL || 'https://ocds-api.etenders.gov.za';

type ReleasePackage = { releases?: Release[]; links?: { next?: string } };
type Release = { ocid?: string; id?: string; date?: string; tender?: any };
type EtendersRow = {
  id: number;
  tender_No: string;
  organ_of_State: string;
  date_Published?: string;
  supportDocument?: Array<{ supportDocumentID: string; fileName: string; extension: string }> | null;
};

function ymd(date: Date): string { const y=date.getUTCFullYear(); const m=String(date.getUTCMonth()+1).padStart(2,'0'); const d=String(date.getUTCDate()).padStart(2,'0'); return `${y}-${m}-${d}`; }
function startOfDayZ(date: Date): string { return `${ymd(date)}T00:00:00Z`; }
function endOfDayZ(date: Date): string { return `${ymd(date)}T23:59:59Z`; }

async function fetchJson<T>(url: string): Promise<T> { const r = await fetch(url, { headers: { accept: 'application/json' } }); if (!r.ok) throw new Error(`HTTP ${r.status}`); return (await r.json()) as T; }
async function fetchBuffer(url: string): Promise<Buffer> { const r = await fetch(url); if (!r.ok) throw new Error(`HTTP ${r.status}`); const ab = await r.arrayBuffer(); return Buffer.from(ab); }

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
      const pdfParse = (await import('pdf-parse' as any)).default as any;
      const res = await pdfParse(buf);
      return res.text || null;
    }
    return buf.toString('utf8');
  } catch { return null; }
}

function getArg(name: string): string | undefined { const a = process.argv.find((x) => x.startsWith(`--${name}=`)); return a ? a.split('=')[1] : undefined; }
function toISODate(s?: string | null): Date | null { if (!s) return null; const d = new Date(s); return isNaN(d.getTime()) ? null : d; }

async function run() {
  const dateStr = getArg('date');
  const maxPages = Math.max(1, Math.min(2, parseInt(getArg('maxPages') || '1', 10)));
  const maxDocs = Math.max(1, parseInt(getArg('maxDocs') || '2', 10));
  const day = dateStr ? new Date(dateStr + 'T00:00:00Z') : new Date();

  const url1 = `${BASE_URL}/api/OCDSReleases?PageNumber=1&PageSize=50&dateFrom=${startOfDayZ(day)}&dateTo=${endOfDayZ(day)}`;
  let releases: Release[] = [];
  try {
    const pkg1 = await fetchJson<ReleasePackage>(url1);
    releases.push(...(pkg1.releases || []));
    if (maxPages >= 2 && pkg1.links?.next) {
      try { const pkg2 = await fetchJson<ReleasePackage>(pkg1.links.next); releases.push(...(pkg2.releases || [])); } catch {}
    }
  } catch {}

  let processed = 0;
  for (const r of releases) {
    const ocid = r.ocid || null;
    if (!ocid) continue;
    const docs: any[] = Array.isArray(r.tender?.documents) ? r.tender.documents : [];
    for (const d of docs.slice(0, maxDocs)) {
      if (!d?.url) continue;
      let docId: string | null = null;
      try { const u = new URL(String(d.url)); docId = u.searchParams.get('blobName'); } catch {}
      if (!docId) continue;
      const text = await parseDocumentToText(d.url);
      if (!text) continue;
      const ext = extractHighValueFields(text);
      // Map extraction to DocSummary fields
      const deadlines = [
        { type: 'briefing', value: ext.dates.briefing.value },
        { type: 'enquiries', value: ext.dates.enquiriesClose.value },
        { type: 'submission', value: ext.dates.submissionClose.value },
        { type: 'validity', value: ext.dates.validityPeriod.value },
        { type: 'implementation', value: ext.dates.implementationPeriod.value },
      ].filter((x) => x.value);
      const mustHaves = [
        ext.eligibility.csd.value && 'CSD registration',
        ext.eligibility.taxCompliance.value && 'Tax compliance',
        ext.eligibility.cidb.value && `CIDB: ${ext.eligibility.cidb.value}`,
        ext.eligibility.bbbee.value && `BBBEE: ${ext.eligibility.bbbee.value}`,
        ext.eligibility.oem.value && `OEM: ${ext.eligibility.oem.value}`,
        ext.eligibility.localContent.value && `Local Content: ${ext.eligibility.localContent.value}`,
        ext.eligibility.mandatoryBriefing.value && 'Mandatory briefing',
      ].filter(Boolean) as string[];
      if (ext.submission.method.value) mustHaves.push(`Submission: ${ext.submission.method.value}`);
      const scoring = [
        ext.evaluation.method.value && `Evaluation: ${ext.evaluation.method.value}`,
        ext.evaluation.functionalityThreshold.value && `Functionality threshold: ${ext.evaluation.functionalityThreshold.value}%`,
      ].filter(Boolean) as string[];

      await prisma.docSummary.upsert({
        where: { ocid_docId: { ocid, docId } },
        update: {
          docUrl: d.url || undefined,
          docTitle: d.title || undefined,
          mustHaves: mustHaves.length ? JSON.stringify(mustHaves) : undefined,
          scoring: scoring.length ? JSON.stringify(scoring) : undefined,
          deadlines: deadlines.length ? JSON.stringify(deadlines) : undefined,
          fullSummary: JSON.stringify(ext),
          confidence: 0.65,
        },
        create: {
          ocid,
          docId,
          docUrl: d.url || undefined,
          docTitle: d.title || undefined,
          mustHaves: mustHaves.length ? JSON.stringify(mustHaves) : undefined,
          scoring: scoring.length ? JSON.stringify(scoring) : undefined,
          deadlines: deadlines.length ? JSON.stringify(deadlines) : undefined,
          fullSummary: JSON.stringify(ext),
          confidence: 0.65,
        },
      });
      processed++;
      await delay(200);
    }
  }
  if (processed === 0) {
    // Fallback: site list for the day (print samples only, no DB save without OCID)
    const base = 'https://www.etenders.gov.za/Home/PaginatedTenderOpportunities';
    const list = await (async () => {
      const params = new URLSearchParams({ draw: '1', start: '0', length: '50', status: '1' });
      const url = `${base}?${params.toString()}`;
      try { const res = await fetchJson<{ data: EtendersRow[] }>(url); return res.data || []; } catch { return []; }
    })();
    const dayISO = ymd(day);
    const todays = list.filter((r) => String(r.date_Published || '').startsWith(dayISO));
    const samples: any[] = [];
    for (const row of todays) {
      const docs = Array.isArray(row.supportDocument) ? row.supportDocument : [];
      for (const d of docs.slice(0, maxDocs)) {
        const blobName = `${d.supportDocumentID}${d.extension || ''}`;
        const url = `https://www.etenders.gov.za/home/Download?blobName=${encodeURIComponent(blobName)}&downloadedFileName=${encodeURIComponent(d.fileName || blobName)}`;
        const text = await parseDocumentToText(url);
        if (!text) continue;
        const ex = extractHighValueFields(text);
        samples.push({ tender_No: row.tender_No, organ_of_State: row.organ_of_State, file: d.fileName, extract: ex });
        if (samples.length >= 3) break;
      }
      if (samples.length >= 3) break;
    }
    console.log(JSON.stringify({ samplesCount: samples.length, samples }, null, 2));
  }

  console.error(`Extracted and saved summaries from ${processed} documents`);
}

run().finally(async () => { await prisma.$disconnect(); });
