import { Metadata } from 'next';
import FundingSearchClient from './FundingSearchClient';

/**
 * Generate metadata for the funding search page
 * Phase 3: ProTender Fund Finder - SEO-optimized programmatic index
 */
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Find SME Funding in South Africa | ProTender Fund Finder',
    description: 'Search 40+ SME funding programs across IDC, dtic, NEF, SEFA, Land Bank, TIA and more. Grants, loans, equity funding for South African businesses.',
    keywords: [
      'SME funding South Africa',
      'small business funding',
      'IDC funding',
      'dtic grants',
      'NEF funding',
      'SEFA loans',
      'Land Bank agriculture funding',
      'TIA technology funding',
      'government funding programs',
      'business grants South Africa',
      'startup funding',
      'black business funding',
      'manufacturing funding',
      'agriculture funding',
      'technology funding',
      'funding opportunities',
    ],
    openGraph: {
      title: 'Find SME Funding in South Africa | ProTender Fund Finder',
      description: 'Search 40+ SME funding programs across IDC, dtic, NEF, SEFA, Land Bank, TIA and more. Match your business to the right funding.',
      url: 'https://protenders.co.za/funding',
      type: 'website',
      images: [
        {
          url: '/images/og-funding.png',
          width: 1200,
          height: 630,
          alt: 'Search SME Funding on ProTenders',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Find SME Funding in South Africa | ProTender Fund Finder',
      description: 'Search 40+ SME funding programs. Grants, loans, equity. Match your business profile.',
      images: ['/images/og-funding.png'],
    },
    alternates: {
      canonical: 'https://protenders.co.za/funding',
    },
  };
}

/**
 * Server Component - Renders the funding search client component
 * This pattern allows us to have server-side metadata while keeping
 * the interactive search features in a client component
 */
export default function FundingPage() {
  return <FundingSearchClient />;
}
