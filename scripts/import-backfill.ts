/**
 * Import normalized tenders JSON (from scripts/fetch-ocds-today.ts --out dir)
 * into the database via Prisma, populating tender-related tables.
 *
 * Usage:
 *   npx tsx scripts/import-backfill.ts --in=./data/backfill/oct-2025
 *
 * Notes:
 * - Only records with an `ocid` are imported into OCDS-backed tables.
 * - Site-only rows (no ocid) are skipped for OCDSRelease/Tender, but their
 *   documents could be staged into DocRegistry later if desired.
 */

import { config as loadEnv } from 'dotenv';
import { resolve } from 'node:path';
import { promises as fsp } from 'node:fs';
import * as crypto from 'node:crypto';
loadEnv({ path: resolve(__dirname, '../.env.local') });
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

type Briefing = {
  exists?: boolean | null;
  compulsory?: boolean | null;
  dateTime?: string | null;
  date?: string | null;
  time?: string | null;
  venue?: string | null;
  meetingId?: string | null;
  passcode?: string | null;
} | null;

type NormDoc = { title?: string | null; url?: string | null; datePublished?: string | null; format?: string | null };

type NormTender = {
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
  briefing: Briefing;
  documents: NormDoc[];
  counts: { documents: number; awards: number; contracts: number };
  sources: Record<string, unknown>;
};

function getArg(name: string): string | undefined {
  const a = process.argv.find((x) => x.startsWith(`--${name}=`));
  return a ? a.split('=')[1] : undefined;
}

async function readJsonFiles(dir: string): Promise<string[]> {
  const entries = await fsp.readdir(dir);
  return entries
    .filter((f) => f.endsWith('.json'))
    .map((f) => resolve(dir, f))
    .sort();
}

function toISODate(s?: string | null): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function buildBriefingVenue(venue?: string | null, briefing?: Briefing): string | null {
  if (!briefing) return venue || null;
  const parts: string[] = [];
  if (venue) parts.push(venue);
  if (briefing.meetingId) parts.push(`Meeting ID: ${briefing.meetingId}`);
  if (briefing.passcode) parts.push(`Passcode: ${briefing.passcode}`);
  return parts.length ? parts.join(' ') : null;
}

function docIdFromUrl(url?: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    const blob = u.searchParams.get('blobName');
    if (blob) return blob;
  } catch {}
  // hash full URL
  return crypto.createHash('sha1').update(url).digest('hex');
}

async function upsertOCDSReleaseFromNorm(n: NormTender) {
  if (!n.ocid || !n.releaseId || !n.datePublished) return; // cannot store without keys
  const date = toISODate(n.datePublished);
  if (!date) return;

  const existing = await prisma.oCDSRelease.findFirst({
    where: { ocid: n.ocid, date },
  });

  const buyerName = n.organOfState || undefined;
  const tenderTitle = n.tenderTitle || undefined;
  const tenderDisplayTitle = n.tenderTitle || undefined;
  const mainCategory = n.category || undefined;
  const closingAt = toISODate(n.closingDate) || undefined;
  const tenderType = n.tenderType || undefined;
  const province = n.province || undefined;
  const deliveryLocation = n.place || undefined;
  const specialConditions = n.specialConditions || undefined;
  const contactPerson = n.enquiries?.name || undefined;
  const contactEmail = n.enquiries?.email || undefined;
  const contactTelephone = n.enquiries?.telephone || undefined;
  const publishedAt = date;
  const updatedAt = new Date();
  const briefingVenue = buildBriefingVenue(n.briefing?.venue || undefined, n.briefing);
  const briefingDate = n.briefing?.date || undefined;
  const briefingTime = n.briefing?.time || undefined;
  const briefingMeetingLink = undefined; // unknown; storing meeting id in venue text above

  const payloadJson = JSON.stringify(n);

  if (existing) {
    await prisma.oCDSRelease.update({
      where: { id: existing.id },
      data: {
        releaseId: n.releaseId,
        tag: '["compiled"]',
        json: payloadJson,
        buyerName,
        tenderTitle,
        tenderDisplayTitle,
        tenderDescription: undefined,
        mainCategory,
        closingAt,
        submissionMethods: undefined,
        awardSuppliers: undefined,
        status: undefined,
        publishedAt,
        updatedAt,
        tenderType,
        province,
        deliveryLocation,
        specialConditions,
        contactPerson,
        contactEmail,
        contactTelephone,
        enquiryDeadline: undefined,
        briefingDate,
        briefingTime,
        briefingVenue,
        briefingMeetingLink,
      },
    });
  } else {
    await prisma.oCDSRelease.create({
      data: {
        ocid: n.ocid,
        releaseId: n.releaseId,
        date,
        tag: '["compiled"]',
        json: payloadJson,
        buyerName,
        tenderTitle,
        tenderDisplayTitle,
        tenderDescription: undefined,
        mainCategory,
        closingAt,
        submissionMethods: undefined,
        awardSuppliers: undefined,
        status: undefined,
        publishedAt,
        updatedAt,
        tenderType,
        province,
        deliveryLocation,
        specialConditions,
        contactPerson,
        contactEmail,
        contactTelephone,
        enquiryDeadline: undefined,
        briefingDate,
        briefingTime,
        briefingVenue,
        briefingMeetingLink,
      },
    });
  }
}

async function upsertTenderFromNorm(n: NormTender) {
  if (!n.ocid) return;
  await prisma.tender.upsert({
    where: {
      ocid_tenderId: {
        ocid: n.ocid,
        tenderId: n.tenderNumber || '',
      },
    },
    update: {
      title: n.tenderTitle || undefined,
      description: undefined,
      mainProcurementCategory: n.category || undefined,
      procurementMethod: undefined,
      procurementMethodDetails: n.tenderType || undefined,
      submissionMethod: undefined,
      submissionMethodDetails: undefined,
      startDate: toISODate(n.datePublished) || undefined,
      endDate: toISODate(n.closingDate) || undefined,
      status: undefined,
      valueAmount: n.value?.amount || undefined,
      valueCurrency: n.value?.currency || undefined,
    },
    create: {
      ocid: n.ocid,
      tenderId: n.tenderNumber || undefined,
      title: n.tenderTitle || undefined,
      description: undefined,
      mainProcurementCategory: n.category || undefined,
      procurementMethod: undefined,
      procurementMethodDetails: n.tenderType || undefined,
      submissionMethod: undefined,
      submissionMethodDetails: undefined,
      startDate: toISODate(n.datePublished) || undefined,
      endDate: toISODate(n.closingDate) || undefined,
      status: undefined,
      valueAmount: n.value?.amount || undefined,
      valueCurrency: n.value?.currency || undefined,
    },
  });
}

async function upsertDocumentsFromNorm(n: NormTender) {
  if (!n.ocid) return;
  for (const d of n.documents || []) {
    if (!d.url) continue;
    const docId = docIdFromUrl(d.url) || undefined;
    // Ensure non-null strings for unique constraint fields
    const parentIdFinal = n.tenderNumber || '';
    const docIdFinal = docId || require('crypto').createHash('sha1').update(d.url).digest('hex');
    try {
      await prisma.document.upsert({
        where: {
          ocid_parent_parentId_docId: {
            ocid: n.ocid!,
            parent: 'tender',
            parentId: parentIdFinal,
            docId: docIdFinal,
          },
        },
        update: {
          title: d.title || undefined,
          url: d.url || undefined,
          datePublished: toISODate(d.datePublished) || undefined,
          format: d.format || undefined,
        },
        create: {
          ocid: n.ocid!,
          parent: 'tender',
          parentId: parentIdFinal,
          docId: docIdFinal,
          title: d.title || undefined,
          url: d.url || undefined,
          datePublished: toISODate(d.datePublished) || undefined,
          format: d.format || undefined,
        },
      });
    } catch (e) {
      // If composite unique with null fails or schema differs, fallback to a safer create-if-not-exists pattern
      await prisma.document.create({
        data: {
          ocid: n.ocid!,
          parent: 'tender',
          parentId: n.tenderNumber || undefined,
          docId: docId,
          title: d.title || undefined,
          url: d.url || undefined,
          datePublished: toISODate(d.datePublished) || undefined,
          format: d.format || undefined,
        },
      }).catch(() => {});
    }
  }
}

async function importFile(file: string) {
  const raw = await fsp.readFile(file, 'utf8');
  const json = JSON.parse(raw);
  const tenders: NormTender[] = Array.isArray(json.tenders) ? json.tenders : [];
  let inserted = 0, skipped = 0;
  for (const n of tenders) {
    if (!n.ocid) { skipped++; continue; }
    await upsertOCDSReleaseFromNorm(n);
    await upsertTenderFromNorm(n);
    await upsertDocumentsFromNorm(n);
    inserted++;
  }
  return { inserted, skipped };
}

async function main() {
  const inDir = getArg('in');
  if (!inDir) throw new Error('Missing --in=DIR argument');
  const files = await readJsonFiles(inDir);
  if (!files.length) { console.error('No .json files found'); return; }
  let totalInserted = 0, totalSkipped = 0;
  for (const f of files) {
    const { inserted, skipped } = await importFile(f);
    totalInserted += inserted;
    totalSkipped += skipped;
    console.error(`Imported ${inserted} (skipped ${skipped}) from ${f}`);
  }
  console.error(`Done. Inserted ${totalInserted}, skipped ${totalSkipped}.`);
}

main().finally(async () => { await prisma.$disconnect(); });
