/**
 * Utility functions for generating SEO metadata for tender pages
 */

import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { findTenderBySlugOrId, getTenderSlug } from './tender-lookup';

/**
 * Generate metadata for a tender detail page
 */
export async function generateTenderMetadata(slugOrId: string): Promise<Metadata> {
  const release = await findTenderBySlugOrId(slugOrId);

  if (!release) {
    return {
      title: 'Tender Not Found | ProTenders',
      description: 'The requested tender could not be found.',
    };
  }

  const title = release.tenderDisplayTitle || release.tenderTitle || 'Untitled Tender';
  const description = release.tenderDescription 
    ? release.tenderDescription.slice(0, 155).trim() + '...'
    : `Find details about ${title}. ${release.buyerName || 'Government'} tender opportunity.`;
  
  const closingDate = release.closingAt
    ? new Date(release.closingAt).toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'TBC';

  const slug = await getTenderSlug(release.ocid);
  const url = `https://protenders.co.za/tender/${slug}`;

  // Build keywords from tender data
  const keywords: string[] = [
    'etenders',
    'government tender',
    'tender opportunity',
    'South Africa tender',
    'government etenders',
    'etender portal',
  ];

  if (release.mainCategory) {
    keywords.push(`${release.mainCategory} tenders`);
    keywords.push(`${release.mainCategory} etenders`);
  }

  if (release.province) {
    keywords.push(`${release.province} tenders`);
    keywords.push(`${release.province} etenders`);
    keywords.push(`etenders ${release.province.toLowerCase()}`);
  }

  if (release.buyerName) {
    keywords.push(`${release.buyerName} tenders`);
  }

  return {
    title: `${title} | ${release.buyerName || 'Government'} | Closes ${closingDate}`,
    description: description,
    keywords,
    openGraph: {
      title: title,
      description: description,
      type: 'article',
      url,
      siteName: 'ProTenders',
      publishedTime: release.publishedAt?.toISOString(),
      modifiedTime: release.updatedAt?.toISOString(),
      images: [
        {
          url: '/images/og-image.png',
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: ['/images/og-image.png'],
    },
    alternates: {
      canonical: url,
    },
  };
}

/**
 * Generate FAQ schema for a tender
 */
export function generateTenderFAQSchema(release: any) {
  const title = release.tenderDisplayTitle || release.tenderTitle || 'Untitled Tender';
  const buyerName = release.buyerName || 'Government Entity';
  const closingDate = release.closingAt
    ? new Date(release.closingAt).toLocaleDateString('en-ZA')
    : 'TBC';

  const faqs = [
    {
      '@type': 'Question',
      name: 'What is the closing date for this tender?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `This tender closes on ${closingDate}.`,
      },
    },
    {
      '@type': 'Question',
      name: 'Who is the buyer?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `The procuring entity is ${buyerName}.`,
      },
    },
  ];

  if (release.mainCategory) {
    faqs.push({
      '@type': 'Question',
      name: 'What category is this tender?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `This tender is in the ${release.mainCategory} category.`,
      },
    });
  }

  if (release.province) {
    faqs.push({
      '@type': 'Question',
      name: 'Which province is this tender for?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `This tender is for ${release.province} province.`,
      },
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs,
  };
}

/**
 * Generate Service schema for a tender
 */
export function generateTenderServiceSchema(release: any, slug: string) {
  const title = release.tenderDisplayTitle || release.tenderTitle || 'Untitled Tender';
  const description = release.tenderDescription || title;
  const buyerName = release.buyerName || 'Government Entity';

  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: title,
    description: description,
    provider: {
      '@type': 'Organization',
      name: buyerName,
    },
    areaServed: {
      '@type': 'Country',
      name: 'South Africa',
    },
    url: `https://protenders.co.za/tender/${slug}`,
  };
}