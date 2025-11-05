#!/usr/bin/env tsx
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import { prisma } from '../src/lib/prisma';
import { Prisma } from '@prisma/client';

function startOfYear(y: number) { return new Date(Date.UTC(y, 0, 1, 0, 0, 0)); }
function endOfYear(y: number) { return new Date(Date.UTC(y, 11, 31, 23, 59, 59)); }

async function countsForRange(from: Date, to: Date) {
  const total = await prisma.oCDSRelease.count({ where: { date: { gte: from, lte: to } } });
  const unenriched = await prisma.oCDSRelease.count({
    where: {
      date: { gte: from, lte: to },
      OR: [
        { province: null },
        { contactEmail: null },
        { briefingDate: null },
        { briefingVenue: null },
        { briefingCompulsory: null },
        { hasBriefing: null },
        { enrichmentDocuments: { equals: Prisma.DbNull } },
      ],
    },
  });
  return { total, unenriched, enriched: Math.max(0, total - unenriched) };
}

async function main() {
  const y2025 = await countsForRange(startOfYear(2025), endOfYear(2025));
  console.log('2025', y2025);
  const min = await prisma.oCDSRelease.aggregate({ _min: { date: true } });
  const from = min._min.date ? new Date(min._min.date) : new Date('2021-01-01T00:00:00Z');
  const all = await countsForRange(from, new Date());
  console.log('All', all);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });

