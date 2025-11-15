import { NextResponse } from "next/server";
import { blogPosts } from "@/data/blogPosts";

/**
 * GET /news-sitemap.xml
 * Generate a Google News-compatible sitemap for blog posts
 *
 * Google News Sitemap spec:
 * https://support.google.com/news/publisher-center/answer/9606710
 */

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.protenders.co.za";

  // Filter posts from last 7 days (Google News prefers recent content)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentPosts = blogPosts.filter((post) => {
    const publishDate = new Date(post.publishedDate);
    return publishDate >= sevenDaysAgo;
  });

  // Generate news sitemap XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${recentPosts
  .map(
    (post) => `  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>ProTenders</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${post.publishedDate}</news:publication_date>
      <news:title>${escapeXml(post.title)}</news:title>
      <news:keywords>${post.tags.join(", ")}</news:keywords>
    </news:news>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
    },
  });
}

// Helper function to escape XML special characters
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
