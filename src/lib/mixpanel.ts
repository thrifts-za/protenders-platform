/**
 * Mixpanel Client Initialization
 * Official Next.js integration: https://docs.mixpanel.com/docs/tracking-methods/integrations/nextjs
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

  mixpanel.init(MIXPANEL_TOKEN, {
    autocapture: true,
    record_sessions_percent: 100,
    persistence: 'localStorage',
  });

  isInitialized = true;
};

// Export the mixpanel instance for use in tracking functions
export default mixpanel;
