/**
 * Image SEO Automation Utilities
 * Auto-generate alt text, optimize images, and create image sitemaps
 */

interface ImageMetadata {
  url: string;
  alt?: string;
  title?: string;
  width?: number;
  height?: number;
}

/**
 * Generate SEO-friendly alt text for images
 * Based on context, filename, and surrounding content
 */
export function generateAltText(context: {
  filename?: string;
  pageTitle?: string;
  nearbyText?: string;
  imageType?: "logo" | "hero" | "thumbnail" | "diagram" | "photo";
}): string {
  const { filename, pageTitle, nearbyText, imageType } = context;

  // Extract meaningful keywords from filename
  const fileKeywords = filename
    ? filename
        .replace(/\.[^/.]+$/, "") // Remove extension
        .replace(/[-_]/g, " ") // Replace dashes/underscores with spaces
        .replace(/\d+/g, "") // Remove numbers
        .trim()
    : "";

  // Build alt text based on available context
  const parts: string[] = [];

  if (imageType === "logo") {
    return `${pageTitle || "ProTenders"} Logo`;
  }

  if (imageType === "hero" && pageTitle) {
    return `${pageTitle} - ProTenders Government Tenders Platform`;
  }

  if (nearbyText) {
    // Use nearby text as primary alt text
    parts.push(nearbyText.substring(0, 100));
  } else if (fileKeywords) {
    parts.push(fileKeywords);
  }

  if (pageTitle && !parts.some((p) => p.includes(pageTitle))) {
    parts.push(`related to ${pageTitle}`);
  }

  const altText = parts.join(" - ");

  // Ensure alt text is not too long (max 125 characters recommended)
  return altText.length > 125 ? altText.substring(0, 122) + "..." : altText;
}

/**
 * Generate title attribute for images (tooltip on hover)
 */
export function generateImageTitle(alt: string, additionalContext?: string): string {
  if (additionalContext) {
    return `${alt} | ${additionalContext}`;
  }
  return alt;
}

/**
 * Optimize image URL for performance
 * Adds Next.js image optimization parameters
 */
export function optimizeImageUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: "webp" | "avif" | "jpeg" | "png";
  } = {}
): string {
  const { width = 1200, quality = 80, format = "webp" } = options;

  // If it's an external URL, return as-is (or use a proxy)
  if (url.startsWith("http")) {
    return url;
  }

  // For internal images, use Next.js Image Optimization API
  const params = new URLSearchParams({
    url: url,
    w: width.toString(),
    q: quality.toString(),
  });

  return `/_next/image?${params.toString()}`;
}

/**
 * Extract images from HTML content for sitemap generation
 */
export function extractImagesFromHtml(html: string): ImageMetadata[] {
  const images: ImageMetadata[] = [];
  const imgRegex = /<img[^>]+>/gi;
  const srcRegex = /src=["']([^"']+)["']/i;
  const altRegex = /alt=["']([^"']+)["']/i;
  const titleRegex = /title=["']([^"']+)["']/i;
  const widthRegex = /width=["']?(\d+)["']?/i;
  const heightRegex = /height=["']?(\d+)["']?/i;

  const matches = html.match(imgRegex);
  if (!matches) return images;

  for (const imgTag of matches) {
    const srcMatch = imgTag.match(srcRegex);
    if (!srcMatch) continue;

    const url = srcMatch[1];
    const altMatch = imgTag.match(altRegex);
    const titleMatch = imgTag.match(titleRegex);
    const widthMatch = imgTag.match(widthRegex);
    const heightMatch = imgTag.match(heightRegex);

    images.push({
      url,
      alt: altMatch ? altMatch[1] : undefined,
      title: titleMatch ? titleMatch[1] : undefined,
      width: widthMatch ? parseInt(widthMatch[1], 10) : undefined,
      height: heightMatch ? parseInt(heightMatch[1], 10) : undefined,
    });
  }

  return images;
}

/**
 * Generate image sitemap XML
 * https://developers.google.com/search/docs/crawling-indexing/sitemaps/image-sitemaps
 */
export function generateImageSitemap(
  pages: Array<{
    url: string;
    images: ImageMetadata[];
  }>
): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://protenders.co.za";

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${pages
  .map(
    (page) => `  <url>
    <loc>${baseUrl}${page.url}</loc>
${page.images
  .map(
    (img) => `    <image:image>
      <image:loc>${img.url.startsWith("http") ? img.url : baseUrl + img.url}</image:loc>
      ${img.alt ? `<image:caption>${escapeXml(img.alt)}</image:caption>` : ""}
      ${img.title ? `<image:title>${escapeXml(img.title)}</image:title>` : ""}
    </image:image>`
  )
  .join("\n")}
  </url>`
  )
  .join("\n")}
</urlset>`;
}

/**
 * Generate structured data for images (ImageObject schema)
 */
export function generateImageSchema(image: {
  url: string;
  alt: string;
  width?: number;
  height?: number;
  caption?: string;
  author?: string;
  license?: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://protenders.co.za";
  const fullUrl = image.url.startsWith("http") ? image.url : baseUrl + image.url;

  return {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    contentUrl: fullUrl,
    url: fullUrl,
    name: image.alt,
    description: image.caption || image.alt,
    width: image.width ? `${image.width}px` : undefined,
    height: image.height ? `${image.height}px` : undefined,
    author: image.author
      ? {
          "@type": "Person",
          name: image.author,
        }
      : undefined,
    license: image.license,
  };
}

/**
 * Escape XML special characters
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Get recommended image dimensions for different contexts
 */
export const IMAGE_DIMENSIONS = {
  // OpenGraph / Social Media
  og: { width: 1200, height: 630 },
  twitter: { width: 1200, height: 600 },

  // Hero images
  hero: { width: 1920, height: 1080 },
  heroMobile: { width: 768, height: 1024 },

  // Thumbnails
  thumbnail: { width: 400, height: 300 },
  thumbnailSmall: { width: 200, height: 150 },

  // Logos
  logo: { width: 512, height: 512 },
  logoSmall: { width: 128, height: 128 },

  // Content images
  contentFull: { width: 1200, height: 800 },
  contentHalf: { width: 600, height: 400 },
} as const;

/**
 * Check if image alt text is SEO-friendly
 */
export function validateAltText(altText: string): {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];

  // Check length
  if (altText.length < 10) {
    issues.push("Alt text is too short");
    suggestions.push("Aim for 10-125 characters for optimal SEO");
  }

  if (altText.length > 125) {
    issues.push("Alt text is too long");
    suggestions.push("Keep alt text under 125 characters");
  }

  // Check for keyword stuffing
  const words = altText.toLowerCase().split(/\s+/);
  const wordCount = words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const repeatedWords = Object.entries(wordCount).filter(([_, count]) => count > 2);
  if (repeatedWords.length > 0) {
    issues.push("Possible keyword stuffing detected");
    suggestions.push("Avoid repeating keywords excessively");
  }

  // Check for generic phrases
  const genericPhrases = ["image of", "picture of", "photo of", "graphic of"];
  if (genericPhrases.some((phrase) => altText.toLowerCase().includes(phrase))) {
    issues.push("Contains generic phrases");
    suggestions.push("Remove phrases like 'image of' or 'picture of' - they're implied");
  }

  return {
    isValid: issues.length === 0,
    issues,
    suggestions,
  };
}
