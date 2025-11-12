import { Metadata } from 'next';
import FundingLandingPage from './FundingLandingPage';

/**
 * Generate metadata for the funding landing page
 * Phase 3: ProTender Fund Finder - SEO-optimized landing page
 * Based on FLP.md specifications
 */
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Find Business Funding in South Africa | SME Grants, Loans & Equity | ProTender',
    description: 'Discover verified SME funding opportunities from IDC, SEFA, NEF, Land Bank, TIA, and more. Search by sector, amount, and location.',
    keywords: [
      'SME funding South Africa',
      'small business funding',
      'funding for small businesses South Africa',
      'business grants South Africa',
      'IDC funding',
      'SEFA loans',
      'NEF funding',
      'Land Bank agriculture funding',
      'TIA technology funding',
      'dtic grants',
      'government funding programs',
      'startup funding',
      'black business funding',
      'manufacturing funding',
      'agriculture funding',
      'technology funding',
      'funding opportunities',
      'equity funding',
      'business loans South Africa',
    ],
    openGraph: {
      title: 'Find Business Funding in South Africa | SME Grants, Loans & Equity',
      description: 'Discover verified SME funding opportunities from IDC, SEFA, NEF, Land Bank, TIA, and more. Search by sector, amount, and location.',
      url: 'https://protenders.co.za/funding',
      type: 'website',
      images: [
        {
          url: '/images/og-funding.png',
          width: 1200,
          height: 630,
          alt: 'Find SME Funding on ProTenders',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Find Business Funding in South Africa | ProTender',
      description: 'Discover verified SME funding opportunities from top South African institutions.',
      images: ['/images/og-funding.png'],
    },
    alternates: {
      canonical: 'https://protenders.co.za/funding',
    },
  };
}

/**
 * Server Component - Renders the funding landing page
 * Comprehensive landing page with hero, categories, institutions, FAQ, and more
 */
export default function FundingPage() {
  return <FundingLandingPage />;
}
