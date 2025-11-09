'use client';

import { usePathname } from 'next/navigation';
import NotificationBar from './NotificationBar';

export default function ConditionalNotificationBar() {
  const pathname = usePathname();

  // Hide notification bar on admin pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return <NotificationBar />;
}
