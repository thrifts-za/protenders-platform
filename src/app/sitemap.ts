import { MetadataRoute } from 'next'
import { getAllProvinceSlugs } from '@/data/provinces'
import { getAllCategorySlugs } from '@/data/categories'
import { getAllMunicipalitySlugs } from '@/data/municipalities'
import { getAllDepartmentSlugs } from '@/data/departments'
import { prisma } from '@/lib/prisma'
import { getTenderSlug } from '@/lib/utils/tender-lookup'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  // Municipality pages
  const municipalitySlugs = getAllMunicipalitySlugs()
  const municipalityPages = municipalitySlugs.map((slug) => ({
    url: `${baseUrl}/municipality/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Department pages
  const departmentSlugs = getAllDepartmentSlugs()
  const departmentPages = departmentSlugs.map((slug) => ({
    url: `${baseUrl}/department/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // eTenders Hub and Provincial eTender pages
  const eTendersHub = {
    url: `${baseUrl}/etenders`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.95,
  }

  const provincialETenderPages = provinceSlugs.map((slug) => ({
    url: `${baseUrl}/etenders/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }))

  // Category eTender pages (only active categories)
  const activeCategoryETenderSlugs = [
    'security-services',
    'cleaning-services',
    'construction',
    'it-services',
    'consulting',
    'supply-and-delivery',
  ]
  const categoryETenderPages = activeCategoryETenderSlugs.map((slug) => ({
    url: `${baseUrl}/etenders/category/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.85,
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
      url: `${baseUrl}/provinces`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
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
    {
      url: `${baseUrl}/how-it-works`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/closing-soon`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/latest`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/public-sector-tenders`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
  ]

  // Tender pages (limit to active tenders to keep sitemap manageable)
  let tenderPages: MetadataRoute.Sitemap = []
  try {
    const activeTenders = await prisma.oCDSRelease.findMany({
      where: {
        status: 'active',
        closingAt: {
          gte: new Date(),
        },
        tenderTitle: {
          not: null,
        },
      },
      select: {
        ocid: true,
        updatedAt: true,
        closingAt: true,
      },
      take: 10000, // Limit for sitemap size (max recommended is 50k URLs)
      orderBy: {
        closingAt: 'desc',
      },
    })

    tenderPages = await Promise.all(
      activeTenders.map(async (tender) => {
        const slug = await getTenderSlug(tender.ocid)
        return {
          url: `${baseUrl}/tender/${slug}`,
          lastModified: tender.updatedAt || new Date(),
          changeFrequency: 'daily' as const,
          priority: 0.6,
        }
      })
    )
  } catch (error) {
    console.error('Error generating tender sitemap entries:', error)
    // Continue without tender pages if there's an error
  }

  return [
    homepage,
    eTendersHub,
    ...provincialETenderPages,
    ...categoryETenderPages,
    ...provincePages,
    ...categoryPages,
    ...municipalityPages,
    ...departmentPages,
    ...staticPages,
    ...tenderPages,
  ]
}
