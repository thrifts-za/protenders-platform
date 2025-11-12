import { Metadata } from 'next';
import FundingMatchClient from './FundingMatchClient';

/**
 * Generate metadata for funding match page
 */
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Find Your Perfect Funding Match | ProTender Fund Finder',
    description: 'Answer a few questions about your business and get personalized funding recommendations with match scores. Find grants, loans, and equity funding that fits your needs.',
    keywords: [
      'funding match',
      'business funding recommendations',
      'SME funding calculator',
      'personalized funding',
      'funding eligibility',
      'business finance match',
      'grant finder',
      'loan matcher',
    ],
    openGraph: {
      title: 'Find Your Perfect Funding Match | ProTender Fund Finder',
      description: 'Get personalized funding recommendations for your South African business. Match with grants, loans, and equity funding.',
      url: 'https://protenders.co.za/funding/match',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Find Your Perfect Funding Match',
      description: 'Get personalized funding recommendations based on your business profile.',
    },
    alternates: {
      canonical: 'https://protenders.co.za/funding/match',
    },
  };
}

/**
 * Funding Match Page - Server Component
 */
export default function FundingMatchPage() {
  return <FundingMatchClient />;
}
