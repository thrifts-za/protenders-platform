import { prisma } from "@/lib/db";

/**
 * Log a 404 error to the database
 */
export async function log404Error(data: {
  path: string;
  method?: string;
  userAgent?: string;
  referer?: string;
  ipAddress?: string;
}) {
  try {
    // Check if this 404 path already exists
    const existing = await prisma.errorLog.findFirst({
      where: {
        path: data.path,
        statusCode: 404,
      },
    });

    if (existing) {
      // Increment hit count
      await prisma.errorLog.update({
        where: { id: existing.id },
        data: {
          hitCount: { increment: 1 },
          updatedAt: new Date(),
          // Update metadata with latest request info
          metadata: JSON.stringify({
            ...JSON.parse(existing.metadata || "{}"),
            lastSeen: new Date().toISOString(),
            lastUserAgent: data.userAgent,
            lastReferer: data.referer,
          }),
        },
      });
    } else {
      // Create new 404 log entry
      await prisma.errorLog.create({
        data: {
          path: data.path,
          method: data.method || "GET",
          statusCode: 404,
          message: "Page not found",
          userAgent: data.userAgent,
          referer: data.referer,
          ipAddress: data.ipAddress,
          hitCount: 1,
          metadata: JSON.stringify({
            firstSeen: new Date().toISOString(),
          }),
        },
      });
    }
  } catch (error) {
    console.error("Failed to log 404 error:", error);
    // Silently fail to avoid disrupting the user experience
  }
}

/**
 * Log any application error to the database
 */
export async function logError(data: {
  path: string;
  method: string;
  statusCode: number;
  message: string;
  stack?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await prisma.errorLog.create({
      data: {
        path: data.path,
        method: data.method,
        statusCode: data.statusCode,
        message: data.message,
        stack: data.stack,
        metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
        hitCount: 1,
      },
    });
  } catch (error) {
    console.error("Failed to log error:", error);
  }
}

/**
 * Get the most common 404 errors (for suggesting redirects)
 */
export async function getCommon404s(limit: number = 20) {
  try {
    const errors = await prisma.errorLog.findMany({
      where: {
        statusCode: 404,
      },
      orderBy: {
        hitCount: "desc",
      },
      take: limit,
      select: {
        id: true,
        path: true,
        hitCount: true,
        referer: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return errors;
  } catch (error) {
    console.error("Failed to fetch common 404s:", error);
    return [];
  }
}

/**
 * Suggest redirects based on 404 patterns
 */
export async function suggestRedirectsFor404(path: string) {
  // Simple logic: try to find similar existing paths
  // This can be enhanced with fuzzy matching, common typos, etc.

  try {
    // Extract the last segment of the path
    const segments = path.split("/").filter(Boolean);
    const lastSegment = segments[segments.length - 1];

    if (!lastSegment) {
      return [];
    }

    // Search for tenders with similar slugs
    const tenders = await prisma.oCDSRelease.findMany({
      where: {
        slug: {
          contains: lastSegment,
          mode: "insensitive",
        },
      },
      take: 5,
      select: {
        slug: true,
        tenderDisplayTitle: true,
      },
    });

    return tenders.map((tender) => ({
      toPath: `/tenders/${tender.slug}`,
      title: tender.tenderDisplayTitle || tender.slug,
    }));
  } catch (error) {
    console.error("Failed to suggest redirects:", error);
    return [];
  }
}
