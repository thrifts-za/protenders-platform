/**
 * Utility functions for looking up tenders by slug or ID
 */

import { prisma } from '@/lib/prisma';
import { generateSlug } from './slug';

/**
 * Find tender by slug (generated from title) or fallback to OCID
 */
export async function findTenderBySlugOrId(slugOrId: string) {
  // First, try to find by OCID (if it's an OCID format)
  if (slugOrId.startsWith('ocds-')) {
    const release = await prisma.oCDSRelease.findFirst({
      where: { ocid: slugOrId },
      orderBy: { date: 'desc' },
    });
    if (release) return release;
  }

  // Try to find by matching slug from title
  // Generate slug from potential titles and search
  const releases = await prisma.oCDSRelease.findMany({
    where: {
      OR: [
        {
          tenderTitle: {
            not: null,
          },
        },
        {
          tenderDisplayTitle: {
            not: null,
          },
        },
      ],
    },
    orderBy: { date: 'desc' },
    take: 1000, // Limit for performance
  });

  // Find matching slug
  for (const release of releases) {
    const title = release.tenderDisplayTitle || release.tenderTitle;
    if (!title) continue;
    
    const slug = generateSlug(title);
    if (slug === slugOrId) {
      return release;
    }
  }

  // Fallback: try exact OCID match (case-insensitive)
  const release = await prisma.oCDSRelease.findFirst({
    where: { 
      ocid: {
        equals: slugOrId,
        mode: 'insensitive',
      },
    },
    orderBy: { date: 'desc' },
  });

  return release || null;
}

/**
 * Get tender slug for a given OCID
 */
export async function getTenderSlug(ocid: string): Promise<string> {
  const release = await prisma.oCDSRelease.findFirst({
    where: { ocid },
    select: {
      tenderDisplayTitle: true,
      tenderTitle: true,
      ocid: true,
    },
    orderBy: { date: 'desc' },
  });

  if (!release) return ocid;

  const title = release.tenderDisplayTitle || release.tenderTitle;
  if (!title) return ocid;

  const slug = generateSlug(title);
  return slug || ocid;
}