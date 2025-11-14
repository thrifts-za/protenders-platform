import { NextResponse } from "next/server";

/**
 * GET /news-sitemap.xml
 * Generate a Google News-compatible sitemap for blog posts and funding guides
 *
 * Google News Sitemap spec:
 * https://support.google.com/news/publisher-center/answer/9606710
 */

// Sample blog post data - replace with actual data from your CMS/database
const blogPosts = [
  {
    slug: "how-to-win-government-tenders-2025",
    title: "How to Win Government Tenders in South Africa: 2025 Complete Guide",
    publishedDate: "2025-01-15",
    tags: ["Government Tenders", "BEE", "Procurement"],
  },
  {
    slug: "understanding-bee-certificates",
    title: "Understanding BEE Certificates for Tender Applications",
    publishedDate: "2025-01-10",
    tags: ["BEE", "Compliance"],
  },
  {
    slug: "etenders-portal-guide",
    title: "eTenders Portal: Step-by-Step Registration Guide",
    publishedDate: "2025-01-05",
    tags: ["eTenders", "Guide"],
  },
];

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://protenders.co.za";

  // Filter posts from last 2 days (Google News requirement)
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const recentPosts = blogPosts.filter((post) => {
    const publishDate = new Date(post.publishedDate);
    return publishDate >= twoDaysAgo;
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
