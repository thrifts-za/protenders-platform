import type { Metadata } from 'next';
import DemoPageClient from './DemoPageClient';

export const metadata: Metadata = {
  title: 'Premium Demo - ProTenders',
  description: 'Experience the full power of ProTenders premium intelligence features',
  robots: {
    index: false,
    follow: false,
  },
};

export default function DemoPage() {
  return <DemoPageClient />;
}
