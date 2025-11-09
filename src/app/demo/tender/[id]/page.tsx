import { Metadata } from 'next';
import TenderClient from '@/app/tender/[id]/TenderClient';

export const metadata: Metadata = {
  title: 'Premium Demo Tender - ProTenders',
  description: 'Experience a full tender detail page with all premium features unlocked',
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Demo Tender Detail Page
 *
 * This uses the exact same TenderClient component as the regular tender pages,
 * but because the path starts with /demo, the useContentAccess hook will
 * automatically disable all blur effects and show full premium content.
 */
export default function DemoTenderDetailPage() {
  return <TenderClient />;
}
