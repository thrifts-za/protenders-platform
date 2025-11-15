export async function GET() {
  const baseUrl = 'https://protenders.co.za'

  // List all your sitemaps
  const sitemaps = [
    {
      loc: `${baseUrl}/sitemap.xml`,
      lastmod: new Date().toISOString(),
    },
    {
      loc: `${baseUrl}/tenders-sitemap.xml`,
      lastmod: new Date().toISOString(),
    },
    {
      loc: `${baseUrl}/blog-sitemap.xml`,
      lastmod: new Date().toISOString(),
    },
    {
      loc: `${baseUrl}/funding-sitemap.xml`,
      lastmod: new Date().toISOString(),
    },
    {
      loc: `${baseUrl}/news-sitemap.xml`,
      lastmod: new Date().toISOString(),
    },
  ]

  // Build sitemap index XML
  const sitemapIndexXML = buildSitemapIndexXML(sitemaps)

  return new Response(sitemapIndexXML, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
    },
  })
}

function buildSitemapIndexXML(sitemaps: Array<{ loc: string; lastmod: string }>) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

  for (const sitemap of sitemaps) {
    xml += '  <sitemap>\n'
    xml += `    <loc>${escapeXml(sitemap.loc)}</loc>\n`
    xml += `    <lastmod>${sitemap.lastmod}</lastmod>\n`
    xml += '  </sitemap>\n'
  }

  xml += '</sitemapindex>'
  return xml
}

// Helper function to escape XML special characters
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
