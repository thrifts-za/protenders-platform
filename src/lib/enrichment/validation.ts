/**
 * Validation utilities for enrichment data
 */

import { SA_PROVINCES, type SAProvince } from './constants';

/**
 * Validate email format
 */
export function isValidEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  return emailRegex.test(email.trim());
}

/**
 * Validate South African phone number format
 */
export function isValidSAPhone(phone: string | null | undefined): boolean {
  if (!phone) return false;
  // Accepts formats like: +27 11 123 4567, 011 123 4567, 011-123-4567, etc.
  const phoneRegex = /^(\+27|0)[\s-]?\d{2}[\s-]?\d{3}[\s-]?\d{4}$/;
  const cleaned = phone.replace(/\s+/g, ' ').trim();
  return phoneRegex.test(cleaned);
}

/**
 * Validate province name (normalize to standard format)
 */
export function normalizeProvince(province: string | null | undefined): string | null {
  if (!province) return null;
  const normalized = province.trim();
  // Check for exact match
  const match = SA_PROVINCES.find((p) => p.toLowerCase() === normalized.toLowerCase());
  if (match) return match;
  
  // Handle common variations
  if (/kwa[-\s]?zulu[-\s]?natal/i.test(normalized)) {
    return 'KwaZulu-Natal';
  }
  if (/north[-\s]?west/i.test(normalized)) {
    return 'North West';
  }
  if (/free[-\s]?state/i.test(normalized)) {
    return 'Free State';
  }
  
  return normalized; // Return as-is if no match found
}

/**
 * Validate and clean special conditions text
 */
export function validateSpecialConditions(text: string | null | undefined): string | null {
  if (!text) return null;
  const cleaned = text.trim();
  // Remove excessive whitespace
  const normalized = cleaned.replace(/\s{2,}/g, ' ');
  // Minimum length check
  if (normalized.length < 3) return null;
  return normalized;
}

/**
 * Validate briefing date format (attempts to parse)
 */
export function isValidBriefingDate(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  return !isNaN(date.getTime()) && date > new Date('2000-01-01'); // Reasonable date range
}

/**
 * Validate enrichment data before saving
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateEnrichmentData(data: {
  province?: string | null;
  contactEmail?: string | null;
  contactTelephone?: string | null;
  specialConditions?: string | null;
  briefingDate?: string | null;
}): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate email
  if (data.contactEmail && !isValidEmail(data.contactEmail)) {
    warnings.push(`Invalid email format: ${data.contactEmail}`);
  }

  // Validate phone
  if (data.contactTelephone && !isValidSAPhone(data.contactTelephone)) {
    warnings.push(`Invalid phone format: ${data.contactTelephone}`);
  }

  // Validate province
  if (data.province) {
    const normalized = normalizeProvince(data.province);
    if (normalized !== data.province) {
      warnings.push(`Province normalized: ${data.province} -> ${normalized}`);
    }
  }

  // Validate special conditions
  if (data.specialConditions) {
    const validated = validateSpecialConditions(data.specialConditions);
    if (!validated) {
      warnings.push('Special conditions text too short or invalid');
    }
  }

  // Validate briefing date
  if (data.briefingDate && !isValidBriefingDate(data.briefingDate)) {
    warnings.push(`Invalid briefing date format: ${data.briefingDate}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

