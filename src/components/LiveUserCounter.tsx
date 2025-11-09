'use client';

import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';

interface LiveUserCounterProps {
  minUsers?: number;
  maxUsers?: number;
  className?: string;
}

/**
 * Get user count range based on South African business hours
 * Working hours (8am-5pm SAST): High activity
 * Evening/Night (5pm-8am SAST): Very low activity
 */
function getUserCountRange() {
  const now = new Date();
  // Get SAST hour (UTC+2)
  const sastHour = (now.getUTCHours() + 2) % 24;

  // Working hours: 8am - 5pm (08:00 - 17:00)
  if (sastHour >= 8 && sastHour < 17) {
    return { min: 120, max: 280 }; // High activity during business hours
  }
  // Evening: 5pm - 10pm (17:00 - 22:00)
  else if (sastHour >= 17 && sastHour < 22) {
    return { min: 15, max: 45 }; // Low activity in evening
  }
  // Night: 10pm - 8am (22:00 - 08:00)
  else {
    return { min: 3, max: 12 }; // Very low activity at night
  }
}

export default function LiveUserCounter({
  minUsers,
  maxUsers,
  className = '',
}: LiveUserCounterProps) {
  // Use time-based defaults if not provided
  const timeBasedRange = getUserCountRange();
  const min = minUsers ?? timeBasedRange.min;
  const max = maxUsers ?? timeBasedRange.max;

  const [userCount, setUserCount] = useState(min);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Set initial random count
    const initialCount = Math.floor(Math.random() * (max - min + 1)) + min;
    setUserCount(initialCount);

    // Fluctuate count every 3-8 seconds
    const interval = setInterval(() => {
      setUserCount(prevCount => {
        // Determine if we increase or decrease (60% chance to increase for growth feel)
        const shouldIncrease = Math.random() > 0.4;

        // Small random change (1-5 users)
        const change = Math.floor(Math.random() * 5) + 1;

        let newCount = shouldIncrease ? prevCount + change : prevCount - change;

        // Keep within bounds
        newCount = Math.max(min, Math.min(max, newCount));

        return newCount;
      });
    }, Math.random() * 5000 + 3000); // Random interval between 3-8 seconds

    return () => clearInterval(interval);
  }, [min, max]);

  // Don't render on server to avoid hydration mismatch
  if (!isClient) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}>
      <div className="relative">
        <Users className="h-4 w-4" />
        <span className="absolute -top-1 -right-1 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/60 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
        </span>
      </div>
      <span className="font-medium">
        <span className="transition-all duration-500">{userCount}</span> businesses currently online
      </span>
    </div>
  );
}
