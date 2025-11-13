'use client';

import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

const Footer = dynamic(() => import('./Footer'), {
  loading: () => <div className="w-full h-64 bg-card border-t mt-auto" />,
  ssr: true,
});

export default function ConditionalFooter() {
  const pathname = usePathname();

  // Hide footer on admin pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return <Footer />;
}
