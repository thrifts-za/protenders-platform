/**
 * Inngest Event Type Definitions
 *
 * Provides type safety for all events sent to and consumed by Inngest functions.
 * All events follow the pattern: 'domain/action.status'
 */

/**
 * Event: Tender Sync Requested
 * Triggered by: GitHub Actions cron, manual admin trigger
 * Processed by: tender-sync function
 */
export type TenderSyncRequestedEvent = {
  name: 'tender/sync.requested';
  data: {
    /** Maximum number of tenders to enrich in this run (default: 10) */
    maxEnrichment?: number;
    /** Only sync tenders from this date onwards (ISO string) */
    fromDate?: string;
    /** Only sync tenders until this date (ISO string) */
    toDate?: string;
    /** Whether to require enrichment before saving (default: false) */
    requireEnrichment?: boolean;
    /** Manually triggered by admin user */
    triggeredBy?: 'cron' | 'manual' | 'github-actions';
    /** Admin user ID if manually triggered */
    adminUserId?: string;
  };
};

/**
 * Event: Enrich Today's Tenders
 * Triggered by: Admin dashboard button
 * Processed by: enrich-today function
 */
export type EnrichTodayRequestedEvent = {
  name: 'tender/enrich-today.requested';
  data: {
    /** Maximum number of tenders to enrich (default: from env MAX_ENRICHMENT_PER_RUN) */
    maxEnrichment?: number;
    /** Rate limit delay in ms between enrichment calls (default: 300) */
    rateLimit?: number;
    /** Admin user ID who triggered the enrichment */
    adminUserId?: string;
  };
};

/**
 * Event: Enrich Specific Tender
 * Triggered by: Admin dashboard, API request
 * Processed by: enrich-tender function
 */
export type EnrichTenderRequestedEvent = {
  name: 'tender/enrich.requested';
  data: {
    /** OCID of the tender to enrich */
    ocid: string;
    /** Published date of the tender */
    publishedAt: string;
    /** Whether to force re-enrichment even if already enriched */
    force?: boolean;
    /** Admin user ID who triggered the enrichment */
    adminUserId?: string;
  };
};

/**
 * Event: Backfill Enrichment for Date Range
 * Triggered by: Admin dashboard, script
 * Processed by: enrich-backfill function
 */
export type EnrichBackfillRequestedEvent = {
  name: 'tender/enrich-backfill.requested';
  data: {
    /** Start date for backfill (ISO string) */
    fromDate: string;
    /** End date for backfill (ISO string) */
    toDate: string;
    /** Maximum number of tenders to enrich in total */
    maxEnrichment: number;
    /** Rate limit delay in ms between enrichment calls */
    rateLimit?: number;
    /** Admin user ID who triggered the backfill */
    adminUserId?: string;
  };
};

/**
 * Event: Cleanup Stuck Jobs
 * Triggered by: Scheduled cron (daily)
 * Processed by: cleanup-jobs function
 */
export type CleanupJobsRequestedEvent = {
  name: 'system/cleanup-jobs.requested';
  data: {
    /** Mark jobs as failed if running longer than this many minutes (default: 10) */
    timeoutMinutes?: number;
  };
};

/**
 * Union type of all events
 * Used for type-safe event handling in Inngest functions
 */
export type Events =
  | TenderSyncRequestedEvent
  | EnrichTodayRequestedEvent
  | EnrichTenderRequestedEvent
  | EnrichBackfillRequestedEvent
  | CleanupJobsRequestedEvent;

/**
 * Helper type to extract event data from event name
 */
export type EventData<T extends Events['name']> = Extract<
  Events,
  { name: T }
>['data'];

/**
 * Event name constants for easier imports
 */
export const EventNames = {
  TENDER_SYNC_REQUESTED: 'tender/sync.requested',
  ENRICH_TODAY_REQUESTED: 'tender/enrich-today.requested',
  ENRICH_TENDER_REQUESTED: 'tender/enrich.requested',
  ENRICH_BACKFILL_REQUESTED: 'tender/enrich-backfill.requested',
  CLEANUP_JOBS_REQUESTED: 'system/cleanup-jobs.requested',
} as const;
