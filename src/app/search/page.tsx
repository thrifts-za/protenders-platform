import { Metadata } from 'next';
import SearchClient from './SearchClient';

/**
 * Generate metadata for the search page
 * This is the primary entry point for users searching for tenders
 */
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Search Government Tenders & eTenders | Live Opportunities | ProTenders',
    description: 'Search 10,000+ government tenders and eTenders across South Africa. Filter by province, category, closing date. Free real-time tender alerts for businesses and SMMEs.',
    keywords: [
      'search etenders',
      'search government tenders',
      'find etenders south africa',
      'government tender search',
      'etender portal search',
      'south africa tenders search',
      'tender search engine',
      'find government tenders',
      'procurement opportunities search',
      'tender alerts',
      'government contracts search',
      'public sector tenders search',
      'RFQ search',
      'RFP search',
      'BEE tenders search',
    ],
    openGraph: {
      title: 'Search Government Tenders & eTenders Across South Africa',
      description: 'Search 10,000+ live government tenders and eTenders. Filter by province, category, value. Set up instant alerts.',
      url: 'https://protenders.co.za/search',
      type: 'website',
      images: [
        {
          url: '/images/og-image.png',
          width: 1200,
          height: 630,
          alt: 'Search Government Tenders on ProTenders',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Search Government Tenders & eTenders | ProTenders',
      description: 'Search 10,000+ live government tenders. Filter by province, category, value. Free alerts.',
      images: ['/images/og-image.png'],
    },
    alternates: {
      canonical: 'https://protenders.co.za/search',
    },
  };
}

/**
 * Server Component - Renders the search client component
 * This pattern allows us to have server-side metadata while keeping
 * the interactive search features in a client component
 */
export default function SearchPage() {
  return <SearchClient />;
}
