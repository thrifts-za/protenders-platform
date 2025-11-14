import { prisma } from "@/lib/db";

export interface RecommendedTender {
  id: string;
  ocid: string;
  slug: string | null;
  tenderDisplayTitle: string | null;
  buyerName: string | null;
  mainCategory: string | null;
  province: string | null;
  closingAt: Date | null;
  similarityScore: number; // 0-100
  matchReason: string;
}

/**
 * Weighted scoring algorithm for tender recommendations
 * - Same category: 40 points
 * - Same province: 30 points
 * - Similar keywords in title: up to 30 points
 */
export async function getRelatedTenders(
  tenderId: string,
  limit: number = 6
): Promise<RecommendedTender[]> {
  try {
    // Get the source tender
    const sourceTender = await prisma.oCDSRelease.findUnique({
      where: { id: tenderId },
      select: {
        ocid: true,
        mainCategory: true,
        province: true,
        tenderDisplayTitle: true,
        tenderDescription: true,
        status: true,
      },
    });

    if (!sourceTender) {
      return [];
    }

    // Extract keywords from title (simple approach - can be enhanced with NLP)
    const titleKeywords = extractKeywords(sourceTender.tenderDisplayTitle || "");

    // Build query to find similar tenders
    const candidates = await prisma.oCDSRelease.findMany({
      where: {
        AND: [
          { id: { not: tenderId } }, // Exclude the source tender
          { status: { not: "cancelled" } }, // Only active tenders
          {
            OR: [
              { mainCategory: sourceTender.mainCategory },
              { province: sourceTender.province },
              // Title contains any of the keywords
              ...(titleKeywords.length > 0
                ? titleKeywords.map((keyword) => ({
                    tenderDisplayTitle: {
                      contains: keyword,
                      mode: "insensitive" as const,
                    },
                  }))
                : []),
            ],
          },
        ],
      },
      select: {
        id: true,
        ocid: true,
        slug: true,
        tenderDisplayTitle: true,
        buyerName: true,
        mainCategory: true,
        province: true,
        closingAt: true,
        tenderDescription: true,
      },
      take: limit * 3, // Get more candidates for scoring
    });

    // Score each candidate
    const scored = candidates.map((candidate) => {
      let score = 0;
      const matchReasons: string[] = [];

      // Category match (40 points)
      if (candidate.mainCategory === sourceTender.mainCategory) {
        score += 40;
        matchReasons.push("Same category");
      }

      // Province match (30 points)
      if (candidate.province === sourceTender.province) {
        score += 30;
        matchReasons.push("Same province");
      }

      // Keyword similarity (up to 30 points)
      const candidateKeywords = extractKeywords(candidate.tenderDisplayTitle || "");
      const commonKeywords = titleKeywords.filter((kw) =>
        candidateKeywords.some((ckw) => ckw.toLowerCase().includes(kw.toLowerCase()) || kw.toLowerCase().includes(ckw.toLowerCase()))
      );

      if (commonKeywords.length > 0) {
        const keywordScore = Math.min(30, commonKeywords.length * 10);
        score += keywordScore;
        if (commonKeywords.length > 0) {
          matchReasons.push(`${commonKeywords.length} shared keywords`);
        }
      }

      return {
        ...candidate,
        similarityScore: score,
        matchReason: matchReasons.join(", ") || "Similar tender",
      };
    });

    // Sort by score and return top results
    const recommended = scored
      .filter((t) => t.similarityScore > 0) // Only return tenders with some similarity
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, limit);

    return recommended;
  } catch (error) {
    console.error("Error getting related tenders:", error);
    return [];
  }
}

/**
 * Extract meaningful keywords from a title/description
 * Filters out common stop words and short words
 */
function extractKeywords(text: string): string[] {
  if (!text) return [];

  const stopWords = new Set([
    "the",
    "and",
    "for",
    "with",
    "from",
    "this",
    "that",
    "will",
    "are",
    "was",
    "were",
    "been",
    "have",
    "has",
    "had",
    "not",
    "but",
    "can",
    "all",
    "one",
    "two",
    "three",
    "four",
    "five",
    "their",
    "what",
    "which",
    "who",
    "when",
    "where",
    "why",
    "how",
    "services",
    "service",
    "supply",
    "provision",
    "appointment",
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ") // Remove punctuation
    .split(/\s+/)
    .filter((word) => word.length > 3 && !stopWords.has(word)); // Filter short words and stop words

  // Return unique keywords
  return [...new Set(words)];
}

/**
 * Get recommended funding opportunities based on user's saved tenders
 */
export async function getRecommendedFunding(
  userId: string,
  limit: number = 5
) {
  try {
    // Get user's saved tenders to understand their interests
    const savedTenders = await prisma.savedTender.findMany({
      where: { userId },
      include: {
        tender: {
          select: {
            mainProcurementCategory: true,
          },
        },
      },
      take: 20, // Look at recent 20 saved tenders
    });

    if (savedTenders.length === 0) {
      // No saved tenders, return popular funding opportunities
      return prisma.fundingOpportunity.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        take: limit,
      });
    }

    // Extract categories from saved tenders
    const categories = savedTenders
      .map((st) => st.tender.mainProcurementCategory)
      .filter(Boolean);

    const uniqueCategories = [...new Set(categories)];

    // Find funding opportunities matching these categories
    const funding = await prisma.fundingOpportunity.findMany({
      where: {
        isActive: true,
        OR: uniqueCategories.map((category) => ({
          categories: {
            has: category,
          },
        })),
      },
      take: limit,
    });

    return funding;
  } catch (error) {
    console.error("Error getting recommended funding:", error);
    return [];
  }
}

/**
 * Get "You may also be interested in" suggestions for a funding opportunity
 */
export async function getRelatedFunding(
  fundingId: string,
  limit: number = 4
) {
  try {
    const sourceFunding = await prisma.fundingOpportunity.findUnique({
      where: { id: fundingId },
      select: {
        categories: true,
        provinces: true,
        fundingType: true,
        institution: true,
      },
    });

    if (!sourceFunding) {
      return [];
    }

    // Find related funding opportunities
    const related = await prisma.fundingOpportunity.findMany({
      where: {
        AND: [
          { id: { not: fundingId } },
          { isActive: true },
          {
            OR: [
              // Same categories
              {
                categories: {
                  hasSome: sourceFunding.categories,
                },
              },
              // Same provinces
              {
                provinces: {
                  hasSome: sourceFunding.provinces,
                },
              },
              // Same funding type
              { fundingType: sourceFunding.fundingType },
              // Same institution
              { institution: sourceFunding.institution },
            ],
          },
        ],
      },
      take: limit * 2, // Get more for scoring
    });

    // Score by similarity
    const scored = related.map((candidate) => {
      let score = 0;

      // Shared categories
      const sharedCategories = candidate.categories.filter((c) =>
        sourceFunding.categories.includes(c)
      );
      score += sharedCategories.length * 20;

      // Shared provinces
      const sharedProvinces = candidate.provinces.filter((p) =>
        sourceFunding.provinces.includes(p)
      );
      score += sharedProvinces.length * 15;

      // Same funding type
      if (candidate.fundingType === sourceFunding.fundingType) {
        score += 30;
      }

      // Same institution
      if (candidate.institution === sourceFunding.institution) {
        score += 35;
      }

      return { ...candidate, similarityScore: score };
    });

    // Return top scored
    return scored
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, limit);
  } catch (error) {
    console.error("Error getting related funding:", error);
    return [];
  }
}
