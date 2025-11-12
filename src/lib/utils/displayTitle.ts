/**
 * Generate human-readable display titles from OCDS tender data
 * Used for on-the-fly title generation when pre-generated displayTitle is not available
 */

import type { Tender } from '@/types/tender';

const MAX_TITLE_LENGTH = 100;
const MAX_BUYER_LENGTH = 35;
const MAX_CATEGORY_LENGTH = 25;

/**
 * Generate a human-readable display title for a tender
 * Format: "{Buyer} - {Category}: {Description snippet}"
 */
export function generateDisplayTitle(tender: Tender): string {
  const buyer = tender.buyer?.name || 'Government Entity';
  const shortBuyer = buyer.length > MAX_BUYER_LENGTH
    ? buyer.substring(0, MAX_BUYER_LENGTH - 3) + '...'
    : buyer;

  // Use detailedCategory if available, otherwise mainProcurementCategory
  let category = '';
  if (tender.detailedCategory) {
    category = tender.detailedCategory.split(':')[0].trim();
  } else if (tender.tender?.mainProcurementCategory) {
    category = tender.tender.mainProcurementCategory;
  }

  if (category.length > MAX_CATEGORY_LENGTH) {
    category = category.substring(0, MAX_CATEGORY_LENGTH - 3) + '...';
  }

  // Calculate remaining space for description
  const baseLength = shortBuyer.length + (category ? ` - ${category}: `.length : ` - `.length);
  const remainingSpace = MAX_TITLE_LENGTH - baseLength;

  // Extract meaningful description snippet
  let snippet = '';
  const rawTitle = tender.tender?.title || '';
  const rawDescription = tender.tender?.description || '';

  // Prefer description over title if it's more meaningful
  const sourceText = rawDescription && rawDescription.length > 10 ? rawDescription : rawTitle;

  if (sourceText && sourceText.length > 10 && remainingSpace > 20) {
    let desc = sourceText
      .replace(/\s+/g, ' ')
      .trim()
      // Remove common prefixes that don't add value
      .replace(/^(appointment of|provision of|supply of|supply and|request for|tender for)\s+/i, '')
      .replace(/^(the|a|an)\s+/i, '');

    // Extract first sentence if available
    const firstSentenceMatch = desc.match(/^[^.!?]+[.!?]/);
    if (firstSentenceMatch) {
      desc = firstSentenceMatch[0].replace(/[.!?]$/, '').trim();
    }

    // Truncate to fit remaining space
    if (desc.length > remainingSpace) {
      snippet = desc.substring(0, remainingSpace - 3) + '...';
    } else {
      snippet = desc;
    }
  }

  // Build final title
  let finalTitle = '';
  if (!category) {
    finalTitle = shortBuyer;
  } else if (!snippet || snippet.length < 10) {
    finalTitle = `${shortBuyer} - ${category}`;
  } else {
    finalTitle = `${shortBuyer} - ${category}: ${snippet}`;
  }

  // Final safety check
  if (finalTitle.length > MAX_TITLE_LENGTH) {
    finalTitle = finalTitle.substring(0, MAX_TITLE_LENGTH - 3) + '...';
  }

  return finalTitle;
}

/**
 * Check if a title looks like a technical reference (e.g., "RFP/2021/001311")
 */
export function isTechnicalReference(title: string): boolean {
  if (!title || title.length < 3) return false;

  // Check for patterns like: RFP/..., RFQ/..., RFB/..., etc.
  const hasReferencePrefix = /^(RFP|RFQ|RFB|RFT|RFI|RFA|RFPQ|RFBQ|EOI|OLT|BID|TENDER|CONTRACT)[-_/:\s]/i.test(title);

  // Check if title is mostly uppercase letters, numbers, and separators
  const hasReferencePattern = /^[A-Z0-9\s\-_/:\.]{5,}$/i.test(title);

  // If title is short and matches reference patterns, it's likely technical
  return (hasReferencePrefix || hasReferencePattern) && title.length < 50;
}
