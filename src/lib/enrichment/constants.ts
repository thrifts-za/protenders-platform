/**
 * Constants for enrichment operations
 */

// Rate limiting delays (milliseconds)
export const RATE_LIMIT_DELAY_MS = 300;
export const RATE_LIMIT_DELAY_ETENDERS_MS = 350;
export const RATE_LIMIT_DELAY_RETRY_MS = 750;

// HTTP timeouts (milliseconds)
export const HTTP_TIMEOUT_MS = 60000; // 60 seconds

// Retry attempts
export const MAX_RETRY_ATTEMPTS = 2;

// eTenders API endpoints
export const ETENDERS_API_BASE = 'https://www.etenders.gov.za/Home/PaginatedTenderOpportunities';
export const ETENDERS_DOWNLOAD_BASE = 'https://www.etenders.gov.za/home/Download';

// OCDS API endpoints
export const OCDS_API_BASE = process.env.OCDS_BASE_URL || 'https://ocds-api.etenders.gov.za';

// Enrichment limits
export const DEFAULT_MAX_ENRICHMENT_PER_RUN = 100;
export const DEFAULT_MAX_SCRAPE_PER_DAY = 50;

// Province names (South Africa)
export const SA_PROVINCES = [
  'Gauteng',
  'Western Cape',
  'Eastern Cape',
  'Northern Cape',
  'KwaZulu-Natal',
  'KwaZulu Natal',
  'Free State',
  'Limpopo',
  'North West',
  'Mpumalanga',
] as const;

export type SAProvince = typeof SA_PROVINCES[number];
