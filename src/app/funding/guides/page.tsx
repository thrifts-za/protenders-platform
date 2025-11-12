/**
 * Funding Guides Landing Page
 * Phase 3: ProTender Fund Finder - SEO Content Hub
 */

import { Metadata } from 'next';
import GuidesListClient from './GuidesListClient';

export const metadata: Metadata = {
  title: 'SMME Funding Guides | Complete Resources for South African Entrepreneurs | ProTender',
  description: 'Comprehensive funding guides for South African SMMEs. Learn how to access R1K-R75M from NYDA, NEF, IDC, sefa, and more. Step-by-step application guides, eligibility checklists, and expert tips for youth, women, and black-owned businesses.',
  keywords: [
    'SMME funding guide',
    'South Africa business funding',
    'NYDA grant application',
    'NEF funding guide',
    'sefa loan application',
    'IDC funding requirements',
    'youth business funding',
    'women entrepreneur funding',
    'manufacturing funding guide',
    'agricultural financing',
    'township business funding',
    'rural entrepreneurship',
    'black business funding',
    'startup capital guide',
    'small business grants',
    'business loan application',
    'funding for entrepreneurs',
    'DFI funding guide',
    'how to get business funding',
    'business funding eligibility',
  ],
  openGraph: {
    title: 'SMME Funding Guides | R1K-R75M for South African Entrepreneurs',
    description: 'Access 7+ comprehensive guides covering all SMME funding opportunities in South Africa. Free downloads, checklists, and expert strategies.',
    url: 'https://protenders.co.za/funding/guides',
    type: 'website',
    images: [
      {
        url: '/images/og-funding-guides.png',
        width: 1200,
        height: 630,
        alt: 'ProTender Funding Guides - SMME Resources',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SMME Funding Guides | ProTender',
    description: 'Comprehensive funding guides for South African entrepreneurs. R1K-R75M across 11 DFIs.',
    images: ['/images/og-funding-guides.png'],
  },
  alternates: {
    canonical: 'https://protenders.co.za/funding/guides',
  },
};

export default function FundingGuidesPage() {
  return <GuidesListClient />;
}
