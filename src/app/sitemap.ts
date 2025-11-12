import { MetadataRoute } from 'next'
import { getAllProvinceSlugs } from '@/data/provinces'
import { getAllCategorySlugs } from '@/data/categories'
import { getAllMunicipalitySlugs } from '@/data/municipalities'
import { getAllDepartmentSlugs } from '@/data/departments'
import { prisma } from '@/lib/prisma'
import { getTenderSlug } from '@/lib/utils/tender-lookup'
import { fundingGuides } from '@/data/fundingGuides'

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
      url: `${baseUrl}/municipalities`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/departments`,
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
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
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
      url: `${baseUrl}/glossary`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
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
      url: `${baseUrl}/tenders`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.85,
    },
    {
      url: `${baseUrl}/opportunities`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.85,
    },
    {
      url: `${baseUrl}/public-sector-tenders`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/insights`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/resources`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/feedback`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy-policy`,
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
    {
      url: `${baseUrl}/terms-of-service`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
  ]

  // Funding pages - Phase 3: ProTender Fund Finder
  const fundingPages = [
    {
      url: `${baseUrl}/funding`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.95,
    },
    {
      url: `${baseUrl}/funding/search`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/funding/match`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    },
    {
      url: `${baseUrl}/funding/guides`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    },
  ]

  // Funding guides pages - SEO content
  const fundingGuidesPages: MetadataRoute.Sitemap = fundingGuides.map((guide) => ({
    url: `${baseUrl}/funding/guides/${guide.slug}`,
    lastModified: guide.updatedDate ? new Date(guide.updatedDate) : new Date(guide.publishedDate),
    changeFrequency: 'monthly' as const,
    priority: guide.featured ? 0.85 : 0.80,
  }))

  // Funding opportunity detail pages
  let fundingDetailPages: MetadataRoute.Sitemap = []
  try {
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

    fundingDetailPages = activeFunding.map((funding) => ({
      url: `${baseUrl}/funding/${funding.slug}`,
      lastModified: funding.updatedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    console.log(`✅ Generated ${fundingDetailPages.length} funding opportunity URLs for sitemap`)
  } catch (error) {
    console.error('Error generating funding sitemap entries:', error)
    // Continue without funding pages if there's an error
  }

  // Tender pages (limit to active tenders to keep sitemap manageable)
  // Using slug field for fast lookups and SEO-friendly URLs
  let tenderPages: MetadataRoute.Sitemap = []
  try {
    const activeTenders = await prisma.oCDSRelease.findMany({
      where: {
        status: 'active',
        closingAt: {
          gte: new Date(),
        },
      },
      select: {
        slug: true,
        ocid: true,
        updatedAt: true,
        closingAt: true,
        tenderTitle: true,
      },
      take: 10000, // Limit for sitemap size (max recommended is 50k URLs)
      orderBy: {
        closingAt: 'desc',
      },
    })

    // Filter out tenders without titles and create sitemap entries
    tenderPages = activeTenders
      .filter((tender) => tender.tenderTitle)
      .map((tender) => ({
        url: `${baseUrl}/tender/${tender.slug || tender.ocid}`,
        lastModified: tender.updatedAt || new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.6,
      }))

    console.log(`✅ Generated ${tenderPages.length} tender URLs for sitemap`)
  } catch (error) {
    console.error('Error generating tender sitemap entries:', error)
    // Continue without tender pages if there's an error
  }

  return [
    homepage,
    eTendersHub,
    ...provincialETenderPages,
    ...categoryETenderPages,
    ...fundingPages,
    ...fundingGuidesPages,
    ...fundingDetailPages,
    ...provincePages,
    ...categoryPages,
    ...municipalityPages,
    ...departmentPages,
    ...staticPages,
    ...tenderPages,
  ]
}
