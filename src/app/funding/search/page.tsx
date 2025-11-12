import { Metadata } from 'next';
import FundingSearchClient from './FundingSearchClient';

/**
 * Generate metadata for the funding search page
 * Phase 3: ProTender Fund Finder - Search and filter interface
 */
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Search Funding Opportunities | ProTender Fund Finder',
    description: 'Search and filter 40+ SME funding programs across IDC, dtic, NEF, SEFA, Land Bank, TIA and more. Find grants, loans, and equity funding that matches your business.',
    keywords: [
      'SME funding search',
      'find business funding',
      'funding programs South Africa',
      'search grants',
      'search loans',
      'filter funding opportunities',
    ],
    openGraph: {
      title: 'Search Funding Opportunities | ProTender',
      description: 'Search and filter 40+ SME funding programs. Find the perfect match for your business.',
      url: 'https://protenders.co.za/funding/search',
      type: 'website',
    },
    alternates: {
      canonical: 'https://protenders.co.za/funding/search',
    },
  };
}

/**
 * Server Component - Renders the funding search client component
 */
export default function FundingSearchPage() {
  return <FundingSearchClient />;
}
