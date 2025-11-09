'use client';

import { useState, useEffect } from 'react';
import { Info } from 'lucide-react';
import LiveUserCounter from '@/components/LiveUserCounter';

interface NotificationBarProps {
  variant?: 'info' | 'warning' | 'success';
}

export default function NotificationBar({
  variant = 'info',
}: NotificationBarProps) {
  const [message, setMessage] = useState('🚀 Beta Version - Best viewed on desktop for optimal experience');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Fetch notification message from API
    async function fetchNotificationMessage() {
      try {
        const response = await fetch('/api/notification-bar');
        if (response.ok) {
          const data = await response.json();
          if (data.message) {
            setMessage(data.message);
          }
        }
      } catch (error) {
        console.warn('Could not fetch notification message:', error);
        // Use default message
      }
    }

    fetchNotificationMessage();
  }, []);

  if (!isClient) return null;

  const variantStyles = {
    info: 'bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-950 dark:text-blue-100 dark:border-blue-900',
    warning: 'bg-orange-50 text-orange-900 border-orange-200 dark:bg-orange-950 dark:text-orange-100 dark:border-orange-900',
    success: 'bg-green-50 text-green-900 border-green-200 dark:bg-green-950 dark:text-green-100 dark:border-green-900',
  };

  return (
    <div className={`w-full border-b ${variantStyles[variant]} transition-all relative overflow-hidden`}>
      {/* Subtle ambient gradient background */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="ambient-gradient-bar"></div>
      </div>

      <div className="content-container relative z-10">
        <div className="flex items-center justify-between gap-4 py-2.5">
          <div className="flex items-center gap-2 flex-1">
            <Info className="h-4 w-4 flex-shrink-0" />
            <p className="text-sm font-medium">{message}</p>
          </div>
          <div className="flex items-center gap-4">
            <LiveUserCounter className="hidden md:flex" />
          </div>
        </div>
      </div>

      <style jsx>{`
        .ambient-gradient-bar {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            #dbeafe 0%,
            #bfdbfe 25%,
            #93c5fd 50%,
            #60a5fa 75%,
            #3b82f6 100%
          );
          background-size: 300% 100%;
          animation: ambient-slide 20s ease-in-out infinite;
        }

        @keyframes ambient-slide {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  );
}
