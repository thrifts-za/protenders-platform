/**
 * Admin API Input Validation Schemas
 *
 * Comprehensive Zod schemas for validating admin endpoint inputs
 * Protects against invalid data, injection attacks, and malformed requests
 */

import { z } from 'zod';

// ============================================================================
// Common/Reusable Schemas
// ============================================================================

/**
 * Pagination parameters (used across multiple endpoints)
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(1000).default(50),
  offset: z.coerce.number().int().min(0).optional(),
});

/**
 * Search query parameters
 */
export const searchSchema = z.object({
  q: z.string().min(1).max(500).trim().optional(),
  query: z.string().min(1).max(500).trim().optional(),
});

/**
 * Date range filter
 */
export const dateRangeSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

/**
 * Sort parameters
 */
export const sortSchema = z.object({
  sortBy: z.string().max(100).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  orderBy: z.string().max(100).optional(),
  order: z.enum(['asc', 'desc', 'ASC', 'DESC']).optional(),
});

/**
 * OCID validation
 */
export const ocidSchema = z.string().regex(/^ocds-[a-z0-9]+-\d+$/i, 'Invalid OCID format');

/**
 * UUID validation
 */
export const uuidSchema = z.string().uuid('Invalid UUID format');

/**
 * Email validation
 */
export const emailSchema = z.string().email('Invalid email address').max(255);

// ============================================================================
// Tender Management Schemas
// ============================================================================

/**
 * Tender list/search query params
 */
export const tenderListSchema = paginationSchema.merge(searchSchema).merge(dateRangeSchema).merge(sortSchema).extend({
  status: z.enum(['active', 'closed', 'cancelled', 'planning', 'all']).optional(),
  category: z.string().max(200).optional(),
  province: z.string().max(100).optional(),
  buyerName: z.string().max(500).optional(),
  hasEnrichment: z.enum(['true', 'false', '1', '0']).optional(),
});

/**
 * Tender update body
 */
export const tenderUpdateSchema = z.object({
  tenderTitle: z.string().min(1).max(1000).trim().optional(),
  contactPerson: z.string().max(500).trim().optional(),
  contactEmail: emailSchema.optional(),
  briefingDate: z.string().max(100).optional(),
  briefingTime: z.string().max(100).optional(),
  briefingVenue: z.string().max(1000).optional(),
  briefingMeetingLink: z.string().url().max(2000).optional(),
  hasBriefing: z.boolean().optional(),
  briefingCompulsory: z.boolean().optional(),
  specialConditions: z.string().max(5000).optional(),
});

// ============================================================================
// User Management Schemas
// ============================================================================

/**
 * User list query params
 */
export const userListSchema = paginationSchema.merge(searchSchema).merge(sortSchema).extend({
  role: z.enum(['user', 'admin', 'all']).optional(),
  status: z.enum(['active', 'inactive', 'all']).optional(),
});

/**
 * User creation
 */
export const userCreateSchema = z.object({
  email: emailSchema,
  password: z.string().min(12).max(100),
  name: z.string().min(1).max(255).trim().optional(),
  role: z.enum(['user', 'admin']).default('user'),
});

/**
 * User update
 */
export const userUpdateSchema = z.object({
  email: emailSchema.optional(),
  name: z.string().min(1).max(255).trim().optional(),
  role: z.enum(['user', 'admin']).optional(),
  active: z.boolean().optional(),
});

// ============================================================================
// Job Management Schemas
// ============================================================================

/**
 * Job list query params
 */
export const jobListSchema = paginationSchema.merge(dateRangeSchema).merge(sortSchema).extend({
  type: z.enum(['DELTA_SYNC', 'FULL_SYNC', 'ENRICHMENT', 'IMPORT', 'all']).optional(),
  status: z.enum(['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED', 'all']).optional(),
});

/**
 * Sync job params
 */
export const syncJobSchema = z.object({
  mode: z.enum(['daily', 'backfill', 'comprehensive']).default('daily'),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  windowDays: z.coerce.number().int().min(1).max(31).optional(),
  batchPages: z.coerce.number().int().min(1).max(10).optional(),
  pageSize: z.coerce.number().int().min(1).max(15000).optional(),
  requireEnrichment: z.enum(['0', '1', 'true', 'false']).optional(),
  incremental: z.enum(['0', '1', 'true', 'false']).optional(),
  enforceWindow: z.enum(['0', '1', 'true', 'false']).optional(),
});

/**
 * Enrichment job params
 */
export const enrichmentJobSchema = z.object({
  maxRecords: z.coerce.number().int().min(1).max(10000).optional(),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  force: z.boolean().optional(),
});

// ============================================================================
// Analytics Schemas
// ============================================================================

/**
 * Analytics query params
 */
export const analyticsSchema = dateRangeSchema.merge(sortSchema).extend({
  groupBy: z.enum(['day', 'week', 'month', 'category', 'province']).optional(),
  metric: z.enum(['searches', 'views', 'errors', 'performance']).optional(),
  limit: z.coerce.number().int().min(1).max(1000).default(100),
});

/**
 * Search analytics
 */
export const searchAnalyticsSchema = paginationSchema.merge(dateRangeSchema).extend({
  minCount: z.coerce.number().int().min(1).optional(),
});

/**
 * Error analytics
 */
export const errorAnalyticsSchema = paginationSchema.merge(dateRangeSchema).merge(sortSchema).extend({
  errorType: z.string().max(100).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
});

// ============================================================================
// Alert Management Schemas
// ============================================================================

/**
 * Alert list query params
 */
export const alertListSchema = paginationSchema.merge(dateRangeSchema).merge(sortSchema).extend({
  status: z.enum(['active', 'inactive', 'all']).optional(),
  userId: uuidSchema.optional(),
});

/**
 * Alert creation/update
 */
export const alertSchema = z.object({
  keywords: z.array(z.string().min(1).max(200)).min(1).max(50),
  categories: z.array(z.string().max(200)).max(50).optional(),
  provinces: z.array(z.string().max(100)).max(10).optional(),
  minValue: z.number().positive().optional(),
  maxValue: z.number().positive().optional(),
  frequency: z.enum(['instant', 'daily', 'weekly']).default('daily'),
  active: z.boolean().default(true),
});

// ============================================================================
// Feedback Management Schemas
// ============================================================================

/**
 * Feedback list query params
 */
export const feedbackListSchema = paginationSchema.merge(dateRangeSchema).merge(sortSchema).extend({
  type: z.enum(['bug', 'feature', 'general', 'all']).optional(),
  status: z.enum(['new', 'in_progress', 'resolved', 'closed', 'all']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
});

/**
 * Feedback update
 */
export const feedbackUpdateSchema = z.object({
  status: z.enum(['new', 'in_progress', 'resolved', 'closed']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  adminNotes: z.string().max(5000).optional(),
  assignedTo: uuidSchema.optional(),
});

// ============================================================================
// Mail Management Schemas
// ============================================================================

/**
 * Mail test params
 */
export const mailTestSchema = z.object({
  to: emailSchema,
  template: z.enum(['welcome', 'alert', 'digest', 'password-reset']),
  data: z.record(z.string(), z.any()).optional(),
});

/**
 * Mail template update
 */
export const mailTemplateSchema = z.object({
  subject: z.string().min(1).max(500).trim(),
  body: z.string().min(1).max(50000),
  variables: z.array(z.string()).optional(),
});

// ============================================================================
// Audit Log Schemas
// ============================================================================

/**
 * Audit log query params
 */
export const auditLogSchema = paginationSchema.merge(dateRangeSchema).merge(sortSchema).extend({
  userId: uuidSchema.optional(),
  action: z.enum(['CREATE', 'UPDATE', 'DELETE', 'VIEW', 'all']).optional(),
  entity: z.string().max(100).optional(),
  entityId: z.string().max(500).optional(),
});

// ============================================================================
// Configuration Schemas
// ============================================================================

/**
 * Platform config update
 */
export const configUpdateSchema = z.object({
  maintenanceMode: z.boolean().optional(),
  maintenanceMessage: z.string().max(1000).optional(),
  alertsEnabled: z.boolean().optional(),
  enrichmentEnabled: z.boolean().optional(),
  maxEnrichmentPerRun: z.number().int().min(1).max(10000).optional(),
  syncFrequency: z.number().int().min(1).max(1440).optional(), // minutes
  features: z.record(z.string(), z.boolean()).optional(),
});

// ============================================================================
// Buyer Management Schemas
// ============================================================================

/**
 * Buyer list query params
 */
export const buyerListSchema = paginationSchema.merge(searchSchema).merge(sortSchema).extend({
  province: z.string().max(100).optional(),
  type: z.string().max(100).optional(),
  hasContact: z.boolean().optional(),
});

// ============================================================================
// Document Management Schemas
// ============================================================================

/**
 * Document query params
 */
export const documentListSchema = paginationSchema.merge(dateRangeSchema).merge(sortSchema).extend({
  ocid: ocidSchema.optional(),
  format: z.string().max(50).optional(),
  hasUrl: z.boolean().optional(),
});

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Safely parse and validate query parameters
 */
export function validateQueryParams<T extends z.ZodType>(
  schema: T,
  params: URLSearchParams
): z.infer<T> {
  const obj: Record<string, string | string[]> = {};

  params.forEach((value, key) => {
    if (obj[key]) {
      // Handle duplicate keys (convert to array)
      if (Array.isArray(obj[key])) {
        (obj[key] as string[]).push(value);
      } else {
        obj[key] = [obj[key] as string, value];
      }
    } else {
      obj[key] = value;
    }
  });

  return schema.parse(obj);
}

/**
 * Safely parse and validate request body
 */
export async function validateRequestBody<T extends z.ZodType>(
  schema: T,
  request: Request
): Promise<z.infer<T>> {
  const body = await request.json();
  return schema.parse(body);
}

/**
 * Create validation error response
 */
export function validationErrorResponse(error: z.ZodError) {
  return {
    error: 'Validation failed',
    details: error.issues.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
    })),
  };
}
