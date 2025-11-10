'use client';

import { useEffect } from 'react';
import { initMixpanel } from '@/lib/mixpanel';

/**
 * Mixpanel Provider Component
 * Initializes Mixpanel on the client side with autocapture and session recording
 */
export default function MixpanelProvider() {
  useEffect(() => {
    initMixpanel();
  }, []);

  return null;
}
