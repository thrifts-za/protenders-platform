import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { enrichTenderFromEtenders } from './etendersEnricher';
import { RATE_LIMIT_DELAY_MS } from './constants';

export interface BackfillOptions {
  from: string; // YYYY-MM-DD
  to: string;   // YYYY-MM-DD
  limit?: number; // max rows to process
  delayMs?: number; // delay between enrichment calls
  timeBudgetMs?: number; // stop early when budget exceeded
  cancelFlagKey?: string; // Config key to check for cancellation
}

export interface BackfillResult {
  processed: number;
  updated: number;
  skipped: number;
  failures: number;
  cancelled?: boolean;
  stoppedEarly?: boolean;
}

function toStart(dateStr: string) { return new Date(`${dateStr}T00:00:00Z`); }
function toEnd(dateStr: string) { return new Date(`${dateStr}T23:59:59Z`); }

function deriveTenderNumber(raw: any): string | null {
  const t = raw?.tender;
  if (!t) return null;
  const title = typeof t.title === 'string' ? t.title.trim() : '';
  if (title) {
    let m = title.match(/\b(RFQ|RFP|RFB|RFT|RFI|RFA|RFPQ|RFBQ|EOI)[-_\s:/]*([A-Z0-9/\.-]{3,})/i);
    if (m) return (m[0] || title).replace(/\s+/g, '');
    m = title.match(/([A-Z0-9/\.-]{3,})[-_\s:/]*(RFQ|RFP|RFB|RFT|RFI|RFA|RFPQ|RFBQ|EOI)\b/i);
    if (m) return (m[0] || title).replace(/\s+/g, '');
  }
  if (typeof t.id === 'string' && t.id.trim()) return t.id.trim();
  if (typeof t.id === 'number') return String(t.id);
  return null;
}

export async function backfillEnrichment(opts: BackfillOptions): Promise<BackfillResult> {
  const startedAt = Date.now();
  const from = opts.from;
  const to = opts.to;
  const limit = Math.max(1, Math.min(5000, opts.limit ?? 1000));
  const delayMs = Math.max(0, opts.delayMs ?? RATE_LIMIT_DELAY_MS);
  const timeBudgetMs = Math.max(0, opts.timeBudgetMs ?? Number.POSITIVE_INFINITY);
  const cancelFlagKey = opts.cancelFlagKey || 'enrich_backfill_cancel';

  const rows = await prisma.oCDSRelease.findMany({
    where: {
      date: { gte: toStart(from), lte: toEnd(to) },
      OR: [
        { province: null },
        { contactEmail: null },
        { briefingDate: null },
        { briefingVenue: null },
        { briefingCompulsory: null },
        { hasBriefing: null },
        { OR: [
          { enrichmentDocuments: { equals: Prisma.DbNull } },
          { enrichmentDocuments: { equals: [] as any } },
        ] },
        // Phase 2: Include records missing new enrichment fields
        { organOfStateType: null },
        { hasESubmission: null },
        { documentCount: null },
        { tenderTypeCategory: null },
        { dataQualityScore: null },
      ],
    },
    orderBy: { date: 'asc' },
    take: limit,
  });

  let processed = 0, updated = 0, skipped = 0, failures = 0;
  let cancelled = false;
  let stoppedEarly = false;

  let i = 0;
  for (const r of rows) {
    try {
      // Timebox
      if (Date.now() - startedAt > timeBudgetMs) {
        console.log('⏱️  Time budget exceeded — stopping early');
        stoppedEarly = true;
        break;
      }
      // Cancellation flag check (every 10 rows to reduce DB chatter)
      if (i % 10 === 0) {
        try {
          const cfg = await prisma.config.findUnique({ where: { key: cancelFlagKey } });
          if (cfg && (cfg.value || '').toLowerCase() === 'true') {
            console.log('🛑 Cancel flag detected — aborting backfill');
            cancelled = true;
            break;
          }
        } catch {}
      }
      const raw = JSON.parse(r.json as any);
      const tenderNumber = deriveTenderNumber(raw);
      const buyerName = raw?.buyer?.name || raw?.tender?.procuringEntity?.name;
      const title = raw?.tender?.title;
      const tenderIdHint = raw?.tender?.id != null ? String(raw?.tender?.id) : undefined;

      const e = await enrichTenderFromEtenders(tenderNumber || title || tenderIdHint || '', delayMs, {
        buyerName,
        title,
        tenderIdHint,
      });
      if (!e) { processed++; skipped++; continue; }

      await prisma.oCDSRelease.update({
        where: { ocid_date: { ocid: r.ocid, date: r.date } },
        data: {
          province: e.province || r.province,
          deliveryLocation: e.deliveryLocation || r.deliveryLocation,
          specialConditions: e.specialConditions || r.specialConditions,
          contactPerson: e.contactPerson || r.contactPerson,
          contactEmail: e.contactEmail || r.contactEmail,
          contactTelephone: e.contactTelephone || r.contactTelephone,
          briefingDate: e.briefingDate || r.briefingDate,
          briefingTime: e.briefingTime || r.briefingTime,
          briefingVenue: e.briefingVenue || r.briefingVenue,
          briefingMeetingLink: e.briefingMeetingLink || r.briefingMeetingLink,
          tenderType: e.tenderType || r.tenderType,
          hasBriefing: (typeof e.hasBriefing === 'boolean' ? e.hasBriefing : r.hasBriefing) ?? null,
          briefingCompulsory: (typeof e.briefingCompulsory === 'boolean' ? e.briefingCompulsory : r.briefingCompulsory) ?? null,
          enrichmentDocuments: Array.isArray(e.documents) ? (e.documents as any) : (r as any).enrichmentDocuments,

          // Phase 2: Deep Filtering Enhancement Fields
          organOfStateType: e.organOfStateType || r.organOfStateType,
          hasESubmission: (typeof e.hasESubmission === 'boolean' ? e.hasESubmission : r.hasESubmission) ?? null,
          estimatedValueMin: e.estimatedValueMin ?? r.estimatedValueMin,
          estimatedValueMax: e.estimatedValueMax ?? r.estimatedValueMax,
          documentCount: (typeof e.documentCount === 'number' ? e.documentCount : r.documentCount) ?? null,
          hasDocuments: (typeof e.hasDocuments === 'boolean' ? e.hasDocuments : r.hasDocuments) ?? null,
          city: e.city ?? r.city,
          district: e.district ?? r.district,
          tenderTypeCategory: e.tenderTypeCategory || r.tenderTypeCategory,
          dataQualityScore: (typeof e.dataQualityScore === 'number' ? e.dataQualityScore : r.dataQualityScore) ?? null,
          municipalityType: e.municipalityType ?? r.municipalityType,
          departmentLevel: e.departmentLevel ?? r.departmentLevel,

          // Update enrichedAt timestamp
          enrichedAt: new Date(),
        },
      });
      updated++; processed++; i++;
    } catch (err) {
      failures++; processed++; i++;
      console.error(`Backfill enrich failed for ${r.ocid}:`, err instanceof Error ? err.message : err);
    }
  }

  return { processed, updated, skipped, failures, cancelled, stoppedEarly };
}
