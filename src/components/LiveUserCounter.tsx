'use client';

import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';

interface LiveUserCounterProps {
  minUsers?: number;
  maxUsers?: number;
  className?: string;
}

export default function LiveUserCounter({
  minUsers = 80,
  maxUsers = 200,
  className = '',
}: LiveUserCounterProps) {
  const [userCount, setUserCount] = useState(minUsers);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Set initial random count
    const initialCount = Math.floor(Math.random() * (maxUsers - minUsers + 1)) + minUsers;
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
        newCount = Math.max(minUsers, Math.min(maxUsers, newCount));

        return newCount;
      });
    }, Math.random() * 5000 + 3000); // Random interval between 3-8 seconds

    return () => clearInterval(interval);
  }, [minUsers, maxUsers]);

  // Don't render on server to avoid hydration mismatch
  if (!isClient) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}>
      <div className="relative">
        <Users className="h-4 w-4" />
        <span className="absolute -top-1 -right-1 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
      </div>
      <span className="font-medium">
        <span className="transition-all duration-500">{userCount}</span> businesses currently browsing
      </span>
    </div>
  );
}
