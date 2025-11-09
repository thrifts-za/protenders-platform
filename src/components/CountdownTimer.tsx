'use client';

import { useEffect, useState } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  closingDate: string | Date;
  className?: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  total: number; // total milliseconds
}

export function CountdownTimer({ closingDate, className }: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const calculateTimeRemaining = (): TimeRemaining => {
      const now = new Date().getTime();
      const closing = new Date(closingDate).getTime();
      const difference = closing - now;

      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, total: 0 };
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

      return { days, hours, minutes, total: difference };
    };

    // Initial calculation
    setTimeRemaining(calculateTimeRemaining());

    // Update every minute
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [closingDate, mounted]);

  if (!mounted || !timeRemaining) {
    return null; // Avoid hydration mismatch
  }

  // Determine urgency level and styling
  const getUrgencyStyle = () => {
    if (timeRemaining.total <= 0) {
      return {
        color: 'text-gray-500',
        bgColor: 'bg-gray-100',
        borderColor: 'border-gray-300',
        label: 'Closed',
        showPulse: false,
      };
    }

    if (timeRemaining.days <= 7) {
      return {
        color: 'text-red-700',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-300',
        label: 'Urgent',
        showPulse: true,
      };
    }

    if (timeRemaining.days <= 15) {
      return {
        color: 'text-orange-700',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-300',
        label: 'Closing Soon',
        showPulse: false,
      };
    }

    if (timeRemaining.days <= 30) {
      return {
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-300',
        label: 'Time Limited',
        showPulse: false,
      };
    }

    return {
      color: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-300',
      label: 'Open',
      showPulse: false,
    };
  };

  const urgencyStyle = getUrgencyStyle();

  // Format time remaining display
  const formatTimeRemaining = () => {
    if (timeRemaining.total <= 0) {
      return 'Tender has closed';
    }

    if (timeRemaining.days === 0) {
      if (timeRemaining.hours === 0) {
        return `${timeRemaining.minutes} minute${timeRemaining.minutes !== 1 ? 's' : ''} remaining`;
      }
      return `${timeRemaining.hours} hour${timeRemaining.hours !== 1 ? 's' : ''}, ${timeRemaining.minutes} min remaining`;
    }

    if (timeRemaining.days === 1) {
      return `1 day, ${timeRemaining.hours} hour${timeRemaining.hours !== 1 ? 's' : ''} remaining`;
    }

    if (timeRemaining.days <= 7) {
      return `${timeRemaining.days} days, ${timeRemaining.hours} hour${timeRemaining.hours !== 1 ? 's' : ''} remaining`;
    }

    return `${timeRemaining.days} day${timeRemaining.days !== 1 ? 's' : ''} remaining`;
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-all',
        urgencyStyle.bgColor,
        urgencyStyle.borderColor,
        urgencyStyle.color,
        urgencyStyle.showPulse && 'animate-pulse',
        className
      )}
    >
      {urgencyStyle.showPulse ? (
        <AlertCircle className="h-4 w-4 flex-shrink-0" />
      ) : (
        <Clock className="h-4 w-4 flex-shrink-0" />
      )}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wide opacity-75">
          {urgencyStyle.label}
        </span>
        <span className="text-sm font-semibold">
          {formatTimeRemaining()}
        </span>
      </div>
    </div>
  );
}
