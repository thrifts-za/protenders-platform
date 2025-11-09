'use client';

import { ReactNode } from 'react';
import { useContentAccess } from '@/hooks/useContentAccess';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

interface PremiumContentProps {
  children: ReactNode;
  /**
   * Blur intensity level
   * @default "md"
   */
  blurIntensity?: 'sm' | 'md' | 'lg';
  /**
   * Callback when upgrade button is clicked
   */
  onUpgradeClick?: () => void;
  /**
   * Show upgrade button on hover
   * @default true
   */
  showUpgradeButton?: boolean;
  /**
   * Fallback content to show when blurred (optional)
   */
  fallback?: ReactNode;
}

/**
 * Premium content gating wrapper component
 *
 * Automatically blurs content for non-premium users while showing
 * full content to premium users, admins, and on demo pages.
 *
 * @example
 * ```tsx
 * <PremiumContent onUpgradeClick={() => setShowModal(true)}>
 *   <FinancialIntelligence data={data} />
 * </PremiumContent>
 * ```
 */
export function PremiumContent({
  children,
  blurIntensity = 'md',
  onUpgradeClick,
  showUpgradeButton = true,
  fallback,
}: PremiumContentProps) {
  const { shouldBlur, isDevOrAdmin, isDemoPage } = useContentAccess();

  // Show dev badge if admin/dev viewing (but not on demo page)
  if (!shouldBlur && isDevOrAdmin && !isDemoPage) {
    return (
      <div className="relative">
        {children}
        <Badge
          variant="secondary"
          className="absolute top-2 right-2 z-10 bg-purple-600 text-white"
        >
          Dev Access
        </Badge>
      </div>
    );
  }

  // Show content if user has full access
  if (!shouldBlur) {
    return <>{children}</>;
  }

  // Blur content for non-premium users
  return (
    <div className="relative">
      {/* Lightly blurred content - headings visible, values blurred */}
      <div
        className={`blur-[2px] select-none pointer-events-none`}
        style={{ filter: 'blur(2px)' }}
      >
        {fallback || children}
      </div>

      {/* Centered lock overlay - very subtle */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/20">
        {/* Lock Icon with subtle background */}
        <div className="mb-3 p-3 rounded-full bg-background/95 shadow-lg border border-border">
          <Lock className="h-5 w-5 text-primary" />
        </div>

        {/* Upgrade button */}
        {showUpgradeButton && onUpgradeClick && (
          <Button onClick={onUpgradeClick} size="sm" className="shadow-lg">
            <Lock className="h-4 w-4 mr-2" />
            Unlock Premium
          </Button>
        )}
      </div>
    </div>
  );
}
