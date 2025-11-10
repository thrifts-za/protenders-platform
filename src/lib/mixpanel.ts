/**
 * Mixpanel Client Initialization
 * Simplified implementation for Next.js
 */

import mixpanel from 'mixpanel-browser';

const MIXPANEL_TOKEN = 'c4423b2f88901316cd6162f2bd583f68';

let isInitialized = false;

export const initMixpanel = () => {
  if (typeof window === 'undefined') {
    return; // Don't initialize on server
  }

  if (isInitialized) {
    return; // Already initialized
  }

  if (!MIXPANEL_TOKEN) {
    console.warn('Mixpanel token is missing!');
    return;
  }

  // Initialize with minimal config for maximum compatibility
  mixpanel.init(MIXPANEL_TOKEN, {
    debug: true, // Enable debug mode to see what's being tracked
    track_pageview: true, // Automatically track page views
    persistence: 'localStorage',
  });

  console.log('Mixpanel initialized');
  isInitialized = true;
};

// Export the mixpanel instance for use in tracking functions
export default mixpanel;
