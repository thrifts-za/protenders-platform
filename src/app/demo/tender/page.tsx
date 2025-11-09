import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Premium Demo Tender - ProTenders',
  description: 'Experience a full tender detail page with all premium features unlocked',
  robots: {
    index: false,
    follow: false,
  },
};

// Demo tender slug - this is the tender we'll use for demo purposes
const DEMO_TENDER_SLUG = 'procurement-of-office-furniture-ocds-9t57fa-139508';

export default function DemoTenderPage() {
  // Redirect to the demo tender, but keep the /demo path prefix
  // This allows the useContentAccess hook to detect it as a demo page
  redirect(`/demo/tender/${DEMO_TENDER_SLUG}`);
}
