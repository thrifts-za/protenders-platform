import { MetadataRoute } from 'next'
import { getAllProvinceSlugs } from '@/data/provinces'
import { getAllCategorySlugs } from '@/data/categories'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://protenders.co.za'

  // Homepage
  const homepage = {
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1,
  }

  // Province pages
  const provinceSlugs = getAllProvinceSlugs()
  const provincePages = provinceSlugs.map((slug) => ({
    url: `${baseUrl}/province/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }))

  // Category pages
  const categorySlugs = getAllCategorySlugs()
  const categoryPages = categorySlugs.map((slug) => ({
    url: `${baseUrl}/category/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Static pages
  const staticPages = [
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'always' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/alerts`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
  ]

  return [homepage, ...provincePages, ...categoryPages, ...staticPages]
}
