'use client';

import { useState, useEffect } from 'react';
import { X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LiveUserCounter from '@/components/LiveUserCounter';

interface NotificationBarProps {
  message?: string;
  dismissible?: boolean;
  variant?: 'info' | 'warning' | 'success';
}

export default function NotificationBar({
  message = "🚀 Beta Version - Best viewed on desktop for optimal experience",
  dismissible = true,
  variant = 'info',
}: NotificationBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const STORAGE_KEY = 'notification-bar-dismissed';

  useEffect(() => {
    // Check if user has dismissed the notification
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    if (dismissible) {
      localStorage.setItem(STORAGE_KEY, 'true');
    }
  };

  if (!isVisible) return null;

  const variantStyles = {
    info: 'bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-950 dark:text-blue-100 dark:border-blue-900',
    warning: 'bg-orange-50 text-orange-900 border-orange-200 dark:bg-orange-950 dark:text-orange-100 dark:border-orange-900',
    success: 'bg-green-50 text-green-900 border-green-200 dark:bg-green-950 dark:text-green-100 dark:border-green-900',
  };

  return (
    <div className={`w-full border-b ${variantStyles[variant]} transition-all`}>
      <div className="content-container">
        <div className="flex items-center justify-between gap-4 py-2.5">
          <div className="flex items-center gap-2 flex-1">
            <Info className="h-4 w-4 flex-shrink-0" />
            <p className="text-sm font-medium">{message}</p>
          </div>
          <div className="flex items-center gap-4">
            <LiveUserCounter className="hidden md:flex" />
            {dismissible && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-transparent"
                onClick={handleDismiss}
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
