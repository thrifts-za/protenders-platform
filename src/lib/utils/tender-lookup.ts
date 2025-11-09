/**
 * Utility functions for looking up tenders by slug or ID
 */

import { prisma } from '@/lib/prisma';
import { generateSlug } from './slug';

/**
 * Find tender by slug (generated from title) or fallback to OCID
 *
 * Performance: Direct database queries instead of in-memory iteration
 * Expected improvement: 1500-2500ms reduction per page load
 */
export async function findTenderBySlugOrId(slugOrId: string) {
  // Strategy 1: Try slug lookup first (fastest, uses indexed slug field)
  // This will be the primary lookup method after backfill is complete
  let release = await prisma.oCDSRelease.findUnique({
    where: { slug: slugOrId },
  });
  if (release) return release;

  // Strategy 2: Try OCID lookup (for direct OCID access or legacy URLs)
  release = await prisma.oCDSRelease.findFirst({
    where: { ocid: slugOrId },
    orderBy: { date: 'desc' },
  });
  if (release) return release;

  // Strategy 3: Try UUID lookup (for internal references)
  // Check if it looks like a UUID format
  if (slugOrId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    release = await prisma.oCDSRelease.findUnique({
      where: { id: slugOrId },
    });
    if (release) return release;
  }

  // Strategy 4: Case-insensitive OCID fallback
  release = await prisma.oCDSRelease.findFirst({
    where: {
      ocid: {
        equals: slugOrId,
        mode: 'insensitive',
      },
    },
    orderBy: { date: 'desc' },
  });
  if (release) return release;

  // Strategy 5: Legacy fallback for old slug-like URLs (before slug field existed)
  // Only used during transition period until backfill is complete
  // This can be removed after confirming all slugs are populated
  if (!slugOrId.startsWith('ocds-')) {
    const releases = await prisma.oCDSRelease.findMany({
      where: {
        slug: null, // Only check records without slugs (transitional)
        OR: [
          { tenderTitle: { not: null } },
          { tenderDisplayTitle: { not: null } },
        ],
      },
      orderBy: { date: 'desc' },
      take: 100, // Reduced from 1000 for safety
    });

    // Find matching slug in records without slug field populated
    for (const r of releases) {
      const title = r.tenderDisplayTitle || r.tenderTitle;
      if (!title) continue;

      const generatedSlug = generateSlug(title);
      if (generatedSlug === slugOrId) {
        return r;
      }
    }
  }

  return null;
}

/**
 * Get tender slug for a given OCID
 *
 * Performance: Returns pre-computed slug from database instead of generating on-the-fly
 */
export async function getTenderSlug(ocid: string): Promise<string> {
  const release = await prisma.oCDSRelease.findFirst({
    where: { ocid },
    select: {
      slug: true,
      tenderDisplayTitle: true,
      tenderTitle: true,
      ocid: true,
    },
    orderBy: { date: 'desc' },
  });

  if (!release) return ocid;

  // Use pre-computed slug if available
  if (release.slug) return release.slug;

  // Fallback: generate slug if not yet backfilled
  const title = release.tenderDisplayTitle || release.tenderTitle;
  if (!title) return ocid;

  const slug = generateSlug(title);
  return slug || ocid;
}