/**
 * Admin: Enrichment Progress API
 * GET /api/admin/enrichment/progress
 *
 * Returns unenriched counts by year and all-time using the same criteria
 * as backfill (missing province/contact/briefing/documents).
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function startOfYear(y: number) { return new Date(Date.UTC(y, 0, 1, 0, 0, 0)); }
function endOfYear(y: number) { return new Date(Date.UTC(y, 11, 31, 23, 59, 59)); }

async function countsForRange(from: Date, to: Date) {
  // Use SQL for robust JSON null/empty handling
  const rows = await prisma.$queryRaw<Array<{ total: bigint; unenriched: bigint }>>`
    SELECT
      COUNT(*) FILTER (WHERE "date" BETWEEN ${from} AND ${to}) AS total,
      COUNT(*) FILTER (
        WHERE "date" BETWEEN ${from} AND ${to}
          AND (
            "province" IS NULL
            OR "contactEmail" IS NULL
            OR "briefingDate" IS NULL
            OR "briefingVenue" IS NULL
            OR "briefingCompulsory" IS NULL
            OR "hasBriefing" IS NULL
            OR "enrichmentDocuments" IS NULL
            OR jsonb_typeof("enrichmentDocuments") = 'null'
            OR "enrichmentDocuments" = '[]'::jsonb
          )
      ) AS unenriched
    FROM "OCDSRelease";
  `;
  const rec: any = rows[0] || { total: 0, unenriched: 0 };
  const total = Number(rec.total || 0);
  const unenriched = Number(rec.unenriched || 0);
  return { total, unenriched, enriched: Math.max(0, total - unenriched) };
}

export async function GET(_req: NextRequest) {
  try {
    const now = new Date();
    const y2024 = await countsForRange(startOfYear(2024), endOfYear(2024));
    const y2025 = await countsForRange(startOfYear(2025), endOfYear(2025));
    // All-time computed from min(date) to now
    const min = await prisma.oCDSRelease.aggregate({ _min: { date: true } });
    const from = min._min.date ? new Date(min._min.date) : new Date('2021-01-01T00:00:00Z');
    const all = await countsForRange(from, now);

    const format = (c: { total: number; unenriched: number; enriched: number }) => ({
      total: c.total,
      unenriched: c.unenriched,
      enriched: c.enriched,
      percent: c.total ? Math.round((c.enriched / c.total) * 100) : 0,
    });

    return NextResponse.json({
      years: {
        '2024': format(y2024),
        '2025': format(y2025),
        allTime: format(all),
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Enrichment progress failed:', error);
    return NextResponse.json({ error: 'Failed to get enrichment progress', message: (error as Error)?.message }, { status: 500 });
  }
}
