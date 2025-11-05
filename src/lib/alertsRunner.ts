import { prisma } from '@/lib/prisma';

type Frequency = 'daily' | 'weekly';

function isDue(freq: Frequency, last?: Date | null) {
  if (!last) return true;
  const now = Date.now();
  const delta = now - last.getTime();
  if (freq === 'daily') return delta >= 24 * 60 * 60 * 1000;
  return delta >= 7 * 24 * 60 * 60 * 1000;
}

export async function runSavedSearchAlerts(limit = 200) {
  const searches = await prisma.savedSearch.findMany({
    where: { alertFrequency: { in: ['daily', 'weekly'] } },
    orderBy: { updatedAt: 'desc' },
    take: limit,
  });

  let processed = 0;
  let emails = 0;
  let totalFound = 0;

  for (const s of searches) {
    const freq = (s.alertFrequency as Frequency) || 'daily';
    if (!isDue(freq, s.lastAlertSent)) continue;

    const user = await prisma.user.findUnique({ where: { id: s.userId } });
    if (!user?.email) continue;

    const where: any = {};
    const now = new Date();
    const lookbackMs = freq === 'daily' ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
    const since = s.lastAlertSent ?? new Date(Date.now() - lookbackMs);
    where.publishedAt = { gte: since };

    if (s.keywords) {
      const kw = s.keywords.toLowerCase();
      where.OR = [
        { tenderTitle: { contains: kw, mode: 'insensitive' } },
        { tenderDescription: { contains: kw, mode: 'insensitive' } },
        { buyerName: { contains: kw, mode: 'insensitive' } },
      ];
    }
    if (s.categories) {
      try {
        const cats = JSON.parse(s.categories) as string[];
        if (Array.isArray(cats) && cats.length > 0) where.mainCategory = { in: cats };
      } catch {}
    }
    if (s.closingInDays != null) {
      const target = new Date();
      target.setDate(target.getDate() + s.closingInDays);
      where.closingAt = { gte: now, lte: target };
    }
    if (s.buyer) where.buyerName = { contains: s.buyer, mode: 'insensitive' };
    if (s.status) where.status = s.status;

    const tenders = await prisma.oCDSRelease.findMany({
      where,
      select: {
        ocid: true,
        tenderTitle: true,
        buyerName: true,
        mainCategory: true,
        publishedAt: true,
        closingAt: true,
        status: true,
      },
      orderBy: { publishedAt: 'desc' },
      take: 25,
    });

    await prisma.alertLog.create({
      data: {
        userId: s.userId,
        savedSearchId: s.id,
        tendersFound: tenders.length,
        emailSent: true,
      },
    });

    await prisma.mailLog.create({
      data: {
        to: user.email,
        subject: `ProTenders Alerts: ${tenders.length} new tenders`,
        status: 'SENT',
      },
    });

    await prisma.savedSearch.update({ where: { id: s.id }, data: { lastAlertSent: new Date() } });

    processed += 1;
    emails += 1;
    totalFound += tenders.length;
  }

  return { processed, emails, totalFound };
}

