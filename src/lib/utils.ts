import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert text to sentence case
 * - First letter capitalized
 * - Rest in lowercase
 * - Preserves proper nouns and acronyms at sentence start
 * - Handles multiple sentences
 */
export function toSentenceCase(text: string | null | undefined): string {
  if (!text) return '';

  // Trim whitespace
  text = text.trim();

  // Split by sentence endings (. ! ?) followed by space
  const sentences = text.split(/([.!?]\s+)/);

  return sentences.map((part, index) => {
    // If this is a delimiter (. ! ? followed by space), keep it as is
    if (/^[.!?]\s+$/.test(part)) {
      return part;
    }

    // Convert to lowercase first
    let sentence = part.toLowerCase();

    // Capitalize first letter
    if (sentence.length > 0) {
      sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
    }

    return sentence;
  }).join('');
}
