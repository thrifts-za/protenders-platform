/**
 * Inngest Client Configuration
 *
 * Creates a singleton Inngest client for durable background job execution.
 * This replaces long-running API routes that hit Vercel's 5-minute timeout.
 */

import { Inngest } from 'inngest';

/**
 * Inngest Client
 *
 * Usage:
 * - Functions use this client to register with Inngest
 * - Events are sent using inngest.send()
 * - Environment variables:
 *   - INNGEST_SIGNING_KEY: For production (required on Vercel)
 *   - INNGEST_EVENT_KEY: For sending events (required)
 */
export const inngest = new Inngest({
  id: 'protenders-platform',
  name: 'ProTenders Platform',

  // Event key for sending events (if not provided, uses INNGEST_EVENT_KEY env var)
  eventKey: process.env.INNGEST_EVENT_KEY,

  // Signing key for production (automatically uses INNGEST_SIGNING_KEY env var)
  // In development, Inngest Dev Server doesn't require this
});

/**
 * Helper to send events to Inngest
 *
 * Example:
 * ```typescript
 * await sendEvent({
 *   name: 'tender/sync.requested',
 *   data: { maxEnrichment: 10 }
 * });
 * ```
 */
export async function sendEvent<T = any>(event: {
  name: string;
  data: T;
  user?: Record<string, any>;
  ts?: number;
}) {
  try {
    await inngest.send(event);
    console.log(`📤 Sent Inngest event: ${event.name}`);
  } catch (error) {
    console.error(`❌ Failed to send Inngest event: ${event.name}`, error);
    throw error;
  }
}
