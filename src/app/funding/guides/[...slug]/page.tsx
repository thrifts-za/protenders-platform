/**
 * Individual Funding Guide Page
 * Phase 3: ProTender Fund Finder - Guide Detail View
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fundingGuides } from '@/data/fundingGuides';
import GuidePostClient from './GuidePostClient';

interface GuidePageProps {
  params: Promise<{
    slug: string[];
  }>;
}

// Generate static params for all guides
export async function generateStaticParams() {
  return fundingGuides.map((guide) => ({
    slug: [guide.slug],
  }));
}

// Generate metadata for each guide
export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = fundingGuides.find((g) => g.slug === slug?.[0]);

  if (!guide) {
    return {
      title: 'Guide Not Found | ProTender',
    };
  }

  const guideUrl = `https://protenders.co.za/funding/guides/${guide.slug}`;

  return {
    title: `${guide.title} | ProTender`,
    description: guide.excerpt,
    keywords: guide.seoKeywords,
    authors: [{ name: guide.author }],
    openGraph: {
      title: guide.title,
      description: guide.excerpt,
      url: guideUrl,
      type: 'article',
      publishedTime: guide.publishedDate,
      modifiedTime: guide.updatedDate || guide.publishedDate,
      authors: [guide.author],
      tags: guide.tags,
      images: [
        {
          url: `/images/og-guides-${guide.slug}.png`,
          width: 1200,
          height: 630,
          alt: guide.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: guide.title,
      description: guide.excerpt,
      images: [`/images/og-guides-${guide.slug}.png`],
    },
    alternates: {
      canonical: guideUrl,
    },
  };
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = fundingGuides.find((g) => g.slug === slug?.[0]);

  if (!guide) {
    notFound();
  }

  return <GuidePostClient guide={guide} />;
}
