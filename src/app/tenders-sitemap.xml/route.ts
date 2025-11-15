import { prisma } from '@/lib/prisma'

export async function GET() {
  const baseUrl = 'https://protenders.co.za'

  try {
    const activeTenders = await prisma.oCDSRelease.findMany({
      where: {
        closingAt: {
          gte: new Date(),
        },
        tenderTitle: {
          not: null,
        },
      },
      select: {
        slug: true,
        ocid: true,
        updatedAt: true,
        closingAt: true,
        tenderTitle: true,
      },
      take: 45000, // Limit for sitemap size (max recommended is 50k URLs)
      orderBy: {
        closingAt: 'desc',
      },
    })

    const tenderUrls = activeTenders
      .filter((tender) => tender.tenderTitle)
      .map((tender) => {
        const lastmod = tender.updatedAt ? tender.updatedAt.toISOString() : new Date().toISOString()
        return `
    <url>
      <loc>${baseUrl}/tender/${tender.slug || tender.ocid}</loc>
      <lastmod>${lastmod}</lastmod>
      <changefreq>daily</changefreq>
      <priority>0.6</priority>
    </url>`
      })
      .join('')

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${tenderUrls}
</urlset>`

    console.log(`✅ Generated ${activeTenders.length} tender URLs for tenders sitemap`)

    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
      },
    })
  } catch (error) {
    console.error('Error generating tenders sitemap:', error)

    // Return empty sitemap on error
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
