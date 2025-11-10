/**
 * Inngest Functions Registry
 *
 * Exports all Inngest functions to be served by the API endpoint.
 */

import { tenderSyncFunction } from './tender-sync';
import { enrichTodayFunction } from './enrich-today';

/**
 * All Inngest functions
 * Add new functions to this array to register them with Inngest
 */
export const functions = [
  tenderSyncFunction,
  enrichTodayFunction,
];
