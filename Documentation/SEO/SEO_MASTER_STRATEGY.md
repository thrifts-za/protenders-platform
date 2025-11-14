# ProTenders SEO Master Strategy
**Complete SEO Playbook for Next.js Platform**

**Last Updated:** November 3, 2024
**Version:** 3.0 (Next.js Migration Edition)
**Status:** 🟢 Active - Adapted for Next.js Full-Stack Platform

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Migration Impact on SEO](#migration-impact-on-seo)
3. [Keyword Research & Targeting](#keyword-research--targeting)
4. [Technical SEO for Next.js](#technical-seo-for-nextjs)
5. [Content Strategy](#content-strategy)
6. [On-Page Optimization](#on-page-optimization)
7. [Link Building Strategy](#link-building-strategy)
8. [90-Day Action Plan](#90-day-action-plan)
9. [Tracking & Monitoring](#tracking--monitoring)
10. [Success Metrics](#success-metrics)

---

## 📊 Executive Summary

### What This Document Covers

This is the **single source of truth** for all ProTenders SEO activities during and after the Vite→Next.js migration. It consolidates:

- ✅ Keyword research with real search volumes
- ✅ Technical SEO implementation for Next.js 15
- ✅ Content strategy and publishing schedule
- ✅ Link building tactics
- ✅ Migration-specific SEO considerations
- ✅ 90-day domination plan

### Current SEO Status

**Vite/Express Platform (Current):**
- ✅ 200+ keywords optimized
- ✅ BEE-focused content on all pages
- ✅ FAQ schema implemented
- ✅ Enhanced meta tags site-wide
- ✅ Blog posts created for high-volume keywords
- ⚠️ Platform migration in progress

**Next.js Platform (Target):**
- ✅ Better SSR for SEO (Server-Side Rendering)
- ✅ App Router with automatic metadata
- ✅ Enhanced performance (Core Web Vitals)
- ✅ Built-in sitemap generation
- ✅ Improved structured data support
- ⏳ Migration preserving all SEO gains

### Top Priority Keywords

Based on real search volume data:

| Rank | Keyword | Monthly Volume | KD | Current Status | Target Rank |
|------|---------|----------------|-----|----------------|-------------|
| 1 | South Africa tenders | 131,470 | 14.81% | ✅ Optimized | #1-3 |
| 2 | Public sector tenders SA | 102,340 | 22.11% | ✅ Page created | #1-5 |
| 3 | Government tenders SA | 60,390 | 25% | ✅ Optimized | #1-5 |
| 4 | Tender opportunities SA | 44,540 | 23.5% | ✅ Optimized | #3-8 |
| 5 | eTender submission SA | 29,040 | 27.14% | ✅ Guide created | #5-10 |
| 6 | Construction tenders SA | 12,680 | 11.85% | ✅ Category page | #5-10 |
| 7 | Tender documents SA | 8,080 | 15% | ✅ Guide created | #5-10 |

---

## 🔄 Migration Impact on SEO

### SEO Benefits of Next.js

#### 1. **Server-Side Rendering (SSR)**
```typescript
// Next.js automatically renders pages on server
// Better for SEO than client-side rendering (Vite)

// Before (Vite - Client-side)
// Google sees empty div until JS loads

// After (Next.js - Server-side)
export default async function Page() {
  const tenders = await getTenders(); // Rendered on server
  return <div>{tenders.map(...)}</div>; // Google sees full HTML
}
```

**Impact:** Faster indexing, better rankings

#### 2. **Automatic Metadata Generation**
```typescript
// Next.js App Router - Built-in metadata
export const metadata: Metadata = {
  title: 'South Africa Tenders | Find Government Tenders | ProTenders',
  description: 'Find 10,000+ government tenders across South Africa...',
  keywords: ['south africa tenders', 'government tenders', 'etenders'],
  openGraph: {
    title: 'ProTenders - South Africa Tender Portal',
    description: '...',
    images: ['/og-image.png'],
  },
};
```

**Impact:** Consistent, optimized meta tags across all pages

#### 3. **Image Optimization**
```typescript
import Image from 'next/image';

// Automatic optimization, lazy loading, WebP conversion
<Image
  src="/logo.png"
  alt="ProTenders Logo"
  width={200}
  height={50}
  priority // For above-fold images
/>
```

**Impact:** Better Core Web Vitals (LCP, CLS)

#### 4. **Built-in Sitemap & robots.txt**
```typescript
// app/sitemap.ts - Dynamic sitemap generation
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const tenders = await prisma.oCDSRelease.findMany();

  return [
    { url: 'https://protenders.co.za', lastModified: new Date() },
    ...tenders.map(t => ({
      url: `https://protenders.co.za/tender/${t.ocid}`,
      lastModified: t.updatedAt,
      changeFrequency: 'daily',
      priority: 0.8,
    })),
  ];
}
```

**Impact:** Automatic sitemap updates, better crawlability

#### 5. **Performance Optimizations**
- Code splitting (automatic)
- Route prefetching
- Edge caching with Vercel
- React Server Components (RSC)

**Impact:** Faster page loads = better SEO rankings

### Migration Checklist for SEO

**Critical Tasks (Must Do Before Launch):**

- [ ] **301 Redirects** - Map all old URLs to new URLs
```typescript
// next.config.js
async redirects() {
  return [
    {
      source: '/old-tender-path/:id',
      destination: '/tender/:id',
      permanent: true, // 301 redirect
    },
  ];
}
```

- [ ] **Preserve URL Structure** - Keep same slugs where possible
  - ✅ `/category/construction` (same in Next.js)
  - ✅ `/province/gauteng` (same in Next.js)
  - ✅ `/tender/:id` (same in Next.js)

- [ ] **Transfer Meta Tags** - Ensure all pages have metadata exports
- [ ] **Update Sitemap** - Generate new sitemap with all pages
- [ ] **Submit to Search Console** - Update sitemap URL
- [ ] **Monitor 404s** - Track and fix broken links
- [ ] **Structured Data** - Re-implement all schema markup
- [ ] **Canonical URLs** - Set correct canonical tags
- [ ] **Update robots.txt** - Point to new sitemap location

**Monitoring (Post-Launch):**

- [ ] Track rankings daily for 2 weeks (expect temporary fluctuations)
- [ ] Monitor Google Search Console for crawl errors
- [ ] Check Core Web Vitals in Search Console
- [ ] Verify all pages indexed
- [ ] Monitor organic traffic (expect dip for 1-2 weeks, then recovery)

---

## 🎯 Keyword Research & Targeting

### Tier 1: Ultra-High Volume (>50K/month)

| Keyword | Volume | KD | Target Page | Status | Priority |
|---------|--------|-----|-------------|--------|----------|
| **South Africa tenders** | **131,470** | **14.81%** | Home (/) | ✅ | ⭐⭐⭐⭐⭐ |
| **Public sector tenders SA** | **102,340** | **22.11%** | /public-sector-tenders | ✅ | ⭐⭐⭐⭐⭐ |
| **Government tenders SA** | **60,390** | **25%** | Home (/) | ✅ | ⭐⭐⭐⭐⭐ |

**Next.js Implementation:**
```typescript
// app/page.tsx - Homepage
export const metadata: Metadata = {
  title: 'South Africa Tenders | Find Government Tenders 2024 | ProTenders',
  description: 'Find 10,000+ government tenders and public sector opportunities across South Africa. Search construction, IT, consulting tenders. Free tender alerts.',
  keywords: [
    'south africa tenders',
    'government tenders south africa',
    'public sector tenders south africa',
    'etenders south africa',
  ],
};
```

### Tier 2: High Volume (20K-50K/month)

| Keyword | Volume | KD | Target Page | Status |
|---------|--------|-----|-------------|--------|
| Tender opportunities SA | 44,540 | 23.5% | /opportunities | ✅ |
| eTender submission SA | 29,040 | 27.14% | /blog/etender-submission-guide | ✅ |

### Tier 3: Medium Volume (10K-20K/month)

| Keyword | Volume | KD | Target Page | Status |
|---------|--------|-----|-------------|--------|
| Construction tenders SA | 12,680 | 11.85% | /category/construction | ✅ |

### Tier 4: Targeted Volume (5K-10K/month)

| Keyword | Volume | KD | Target Page | Status |
|---------|--------|-----|-------------|--------|
| Tender documents SA | 8,080 | 15% | /blog/tender-documents-checklist | ✅ |

### Complete Keyword Map (200+ Keywords)

#### **Primary Keywords (Homepage)**
- South Africa tenders (131K)
- Government tenders South Africa (60K)
- Public sector tenders South Africa (102K)
- Tender opportunities South Africa (45K)
- eTender submission South Africa (29K)
- etenders south africa
- tender portal south africa (4.4K)
- online tender portal south africa

#### **BEE & Empowerment Keywords**
- bee tenders south africa
- bbbee tenders
- smme tenders south africa
- black-owned business tenders
- women-owned business tenders
- level 1 bee tenders
- empowerment tenders

#### **Category Keywords**

**Construction:**
- construction tenders south africa (12.6K)
- cidb tenders south africa
- road construction tenders
- building tenders south africa
- civil engineering tenders

**IT & Technology:**
- it tenders south africa (950)
- ict tenders south africa
- software tenders government
- cybersecurity tenders

**Professional Services:**
- consulting tenders south africa
- audit tenders
- legal services tenders
- training tenders government

#### **Provincial Keywords** (9 provinces × ~5 variations each)

**Pattern:** "[Province] tenders", "government tenders [province]", "tenders [city]"

- Gauteng: tenders gauteng, johannesburg tenders, pretoria tenders
- Western Cape: tenders western cape, cape town tenders
- KwaZulu-Natal: tenders kzn, durban tenders, ethekwini tenders
- Eastern Cape: tenders eastern cape, port elizabeth tenders
- Free State: tenders free state, bloemfontein tenders
- Limpopo: tenders limpopo, polokwane tenders
- Mpumalanga: tenders mpumalanga, nelspruit tenders
- Northern Cape: tenders northern cape, kimberley tenders
- North West: tenders north west, rustenburg tenders

#### **Time-Based Keywords**

**Closing Soon:**
- tenders closing soon
- urgent tenders
- tender deadlines
- closing tenders south africa

**Latest:**
- latest tenders
- latest government tenders south africa
- new tenders today
- fresh tenders south africa

#### **Informational/Blog Keywords**

**How-To:**
- how to submit etenders (part of 29K keyword)
- how to find government tenders
- how to win government tenders
- how to write tender proposal

**Documents & Compliance:**
- tender documents south africa (8K)
- cidb registration guide
- bee certificate
- tax clearance certificate tenders
- csd registration

---

## 🛠️ Technical SEO for Next.js

### 1. Metadata Configuration

**File:** `src/app/layout.tsx` (Root Layout)

```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://protenders.co.za'),
  title: {
    default: 'ProTenders - South Africa Tender Portal',
    template: '%s | ProTenders',
  },
  description: 'Find government tenders and procurement opportunities across South Africa...',
  keywords: [
    'south africa tenders',
    'government tenders',
    'etenders',
    'public sector tenders',
    'tender opportunities',
  ],
  authors: [{ name: 'ProTenders' }],
  creator: 'ProTenders',
  publisher: 'ProTenders',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_ZA',
    url: 'https://protenders.co.za',
    siteName: 'ProTenders',
    title: 'ProTenders - South Africa Tender Portal',
    description: 'Find government tenders and procurement opportunities...',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ProTenders Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ProTenders - South Africa Tender Portal',
    description: 'Find government tenders...',
    images: ['/og-image.png'],
  },
  verification: {
    google: 'your-google-verification-code',
  },
  alternates: {
    canonical: 'https://protenders.co.za',
  },
};
```

### 2. Dynamic Page Metadata

**Tender Detail Pages:**

```typescript
// app/tender/[id]/page.tsx
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';

export async function generateMetadata({
  params
}: {
  params: { id: string }
}): Promise<Metadata> {
  const tender = await prisma.oCDSRelease.findUnique({
    where: { ocid: params.id },
  });

  if (!tender) {
    return { title: 'Tender Not Found' };
  }

  const closingDate = tender.closingAt
    ? new Date(tender.closingAt).toLocaleDateString('en-ZA')
    : 'TBC';

  return {
    title: `${tender.title} | ${tender.buyerName} | Closes ${closingDate}`,
    description: `${tender.description?.slice(0, 155)} - Find tender details, requirements, and submission info.`,
    keywords: [
      tender.category || '',
      tender.province || '',
      tender.buyerName || '',
      'government tender',
      'tender opportunity',
    ].filter(Boolean),
    openGraph: {
      title: tender.title,
      description: tender.description || '',
      type: 'article',
      publishedTime: tender.publishedAt?.toISOString(),
      modifiedTime: tender.updatedAt?.toISOString(),
    },
    alternates: {
      canonical: `https://protenders.co.za/tender/${params.id}`,
    },
  };
}
```

### 3. Structured Data (JSON-LD)

**Organization Schema (Root Layout):**

```typescript
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ProTenders',
    url: 'https://protenders.co.za',
    logo: 'https://protenders.co.za/logo.png',
    description: 'South Africa\'s leading tender portal for government procurement opportunities',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'ZA',
    },
    sameAs: [
      'https://twitter.com/protenders',
      'https://linkedin.com/company/protenders',
    ],
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

**Tender Schema (Tender Detail Page):**

```typescript
// app/tender/[id]/page.tsx
export default async function TenderPage({ params }: { params: { id: string } }) {
  const tender = await prisma.oCDSRelease.findUnique({
    where: { ocid: params.id },
  });

  const tenderSchema = {
    '@context': 'https://schema.org',
    '@type': 'ServiceOffer',
    name: tender.title,
    description: tender.description,
    provider: {
      '@type': 'Organization',
      name: tender.buyerName,
    },
    areaServed: {
      '@type': 'Country',
      name: 'South Africa',
    },
    validThrough: tender.closingAt?.toISOString(),
    url: `https://protenders.co.za/tender/${params.id}`,
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is the closing date for this tender?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `This tender closes on ${tender.closingAt?.toLocaleDateString('en-ZA')}`,
        },
      },
      {
        '@type': 'Question',
        name: 'Who is the buyer?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `The procuring entity is ${tender.buyerName}`,
        },
      },
      // Add more FAQs
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(tenderSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {/* Page content */}
    </>
  );
}
```

**BreadcrumbList Schema:**

```typescript
// components/Breadcrumbs.tsx
export function Breadcrumbs({ items }: { items: { name: string; url: string }[] }) {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `https://protenders.co.za${item.url}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <nav aria-label="Breadcrumb">
        {items.map((item, index) => (
          <Link key={index} href={item.url}>
            {item.name}
          </Link>
        ))}
      </nav>
    </>
  );
}
```

### 4. Sitemap Generation

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://protenders.co.za';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/closing-soon`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/latest`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/public-sector-tenders`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  // Category pages
  const categories = ['construction', 'it-services', 'consulting', 'security-services'];
  const categoryPages: MetadataRoute.Sitemap = categories.map(cat => ({
    url: `${baseUrl}/category/${cat}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Province pages
  const provinces = ['gauteng', 'western-cape', 'kwazulu-natal', 'eastern-cape',
                     'free-state', 'limpopo', 'mpumalanga', 'northern-cape', 'north-west'];
  const provincePages: MetadataRoute.Sitemap = provinces.map(prov => ({
    url: `${baseUrl}/province/${prov}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // Dynamic tender pages (limit to active tenders)
  const tenders = await prisma.oCDSRelease.findMany({
    where: {
      status: 'active',
      closingAt: {
        gte: new Date(),
      },
    },
    select: {
      ocid: true,
      updatedAt: true,
    },
    take: 10000, // Limit for sitemap size
    orderBy: {
      closingAt: 'desc',
    },
  });

  const tenderPages: MetadataRoute.Sitemap = tenders.map(tender => ({
    url: `${baseUrl}/tender/${tender.ocid}`,
    lastModified: tender.updatedAt || new Date(),
    changeFrequency: 'daily',
    priority: 0.6,
  }));

  // Blog posts
  const blogPosts = await prisma.blogPost.findMany({
    select: {
      slug: true,
      updatedAt: true,
    },
  });

  const blogPages: MetadataRoute.Sitemap = blogPosts.map(post => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt || new Date(),
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  return [
    ...staticPages,
    ...categoryPages,
    ...provincePages,
    ...tenderPages,
    ...blogPages,
  ];
}
```

### 5. robots.txt

```typescript
// app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/dashboard', '/my', '/workspace', '/api'],
    },
    sitemap: 'https://protenders.co.za/sitemap.xml',
  };
}
```

### 6. Core Web Vitals Optimization

**Image Optimization:**

```typescript
import Image from 'next/image';

// Use Next.js Image component for automatic optimization
<Image
  src="/tender-image.jpg"
  alt="Construction Tender in Gauteng"
  width={600}
  height={400}
  priority={false} // true for above-fold images only
  loading="lazy" // Automatic for most images
/>
```

**Font Optimization:**

```typescript
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Prevent layout shift
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
```

**Route Prefetching:**

```typescript
import Link from 'next/link';

// Next.js automatically prefetches links in viewport
<Link href="/tender/abc123" prefetch={true}>
  View Tender
</Link>
```

---

## 📝 Content Strategy

### Phase 1: Foundation Pages (Already Created ✅)

| Page Type | URL Pattern | Count | Status |
|-----------|-------------|-------|--------|
| Homepage | / | 1 | ✅ |
| Category Pages | /category/[slug] | 8 | ✅ |
| Province Pages | /province/[slug] | 9 | ✅ |
| Feature Pages | /closing-soon, /latest, /public-sector-tenders | 3 | ✅ |
| Blog Posts | /blog/[slug] | 4 | ✅ |

### Phase 2: Expansion (Next 90 Days)

#### High-Priority Pages to Create

**1. Municipality Pages (Top 6 Metros)**

```typescript
// app/municipality/[slug]/page.tsx
export const metadata: Metadata = {
  title: 'City of Johannesburg Tenders | CoJ Municipal Tenders 2024',
  description: 'Find City of Johannesburg municipal tenders...',
};

// Content sections:
// - Municipal structure
// - How to register as supplier
// - Tender types
// - BEE requirements
// - Contact information
// - Recent CoJ tenders (dynamic)
```

**Create for:**
- City of Johannesburg
- City of Cape Town
- eThekwini Municipality (Durban)
- City of Tshwane (Pretoria)
- Ekurhuleni Municipality
- Nelson Mandela Bay

**2. Department Pages (Top 5)**

```typescript
// app/department/[slug]/page.tsx
// Target: "department of health tenders", etc.
```

**Create for:**
- Department of Health
- Department of Education
- Department of Public Works
- Department of Transport
- Department of Defence

**3. Blog Content (2 posts per week)**

**Month 1-2 Topics:**
1. "How to Register on CSD: Complete Step-by-Step Guide 2024"
2. "Understanding B-BBEE Points in Government Tenders"
3. "City of Cape Town Tenders: Complete Guide"
4. "Department of Health Tenders: Healthcare Procurement Opportunities"
5. "How to Win Your First Government Tender: Beginner's Guide"
6. "CIDB Grading Explained: Which Level Do You Need?"
7. "Tender Evaluation Criteria: How Bids Are Scored"
8. "Common Tender Mistakes That Cost You Contracts"

**Month 3 Topics:**
9. "Government Procurement Process in SA: End-to-End Guide"
10. "How to Write a Winning Tender Proposal"
11. "SBD Forms Explained: Complete Guide to Standard Bidding Documents"
12. "Tender Success Stories: How 5 SA Businesses Won Big Contracts"

### Content Writing Guidelines

**Every Page Must Have:**
- [ ] Primary keyword in H1 (first 60 characters)
- [ ] Primary keyword in first 100 words
- [ ] 2-3 H2 headings with related keywords
- [ ] Meta description (155-160 chars) with keyword + CTA
- [ ] Alt text on all images
- [ ] Internal links to 3-5 related pages
- [ ] Structured data (JSON-LD schema)
- [ ] Minimum 600 words (landing pages), 1,500 words (blog posts)
- [ ] Mobile-responsive
- [ ] Clear CTAs (set up alerts, search tenders, register)

**South African Terminology:**
✅ Use: tender, etenders, municipality, province, Rand (R)
❌ Avoid: bid (except RFB), state, council, ZAR

**Authority References:**
- National Treasury
- Central Supplier Database (CSD)
- CIDB, PPPFA, MFMA, B-BBEE
- SARS, CIPC

---

## 🔗 Link Building Strategy

### Target Backlink Profile (90 Days)

| Source Type | Target | Priority | Methods |
|-------------|--------|----------|---------|
| Government (.gov.za) | 10-15 | ⭐⭐⭐⭐⭐ | Resource submission, outreach |
| Business Associations | 15-20 | ⭐⭐⭐⭐⭐ | Partnerships, member listings |
| Media & Publications | 10-15 | ⭐⭐⭐⭐ | Guest posts, PR |
| Industry Directories | 20-25 | ⭐⭐⭐ | Listings, submissions |
| Business Blogs | 15-20 | ⭐⭐⭐⭐ | Guest posting |
| Educational (.ac.za) | 5-10 | ⭐⭐⭐⭐ | Research citations |
| **TOTAL** | **75-105** | | |

### Link Building Tactics

**1. Government Outreach Template:**

```
Subject: Free Tender Resource for [Department] Website

Hi [Contact Name],

I'm reaching out from ProTenders, a platform helping South African businesses find government tender opportunities.

We've created a comprehensive, free resource for SMEs navigating government procurement: [link to guide]

Would you consider adding our platform to your supplier resources page? Benefits:
- Free access to 10,000+ tenders
- Real-time alerts
- Educational guides

We're committed to making procurement more accessible for SA businesses.

Best regards,
[Name]
ProTenders
```

**2. Business Association Outreach:**

Target:
- SACCI (SA Chamber of Commerce)
- Local chambers (JHB, CPT, DBN)
- Industry associations (SAFCEC, CESA, IITPSA)

Offer:
- Free membership for testing
- Co-branded tender guides
- Webinars for members

**3. Content Partnerships:**

- Moneyweb: "5 Ways SMEs Can Win Government Tenders"
- Fin24: "Understanding SA's Tender Process"
- BizCommunity: "Digital Tools for Tender Discovery"
- Engineering News: "Construction Tender Opportunities 2024"
- ITWeb: "Technology Procurement Trends"

**4. Digital PR:**

- Press release: "New Platform Helps SMEs Access R2.3 Trillion in Tenders"
- Data story: "Where Government Money Goes: Tender Statistics"
- Infographic: "Tender Process Explained Visually"

---

## 📅 90-Day Action Plan

### Month 1: Technical Foundation & Quick Wins

**Week 1: Migration SEO Setup**
- [ ] Set up 301 redirects for all pages
- [ ] Verify URL structure matches old site
- [ ] Update sitemap and submit to Search Console
- [ ] Implement metadata on all pages
- [ ] Add structured data (Organization, Breadcrumbs)
- [ ] Update robots.txt
- [ ] Monitor Search Console for errors

**Week 2: Content Optimization**
- [ ] Verify all metadata exports working
- [ ] Add FAQ schema to tender details
- [ ] Optimize homepage for "South Africa tenders"
- [ ] Add breadcrumbs to all pages
- [ ] Implement image optimization with Next/Image

**Week 3: Link Building Start**
- [ ] Submit to 10 SA directories
- [ ] Outreach to 5 government sites
- [ ] Contact 5 business associations
- [ ] Publish 1 blog post

**Week 4: Monitoring & Adjustment**
- [ ] Track rankings (expect fluctuations post-migration)
- [ ] Fix any crawl errors
- [ ] Publish 1 blog post
- [ ] Start guest post outreach

**Month 1 Target:**
- 50+ keywords ranking in top 100
- 20+ backlinks acquired
- 1,000-2,000 organic visits
- Zero SEO regressions from migration

### Month 2: Content Expansion

**Week 5-6: Municipality Pages**
- [ ] Create Johannesburg page
- [ ] Create Cape Town page
- [ ] Create eThekwini page
- [ ] Internal linking setup

**Week 7: Blog Content**
- [ ] Publish 2 blog posts (1,500+ words each)
- [ ] Guest post on 2 major SA sites

**Week 8: Link Building Push**
- [ ] Secure 30 more backlinks
- [ ] Press release distribution
- [ ] Infographic creation and promotion

**Month 2 Target:**
- 150+ keywords in top 100
- 50+ keywords in top 50
- 50+ total backlinks
- 3,000-5,000 organic visits

### Month 3: Scaling & Authority

**Week 9-10: Department Pages**
- [ ] Create 5 department pages
- [ ] Buyer profile pages

**Week 11: Ultimate Guides**
- [ ] "Complete Guide to Government Procurement SA" (5,000+ words)
- [ ] "Construction Tender Handbook" (4,000+ words)

**Week 12: Optimization**
- [ ] Analyze top-performing pages
- [ ] Optimize underperforming pages
- [ ] Secure final 20 backlinks

**Month 3 Target:**
- 300+ keywords in top 100
- 100+ keywords in top 50
- 30+ keywords in top 20
- 100+ total backlinks
- 6,000-10,000 organic visits

---

## 📊 Tracking & Monitoring

### Essential Tools

**Free (Must Have):**
- Google Search Console
- Google Analytics 4
- Google PageSpeed Insights
- Bing Webmaster Tools

**Paid (Recommended):**
- Ahrefs or SEMrush ($99-399/month) - Keyword tracking, backlinks

### KPIs to Track

**Traffic Metrics:**
- Organic traffic (Goal: 10K/month by Month 3)
- Traffic by page
- Traffic by keyword
- Geographic distribution

**Keyword Rankings:**
Track weekly:
1. South Africa tenders (131K vol)
2. Public sector tenders SA (102K vol)
3. Government tenders SA (60K vol)
4. Tender opportunities SA (45K vol)
5. eTender submission SA (29K vol)

**Technical SEO:**
- Page speed (<3s load time)
- Core Web Vitals (all green)
- Crawl errors (0)
- Indexation rate (100%)

**Engagement:**
- Bounce rate (<60%)
- Time on page (>2 minutes)
- Pages per session (>3)
- Conversion to alerts/signups

### Reporting Schedule

**Weekly:**
- Keyword ranking changes (top 10)
- Traffic overview
- New errors/issues

**Monthly:**
- Comprehensive keyword report
- Traffic by source
- Content performance
- Technical SEO health

---

## 🎯 Success Metrics

### Month 1 Targets
- ✅ Zero SEO regression from migration
- ✅ 50+ keywords ranking
- ✅ 20+ backlinks
- ✅ 1,000-2,000 visits

### Month 2 Targets
- ✅ 150+ keywords ranking
- ✅ 50+ keywords in top 50
- ✅ 50+ backlinks (cumulative)
- ✅ 3,000-5,000 visits

### Month 3 Targets
- ✅ 300+ keywords ranking
- ✅ 30+ keywords in top 20
- ✅ 100+ backlinks (cumulative)
- ✅ 6,000-10,000 visits

### Month 6 Targets (Long-term)
- ✅ Top 5 for "South Africa tenders"
- ✅ Top 10 for "government tenders SA"
- ✅ 500+ keywords ranking
- ✅ 200+ backlinks
- ✅ 20,000+ visits/month

---

## 🚨 Migration-Specific Alerts

### Post-Launch Monitoring (First 2 Weeks)

**Daily Checks:**
- [ ] Search Console for crawl errors
- [ ] 404 errors in analytics
- [ ] Ranking fluctuations (normal for 1-2 weeks)
- [ ] Indexation status

**Expected Behavior:**
- ⚠️ Rankings may drop 10-30% temporarily (normal)
- ⚠️ Traffic may dip for 1-2 weeks (recovers quickly)
- ✅ Should recover to baseline within 2-4 weeks
- ✅ Often improves beyond baseline due to better performance

**Red Flags (Act Immediately):**
- 🔴 Pages de-indexed
- 🔴 Major 404 errors
- 🔴 Sitemap not updating
- 🔴 Rankings drop >50%

---

## 📚 Resources

### Next.js SEO Documentation
- [Next.js Metadata Docs](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Sitemap Generation](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)
- [robots.txt](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots)

### SEO Tools
- [Google Search Console](https://search.google.com/search-console)
- [Google Analytics 4](https://analytics.google.com)
- [PageSpeed Insights](https://pagespeed.web.dev)
- [Ahrefs](https://ahrefs.com)

### Schema Markup
- [Schema.org](https://schema.org)
- [Google Rich Results Test](https://search.google.com/test/rich-results)

---

## 📋 Conclusion

This SEO strategy positions ProTenders for dominance in the SA tender market through:

1. ✅ **Migration-First Approach**: Preserve and enhance SEO during Vite→Next.js transition
2. ✅ **Data-Driven**: Real search volumes guide priorities
3. ✅ **Technical Excellence**: Next.js SSR, metadata, Core Web Vitals
4. ✅ **BEE-First Content**: Unique market positioning
5. ✅ **Comprehensive Coverage**: All provinces, categories, municipalities
6. ✅ **Continuous Growth**: 90-day plan, then ongoing

**Top 3 Immediate Actions:**
1. ⏳ Complete Next.js migration with SEO preservation
2. ⏳ Fix any TypeScript errors blocking build
3. ⏳ Submit new sitemap to Search Console

**Success Formula:**
```
Next.js Performance + Quality Content + Strategic Links + Consistent Publishing = Market Leadership
```

---

**Document Owner:** SEO Team
**Last Updated:** November 3, 2024
**Next Review:** December 2024
**Platform:** Next.js 15 Full-Stack
**Status:** 🟢 Active - Migration Edition

---

*This is a living document. Update as migration progresses and new data emerges.*
