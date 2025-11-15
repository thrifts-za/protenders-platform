import { blogPosts } from '@/data/blogPosts'

export async function GET() {
  const baseUrl = 'https://protenders.co.za'

  const blogPostUrls = blogPosts.map((post) => {
    const lastmod = post.updatedDate ? new Date(post.updatedDate).toISOString() : new Date(post.publishedDate).toISOString()
    const priority = post.featured ? '0.85' : '0.75'
    return `
    <url>
      <loc>${baseUrl}/blog/${post.slug}</loc>
      <lastmod>${lastmod}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>${priority}</priority>
    </url>`
  }).join('')

  const mainBlogPages = `
    <url>
      <loc>${baseUrl}/blog</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.7</priority>
    </url>
    <url>
      <loc>${baseUrl}/insights</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.7</priority>
    </url>`

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${mainBlogPages}
  ${blogPostUrls}
</urlset>`

  console.log(`✅ Generated ${blogPosts.length} blog post URLs for blog sitemap`)

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400', // Cache for 24 hours
    },
  })
}
