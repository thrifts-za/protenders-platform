import { Metadata } from 'next';
import BlogListClient from './BlogListClient';

/**
 * Generate metadata for the blog listing page
 */
export const metadata: Metadata = {
  title: 'Tender Intelligence Blog | eTenders Guides & Procurement Tips',
  description: 'Expert guidance on finding etenders, winning government contracts, and mastering procurement in South Africa. Learn how to submit eTenders, understand BEE requirements, and grow your business.',
  keywords: [
    'etenders guide',
    'etenders south africa guide',
    'how to submit etenders',
    'government tenders guide',
    'tender application tips',
    'procurement guide south africa',
    'winning government tenders',
    'etender portal guide',
    'government contracts south africa',
    'tender documents guide',
    'BEE tenders guide',
    'SMME tenders guide',
    'RFQ guide',
    'RFP guide',
    'tender compliance',
  ],
  openGraph: {
    title: 'Tender Intelligence Blog | eTenders & Procurement Guides',
    description: 'Expert guidance on finding etenders, winning government contracts, and mastering procurement in South Africa.',
    url: 'https://protenders.co.za/blog',
    type: 'website',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ProTenders Blog - eTenders & Procurement Guides',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tender Intelligence Blog | eTenders Guides',
    description: 'Expert guidance on finding etenders and winning government contracts in South Africa.',
    images: ['/images/og-image.png'],
  },
  alternates: {
    canonical: 'https://protenders.co.za/blog',
  },
};

/**
 * Server Component - Renders the blog listing client component
 */
export default function BlogPage() {
  return <BlogListClient />;
}
