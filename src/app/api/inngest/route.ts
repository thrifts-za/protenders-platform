/**
 * Inngest API Endpoint
 *
 * This endpoint serves Inngest functions to the Inngest platform.
 * It handles incoming function executions and provides the function registry.
 *
 * Routes:
 * - GET /api/inngest - Returns function registry (for Inngest dashboard)
 * - POST /api/inngest - Executes functions (called by Inngest platform)
 * - PUT /api/inngest - Handles function registration
 *
 * Environment variables required:
 * - INNGEST_SIGNING_KEY: Your Inngest signing key (production)
 * - INNGEST_EVENT_KEY: Your Inngest event key (for sending events)
 */

import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest/client';
import { functions } from '@/lib/inngest/functions';

/**
 * Serve Inngest functions via Next.js API route
 *
 * This creates GET, POST, and PUT handlers automatically
 */
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions,

  // Optional: Configure serving options
  servePath: '/api/inngest',

  // Optional: Custom logging in development
  logLevel: process.env.NODE_ENV === 'development' ? 'info' : 'error',
});
