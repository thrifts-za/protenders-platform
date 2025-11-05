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
 * Generate a slug from tender title with fallback to ID
 */
export function generateTenderSlug(title: string, id: string): string {
  const slug = generateSlug(title);
  // If slug is empty or too short, use ID as fallback
  if (!slug || slug.length < 3) {
    return id;
  }
  return slug;
}

/**
 * Extract tender ID from slug (for backward compatibility)
 * If slug contains the ID format, extract it
 */
export function extractTenderIdFromSlug(slug: string): string {
  // If slug looks like an OCID format (ocds-etenders-za-xxxxx), return as-is
  if (slug.startsWith("ocds-")) {
    return slug;
  }
  // Otherwise, treat as slug and we'll need to look up by slug
  return slug;
}

/**
 * Create a full tender URL with slug
 */
export function createTenderUrl(slug: string): string {
  return `/tender/${slug}`;
}

/**
 * Create a full tender URL with slug from title and ID
 */
export function createTenderUrlFromTitle(title: string, id: string): string {
  const slug = generateTenderSlug(title, id);
  return createTenderUrl(slug);
}