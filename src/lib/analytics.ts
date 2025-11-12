/**
 * Analytics Tracking Utilities
 * Centralized event tracking for Mixpanel, Google Analytics, and other analytics platforms
 */

import mixpanel from '@/lib/mixpanel';

// Extend Window interface to include analytics globals
declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string,
      config?: Record<string, any>
    ) => void;
    clarity?: (command: string, ...args: any[]) => void;
  }
}

/**
 * Track a custom event across all analytics platforms
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, any>
) {
  // Mixpanel
  if (typeof window !== 'undefined') {
    try {
      mixpanel.track(eventName, properties);
    } catch (error) {
      console.warn('Mixpanel tracking error:', error);
    }
  }

  // Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    try {
      window.gtag('event', eventName, properties);
    } catch (error) {
      console.warn('GA tracking error:', error);
    }
  }
}

/**
 * Track search events
 */
export function trackSearch(query: string, filters?: Record<string, any>) {
  trackEvent('Search Performed', {
    query,
    query_length: query.length,
    has_filters: !!filters && Object.keys(filters).length > 0,
    filter_count: filters ? Object.keys(filters).length : 0,
    ...filters,
  });
}

/**
 * Track tender view events
 */
export function trackTenderView(tenderId: string, source?: string) {
  trackEvent('Tender Viewed', {
    tender_id: tenderId,
    source: source || 'direct',
  });
}

/**
 * Track tender interactions
 */
export function trackTenderInteraction(
  action: 'save' | 'share' | 'contact' | 'download',
  tenderId: string
) {
  trackEvent('Tender Interaction', {
    action,
    tender_id: tenderId,
  });
}

/**
 * Track navigation events
 */
export function trackNavigation(destination: string, source?: string) {
  trackEvent('Navigation', {
    destination,
    source: source || 'menu',
  });
}

/**
 * Track form submissions
 */
export function trackFormSubmission(
  formName: string,
  success: boolean,
  error?: string
) {
  trackEvent('Form Submitted', {
    form_name: formName,
    success,
    error: error || undefined,
  });
}

/**
 * Track button clicks
 */
export function trackButtonClick(
  buttonName: string,
  location: string,
  metadata?: Record<string, any>
) {
  trackEvent('Button Clicked', {
    button_name: buttonName,
    location,
    ...metadata,
  });
}

/**
 * Track authentication events
 */
export function trackAuth(action: 'login' | 'logout' | 'register' | 'password_reset') {
  trackEvent('Auth Event', {
    action,
  });
}

/**
 * Track upgrade/premium events
 */
export function trackUpgrade(action: 'view_pricing' | 'start_trial' | 'upgrade_click') {
  trackEvent('Upgrade Event', {
    action,
  });
}

/**
 * Track filter usage
 */
export function trackFilterChange(
  filterType: string,
  filterValue: string | string[],
  active: boolean
) {
  trackEvent('Filter Changed', {
    filter_type: filterType,
    filter_value: Array.isArray(filterValue) ? filterValue.join(',') : filterValue,
    active,
  });
}

/**
 * Track contact form submissions
 */
export function trackContactSubmission(type: 'feedback' | 'support' | 'general') {
  trackEvent('Contact Form Submitted', {
    type,
  });
}

/**
 * Track alert/notification events
 */
export function trackAlert(action: 'create' | 'edit' | 'delete' | 'trigger', alertId?: string) {
  trackEvent('Alert Event', {
    action,
    alert_id: alertId,
  });
}

/**
 * Track user preferences
 */
export function trackPreferenceChange(
  preference: string,
  value: string | boolean | number
) {
  trackEvent('Preference Changed', {
    preference,
    value: String(value),
  });
}

/**
 * Track errors
 */
export function trackError(
  errorType: string,
  errorMessage: string,
  context?: Record<string, any>
) {
  trackEvent('Error Occurred', {
    error_type: errorType,
    error_message: errorMessage,
    ...context,
  });
}

/**
 * Identify user (for authenticated sessions)
 */
export function identifyUser(userId: string, properties?: Record<string, any>) {
  // Mixpanel
  if (typeof window !== 'undefined') {
    try {
      mixpanel.identify(userId);
      if (properties) {
        mixpanel.people.set(properties);
      }
    } catch (error) {
      console.warn('Mixpanel identify error:', error);
    }
  }

  // Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    try {
      window.gtag('config', 'G-JS1J9SDY13', {
        user_id: userId,
        ...properties,
      });
    } catch (error) {
      console.warn('GA identify error:', error);
    }
  }
}

/**
 * Track funding opportunity view events
 * Phase 3: ProTender Fund Finder
 */
export function trackFundingView(
  fundingId: string,
  fundingName: string,
  institution: string,
  source?: string
) {
  trackEvent('Funding Viewed', {
    funding_id: fundingId,
    funding_name: fundingName,
    institution,
    source: source || 'direct',
  });
}

/**
 * Track funding filter application
 * Phase 3: ProTender Fund Finder
 */
export function trackFundingFilterApplied(filters: Record<string, any>) {
  trackEvent('Funding Filter Applied', {
    has_categories: !!filters.categories,
    has_provinces: !!filters.provinces,
    has_funding_type: !!filters.fundingType,
    has_amount_filter: !!(filters.amountMin || filters.amountMax),
    has_institution: !!filters.institution,
    ...filters,
  });
}

/**
 * Track funding save events
 * Phase 3: ProTender Fund Finder
 */
export function trackFundingSaved(
  fundingId: string,
  fundingName: string,
  institution: string
) {
  trackEvent('Funding Saved', {
    funding_id: fundingId,
    funding_name: fundingName,
    institution,
  });
}

/**
 * Track funding application click
 * Phase 3: ProTender Fund Finder
 */
export function trackFundingApplication(
  fundingId: string,
  fundingName: string,
  institution: string,
  applyUrl: string
) {
  trackEvent('Funding Application Started', {
    funding_id: fundingId,
    funding_name: fundingName,
    institution,
    apply_url: applyUrl,
  });
}

/**
 * Track funding match algorithm usage
 * Phase 3: ProTender Fund Finder
 */
export function trackFundingMatch(
  profile: Record<string, any>,
  matchCount: number,
  topScore: number
) {
  trackEvent('Funding Match Performed', {
    has_industry: !!profile.industry,
    has_turnover: !!profile.turnover,
    has_province: !!profile.province,
    has_funding_amount: !!profile.fundingAmount,
    match_count: matchCount,
    top_score: topScore,
    ...profile,
  });
}

/**
 * Track funding search
 * Phase 3: ProTender Fund Finder
 */
export function trackFundingSearch(
  query: string,
  filters?: Record<string, any>,
  resultsCount?: number
) {
  trackEvent('Funding Search Performed', {
    query,
    query_length: query.length,
    has_filters: !!filters && Object.keys(filters).length > 0,
    results_count: resultsCount,
    ...filters,
  });
}

/**
 * Track funding contact info view
 * Phase 3: ProTender Fund Finder
 */
export function trackFundingContactView(
  fundingId: string,
  institution: string,
  contactType: 'email' | 'phone' | 'address'
) {
  trackEvent('Funding Contact Viewed', {
    funding_id: fundingId,
    institution,
    contact_type: contactType,
  });
}
