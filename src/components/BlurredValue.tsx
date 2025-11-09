'use client';

import { ReactNode } from 'react';
import { useContentAccess } from '@/hooks/useContentAccess';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlurredValueProps {
  children: ReactNode;
  /**
   * Show lock icon overlay
   * @default true
   */
  showIcon?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Inline value blurring component
 *
 * Blurs individual values (numbers, text) for non-premium users
 * while keeping them visible for premium users, admins, and on demo pages.
 *
 * @example
 * ```tsx
 * <p>Win Probability: <BlurredValue>68%</BlurredValue></p>
 * <p>Estimated Value: <BlurredValue>{formatCurrency(value)}</BlurredValue></p>
 * ```
 */
export function BlurredValue({
  children,
  showIcon = true,
  className,
}: BlurredValueProps) {
  const { shouldBlur } = useContentAccess();

  if (!shouldBlur) {
    return <>{children}</>;
  }

  return (
    <span className={cn('relative inline-block', className)}>
      <span className="blur-sm select-none">{children}</span>
      {showIcon && (
        <Lock className="h-3 w-3 text-gray-500 dark:text-gray-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      )}
    </span>
  );
}
