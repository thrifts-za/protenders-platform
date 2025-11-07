/**
 * Tender Type Definitions
 * Based on OCDS (Open Contracting Data Standard)
 */

export interface Tender {
  ocid: string;
  id: string;
  date: string;
  tag: string[];
  initiationType: string;
  raw?: unknown;
  buyer?: {
    id: string;
    name: string;
  };
  tender?: TenderDetails;
  parties?: Party[];
  awards?: Award[];
  contracts?: Contract[];
  // Additional fields from our database
  publishedAt?: string;
  updatedAt?: string;
  closingAt?: string;
  status?: string;
  detailedCategory?: string; // Detailed category from eTenders enrichment (91 categories)
}

export interface TenderDetails {
  id: string;
  title?: string;
  description?: string;
  status: string;
  items?: TenderItem[];
  value?: {
    amount: number;
    currency: string;
  };
  procurementMethod?: string;
  procurementMethodDetails?: string;
  mainProcurementCategory?: string;
  tenderPeriod?: {
    startDate?: string;
    endDate?: string;
  };
  submissionMethod?: string[];
  submissionMethodDetails?: string;
  documents?: TenderDocument[];
}

export interface TenderItem {
  id: string;
  description?: string;
  classification?: {
    scheme: string;
    id: string;
    description?: string;
    uri?: string;
  };
  quantity?: number;
  unit?: {
    name: string;
    value?: {
      amount: number;
      currency: string;
    };
  };
}

export interface TenderDocument {
  id: string;
  documentType: string;
  title?: string;
  description?: string;
  url?: string;
  datePublished?: string;
  dateModified?: string;
  format?: string;
  language?: string;
}

export interface Party {
  id: string;
  name: string;
  identifier?: {
    scheme: string;
    id: string;
    legalName?: string;
  };
  address?: {
    streetAddress?: string;
    locality?: string;
    region?: string;
    postalCode?: string;
    countryName?: string;
  };
  contactPoint?: {
    name?: string;
    email?: string;
    telephone?: string;
    faxNumber?: string;
    url?: string;
  };
  roles: string[];
}

export interface Award {
  id: string;
  title?: string;
  description?: string;
  status: string;
  date?: string;
  value?: {
    amount: number;
    currency: string;
  };
  suppliers?: {
    id: string;
    name: string;
  }[];
  contractPeriod?: {
    startDate?: string;
    endDate?: string;
  };
}

export interface Contract {
  id: string;
  awardID?: string;
  title?: string;
  description?: string;
  status: string;
  period?: {
    startDate?: string;
    endDate?: string;
  };
  value?: {
    amount: number;
    currency: string;
  };
  dateSigned?: string;
}

// API Response Types
export interface TenderSearchParams {
  keywords?: string;
  categories?: string[];
  closingInDays?: number;
  submissionMethods?: string[];
  buyer?: string;
  status?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
  publishedSince?: string;
  updatedSince?: string;
}

export interface TenderSearchResponse {
  results: Tender[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Alert Types
export type AlertFrequency = "daily" | "weekly" | "none";

// Legacy UI support types (from Vite app)
export type SubmissionMethod = string; // e.g., "email" | "electronic" | "physical" | "portal" | "online" | "other"
export type TenderStatus = "active" | "planned" | "complete" | "cancelled";

export interface SearchParams {
  keywords?: string;
  categories?: string[];
  closingInDays?: number | null;
  submissionMethods?: string[];
  buyer?: string | null;
  status?: string | null;
  page?: number;
  pageSize?: number;
}

export interface SavedAlert {
  id: string;
  name?: string;
  email: string;
  frequency: AlertFrequency;
  searchParams: SearchParams;
  active: boolean;
  createdAt: string;
  lastRun?: string;
  nextRun?: string;
}

export interface SavedTender {
  tenderId: string;
  tender: NormalizedTender;
  savedAt: string;
  notes?: string;
  tags?: string[];
  isSubmitted?: boolean;
}

export interface NormalizedTender {
  id: string;
  ocid?: string;
  title: string;
  displayTitle?: string;
  description?: string;
  buyerName?: string;
  mainProcurementCategory?: string;
  closingDate?: string;
  submissionMethods?: string[];
  status?: string;
  documents?: TenderDocument[];
  awards?: Award[];
  previousClosingDate?: string | null;
  dataQualityScore: number;
  raw?: unknown;
}

export interface SearchResponse {
  data: NormalizedTender[];
  total: number;
  page: number;
  pageSize: number;
  meta?: {
    total: number;
    page: number;
    pageSize: number;
    dataSource?: string;
  };
}

export interface OpportunityFilters {
  keywords?: string;
  category?: string;
  region?: string;
  quarter?: string;
}

export interface InsightData {
  activeTendersByCategory: { category: string; count: number }[];
  topBuyers: { name: string; count: number }[];
  totalValueNext30Days: number;
  valueSparkline: number[];
}

export interface SupplierProfile {
  name: string;
  supplier?: string;
  window: string;
  awardsLast12M: Award[];
  topBuyers: { name: string; buyer?: string; count: number }[];
  avgContractValue: number | null;
  currency: string | null;
}

export interface TimelineStep {
  releaseId: string;
  date: string;
  tag: string[];
  changed?: {
    closingDate?: {
      from: string | null;
      to: string | null;
    };
  };
}

export interface TenderTimeline {
  ocid: string;
  steps: TimelineStep[];
}
