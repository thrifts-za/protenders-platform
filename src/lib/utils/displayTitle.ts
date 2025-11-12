/**
 * Generate human-readable display titles from OCDS tender data
 * Used for on-the-fly title generation when pre-generated displayTitle is not available
 */

import type { Tender } from '@/types/tender';

const MAX_TITLE_LENGTH = 80; // Reduced to ensure single line on cards
const MAX_BUYER_LENGTH = 30;
const MAX_CATEGORY_LENGTH = 20;

/**
 * Convert ALL-CAPS text to Title Case
 */
function toTitleCase(str: string): string {
  // Check if string is mostly uppercase (>70% uppercase letters)
  const uppercaseCount = (str.match(/[A-Z]/g) || []).length;
  const totalLetters = (str.match(/[a-zA-Z]/g) || []).length;

  if (totalLetters === 0) return str;

  const uppercaseRatio = uppercaseCount / totalLetters;

  // If mostly uppercase, convert to title case
  if (uppercaseRatio > 0.7) {
    return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  }

  return str;
}

/**
 * Generate a human-readable display title for a tender
 * Format: "{Buyer} - {Category}: {Description snippet}"
 */
export function generateDisplayTitle(tender: Tender): string {
  const buyer = toTitleCase(tender.buyer?.name || 'Government Entity');

  // Smart truncation - find last space before limit to avoid cutting mid-word
  let shortBuyer = buyer;
  if (buyer.length > MAX_BUYER_LENGTH) {
    const truncated = buyer.substring(0, MAX_BUYER_LENGTH - 3);
    const lastSpace = truncated.lastIndexOf(' ');
    shortBuyer = lastSpace > 15 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
  }

  // Use detailedCategory if available, otherwise mainProcurementCategory
  let category = '';
  if (tender.detailedCategory) {
    category = toTitleCase(tender.detailedCategory.split(':')[0].trim());
  } else if (tender.tender?.mainProcurementCategory) {
    category = toTitleCase(tender.tender.mainProcurementCategory);
  }

  // Smart truncation for category
  if (category.length > MAX_CATEGORY_LENGTH) {
    const truncated = category.substring(0, MAX_CATEGORY_LENGTH - 3);
    const lastSpace = truncated.lastIndexOf(' ');
    category = lastSpace > 10 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
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

  if (sourceText && sourceText.length > 10 && remainingSpace > 15) {
    let desc = toTitleCase(sourceText)
      .replace(/\s+/g, ' ')
      .trim()
      // Remove common prefixes that don't add value
      .replace(/^(Appointment Of|Provision Of|Supply Of|Supply And|Request For|Tender For)\s+/i, '')
      .replace(/^(The|A|An)\s+/i, '');

    // Extract first sentence if available
    const firstSentenceMatch = desc.match(/^[^.!?]+[.!?]/);
    if (firstSentenceMatch) {
      desc = firstSentenceMatch[0].replace(/[.!?]$/, '').trim();
    }

    // Smart truncation - cut at last space to avoid mid-word breaks
    if (desc.length > remainingSpace) {
      const truncated = desc.substring(0, remainingSpace - 3);
      const lastSpace = truncated.lastIndexOf(' ');
      snippet = lastSpace > 10 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
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
