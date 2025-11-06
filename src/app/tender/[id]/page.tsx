import { Metadata } from 'next';
import { generateTenderMetadata } from '@/lib/utils/tender-metadata';
import TenderClient from './TenderClient';

// ISR: Revalidate every hour for tender pages
export const revalidate = 3600;

// We're not using generateStaticParams for now since we have thousands of tenders
// They will be generated on-demand with ISR

/**
 * Generate metadata for tender detail pages
 * This provides SEO-optimized titles, descriptions, and keywords for each tender
 */
export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const metadata = await generateTenderMetadata(id);
    return metadata;
  } catch (error) {
    console.error('Error generating tender metadata:', error);
    return {
      title: 'Tender Details | ProTenders',
      description: 'View government tender opportunity details on ProTenders.',
    };
  }
}

/**
 * Server Component - Renders the client component
 * This pattern allows us to have server-side metadata while keeping
 * the interactive features in a client component
 */
export default function TenderPage() {
  return <TenderClient />;
}
