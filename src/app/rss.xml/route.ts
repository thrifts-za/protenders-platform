import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /rss.xml
 * Generate RSS 2.0 feed for blog posts and recent tenders
 *
 * RSS 2.0 Specification: https://www.rssboard.org/rss-specification
 */
export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://protenders.co.za";

  // Sample blog posts - replace with actual blog data
  const blogPosts = [
    {
      slug: "how-to-win-government-tenders-2025",
      title: "How to Win Government Tenders in South Africa: 2025 Complete Guide",
      excerpt:
        "Learn proven strategies to win government tenders in South Africa. Complete guide covering registration, BEE compliance, and proposal writing.",
      publishedDate: "2025-01-15T10:00:00Z",
      author: "ProTenders Team",
    },
    {
      slug: "understanding-bee-certificates",
      title: "Understanding BEE Certificates for Tender Applications",
      excerpt:
        "Everything you need to know about BEE certificates and how they impact your tender applications in South Africa.",
      publishedDate: "2025-01-10T10:00:00Z",
      author: "ProTenders Team",
    },
  ];

  // Get recent tenders from database
  const recentTenders = await prisma.oCDSRelease.findMany({
    where: {
      status: { not: "cancelled" },
      closingAt: { gte: new Date() },
    },
    orderBy: {
      publishedAt: "desc",
    },
    take: 10,
    select: {
      ocid: true,
      slug: true,
      tenderDisplayTitle: true,
      tenderDescription: true,
      buyerName: true,
      mainCategory: true,
      province: true,
      closingAt: true,
      publishedAt: true,
    },
  });

  // Combine blog posts and tenders into feed items
  const feedItems = [
    // Blog posts
    ...blogPosts.map((post) => ({
      type: "blog",
      title: post.title,
      link: `${baseUrl}/blog/${post.slug}`,
      description: post.excerpt,
      pubDate: new Date(post.publishedDate).toUTCString(),
      author: post.author,
      category: "Blog",
      guid: `${baseUrl}/blog/${post.slug}`,
    })),
    // Recent tenders
    ...recentTenders.map((tender) => ({
      type: "tender",
      title: tender.tenderDisplayTitle || "Government Tender Opportunity",
      link: `${baseUrl}/tenders/${tender.slug || tender.ocid}`,
      description:
        tender.tenderDescription?.substring(0, 300) +
        (tender.tenderDescription && tender.tenderDescription.length > 300 ? "..." : ""),
      pubDate: new Date(tender.publishedAt || Date.now()).toUTCString(),
      author: tender.buyerName || "Government Entity",
      category: tender.mainCategory || "",
      guid: `${baseUrl}/tenders/${tender.slug || tender.ocid}`,
    })),
  ];

  // Sort by publication date
  feedItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>ProTenders - Government Tenders &amp; Procurement Intelligence</title>
    <link>${baseUrl}</link>
    <description>Latest government tenders, RFQs, RFPs and procurement insights for South Africa. AI-powered tender discovery and BEE opportunities.</description>
    <language>en-za</language>
    <copyright>Copyright ${new Date().getFullYear()} ProTenders. All rights reserved.</copyright>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${baseUrl}/logo.png</url>
      <title>ProTenders</title>
      <link>${baseUrl}</link>
    </image>
${feedItems
  .slice(0, 50) // Limit to 50 most recent items
  .map(
    (item) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${item.link}</link>
      <description>${escapeXml(item.description || "")}</description>
      <pubDate>${item.pubDate}</pubDate>
      <author>${escapeXml(item.author)}</author>
      ${item.category ? `<category>${escapeXml(item.category)}</category>` : ""}
      <guid isPermaLink="true">${item.guid}</guid>
    </item>`
  )
  .join("\n")}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600", // 30 min cache
    },
  });
}

// Helper function to escape XML special characters
function escapeXml(unsafe: string): string {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
