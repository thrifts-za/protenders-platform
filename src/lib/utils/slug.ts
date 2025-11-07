/**
 * Utility functions for generating SEO-friendly slugs from tender titles
 */

/**
 * Generate a URL-friendly slug from a string
 * Removes special characters, converts to lowercase, replaces spaces with hyphens
 */
export function generateSlug(text: string): string {
  if (!text) return "";
  
  return text
    .toLowerCase()
    .trim()
    // Replace common special characters with spaces
    .replace(/[^\w\s-]/g, "")
    // Replace multiple spaces/hyphens with single hyphen
    .replace(/[\s_-]+/g, "-")
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, "")
    // Limit length to 100 characters for SEO
    .slice(0, 100);
}

/**
 * Generate a slug from tender title/description combined with ID for uniqueness
 * Format: {descriptive-slug}-{id}
 * Examples:
 * - "Ethics and Anti-Money Laundering (AML) Training" + "ocds-9t57fa-123"
 *   -> "ethics-and-anti-money-laundering-aml-training-ocds-9t57fa-123"
 * - "LB198" + "ocds-9t57fa-139481" -> "lb198-ocds-9t57fa-139481"
 */
export function generateTenderSlug(titleOrDescription: string, id: string): string {
  const slug = generateSlug(titleOrDescription);
  // If slug is empty or too short, use only ID
  if (!slug || slug.length < 2) {
    return id;
  }
  // Always combine slug with ID for uniqueness and SEO
  return `${slug}-${id}`;
}

/**
 * Generate a tender URL with description for better SEO
 * Prefers description over title as it's more descriptive
 */
export function createTenderUrlFromTitleAndDescription(
  title: string,
  description: string | null | undefined,
  id: string
): string {
  // Use description if available (more SEO-friendly), otherwise fall back to title
  const textForSlug = description && description.trim().length > 10
    ? description
    : title;
  const slug = generateTenderSlug(textForSlug, id);
  return createTenderUrl(slug);
}

/**
 * Extract tender ID from slug (for backward compatibility)
 * Handles both formats:
 * - New format: "lb198-ocds-9t57fa-139481" -> "ocds-9t57fa-139481"
 * - Old format: "ocds-9t57fa-139481" -> "ocds-9t57fa-139481"
 * - Other formats: "dbn-2152025" -> "dbn-2152025" (pass through)
 */
export function extractTenderIdFromSlug(slug: string): string {
  // If slug looks like an OCID format (ocds-), return as-is (backward compatibility)
  if (slug.startsWith("ocds-")) {
    return slug;
  }

  // Try to extract OCID from combined slug format: "title-slug-ocds-9t57fa-xxxxx"
  const ocidMatch = slug.match(/(ocds-[a-z0-9]+-\d+)/i);
  if (ocidMatch) {
    return ocidMatch[1];
  }

  // Otherwise, treat the whole slug as the ID (for legacy or non-standard formats)
  return slug;
}

/**
 * Create a full tender URL with slug
 * Uses /tender/ path with slug from tender title
 */
export function createTenderUrl(slug: string): string {
  return `/tender/${slug}`;
}

/**
 * Create a full tender URL with slug from title and ID
 * This is a convenience function that uses title only (for backward compatibility)
 * For better SEO, use createTenderUrlFromTitleAndDescription instead
 */
export function createTenderUrlFromTitle(title: string, id: string): string {
  const slug = generateTenderSlug(title, id);
  return createTenderUrl(slug);
}