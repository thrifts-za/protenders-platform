/**
 * Analytics Tracking Utilities
 * Centralized event tracking for Mixpanel, Google Analytics, and other analytics platforms
 */

// Extend Window interface to include analytics globals
declare global {
  interface Window {
    mixpanel?: {
      track: (event: string, properties?: Record<string, any>) => void;
      identify: (userId: string) => void;
      people: {
        set: (properties: Record<string, any>) => void;
      };
    };
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
  if (typeof window !== 'undefined' && window.mixpanel) {
    try {
      window.mixpanel.track(eventName, properties);
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
  if (typeof window !== 'undefined' && window.mixpanel) {
    try {
      window.mixpanel.identify(userId);
      if (properties && window.mixpanel.people) {
        window.mixpanel.people.set(properties);
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
