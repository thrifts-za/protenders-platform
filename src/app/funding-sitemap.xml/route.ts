import { prisma } from '@/lib/prisma'
import { fundingGuides } from '@/data/fundingGuides'

export async function GET() {
  const baseUrl = 'https://www.protenders.co.za'

  try {
    // Funding opportunity pages
    const activeFunding = await prisma.fundingOpportunity.findMany({
      where: {
        isActive: true,
      },
      select: {
        slug: true,
        updatedAt: true,
        programName: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    const fundingUrls = activeFunding.map((funding) => {
      const lastmod = funding.updatedAt ? funding.updatedAt.toISOString() : new Date().toISOString()
      return `
    <url>
      <loc>${baseUrl}/funding/${funding.slug}</loc>
      <lastmod>${lastmod}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>`
    }).join('')

    // Funding guide pages
    const fundingGuideUrls = fundingGuides.map((guide) => {
      const lastmod = guide.updatedDate ? new Date(guide.updatedDate).toISOString() : new Date(guide.publishedDate).toISOString()
      const priority = guide.featured ? '0.85' : '0.80'
      return `
    <url>
      <loc>${baseUrl}/funding/guides/${guide.slug}</loc>
      <lastmod>${lastmod}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>${priority}</priority>
    </url>`
    }).join('')

    // Main funding pages
    const mainFundingPages = `
    <url>
      <loc>${baseUrl}/funding</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>daily</changefreq>
      <priority>0.95</priority>
    </url>
    <url>
      <loc>${baseUrl}/funding/search</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>daily</changefreq>
      <priority>0.9</priority>
    </url>
    <url>
      <loc>${baseUrl}/funding/match</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.85</priority>
    </url>
    <url>
      <loc>${baseUrl}/funding/guides</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.85</priority>
    </url>`

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${mainFundingPages}
  ${fundingUrls}
  ${fundingGuideUrls}
</urlset>`

    console.log(`✅ Generated ${activeFunding.length} funding opportunities + ${fundingGuides.length} guides for funding sitemap`)

    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=7200, s-maxage=7200', // Cache for 2 hours
      },
    })
  } catch (error) {
    console.error('Error generating funding sitemap:', error)

    const emptySitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`

    return new Response(emptySitemap, {
      headers: {
        'Content-Type': 'application/xml',
      },
    })
  }
}
