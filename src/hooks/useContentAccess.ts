'use client';

import { useAuth } from '@/hooks/useAuth';
import { usePathname } from 'next/navigation';

/**
 * Hook for managing premium content access control
 *
 * Access hierarchy:
 * 1. Demo page - always has access
 * 2. Admin/Dev roles - always have access (with dev badge)
 * 3. Premium subscription - has access when active
 * 4. Free users - content is blurred/gated
 *
 * @returns Access control state and user plan info
 */
export function useContentAccess() {
  const { user, isAuthenticated } = useAuth();
  const pathname = usePathname();

  // Special pages that bypass all gating
  const isDemoPage = pathname?.startsWith('/demo');

  // Role-based access (Admins always see everything)
  const isDevOrAdmin = user?.role === 'admin';

  // Subscription check (ready for Stripe integration)
  // @ts-expect-error - plan field will be added to User model
  const plan = user?.plan || 'free'; // "free", "basic", "premium", "pro"
  const isPremium = plan === 'premium' || plan === 'pro';

  // Check if subscription is active (ready for future use)
  // @ts-expect-error - subscriptionEnd field will be added to User model
  const subscriptionEnd = user?.subscriptionEnd;
  const isSubscriptionActive = subscriptionEnd ? new Date(subscriptionEnd) > new Date() : false;

  // Final access determination
  const hasFullAccess = isDemoPage || isDevOrAdmin || (isPremium && isSubscriptionActive);

  return {
    /**
     * Whether user has full access to premium content
     */
    hasFullAccess,

    /**
     * Whether content should be blurred (inverse of hasFullAccess)
     */
    shouldBlur: !hasFullAccess,

    /**
     * User's subscription plan
     */
    plan,

    /**
     * Whether user has premium plan
     */
    isPremium,

    /**
     * Whether user is admin or developer
     */
    isDevOrAdmin,

    /**
     * Whether current page is demo page
     */
    isDemoPage,

    /**
     * Whether user is authenticated
     */
    isAuthenticated,

    /**
     * Current user object
     */
    user,
  };
}
