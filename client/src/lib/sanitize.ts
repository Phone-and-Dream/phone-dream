/**
 * Utility functions for sanitizing user-generated content
 * Removes personal contact information for safety
 */

// Phone number patterns (various formats)
const PHONE_PATTERNS = [
  /\+?\d{1,4}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g, // International formats
  /\(\d{3}\)\s*\d{3}[-.\s]?\d{4}/g, // (123) 456-7890
  /\d{3}[-.\s]\d{3}[-.\s]\d{4}/g, // 123-456-7890
  /\d{10,11}/g, // 1234567890
  /0\d{10}/g, // Nigerian format: 08012345678
];

// Email pattern
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

// Social media handle patterns
const SOCIAL_PATTERNS = [
  /@[a-zA-Z0-9_]{1,30}/g, // Twitter/Instagram handles
  /(?:twitter|instagram|facebook|linkedin|tiktok)\.com\/[a-zA-Z0-9_.-]+/gi, // Profile URLs
  /(?:wa\.me|whatsapp\.com)\/\d+/gi, // WhatsApp links
  /t\.me\/[a-zA-Z0-9_]+/gi, // Telegram links
];

/**
 * Strips phone numbers from text
 */
export function stripPhoneNumbers(text: string): string {
  let result = text;
  for (const pattern of PHONE_PATTERNS) {
    result = result.replace(pattern, '[phone removed]');
  }
  return result;
}

/**
 * Strips email addresses from text
 */
export function stripEmails(text: string): string {
  return text.replace(EMAIL_PATTERN, '[email removed]');
}

/**
 * Strips social media handles and links from text
 */
export function stripSocialHandles(text: string): string {
  let result = text;
  for (const pattern of SOCIAL_PATTERNS) {
    result = result.replace(pattern, '[social removed]');
  }
  return result;
}

/**
 * Fully sanitizes a story/text by removing all personal contact information
 */
export function sanitizeStory(text: string): string {
  if (!text) return '';
  
  let result = text;
  result = stripPhoneNumbers(result);
  result = stripEmails(result);
  result = stripSocialHandles(result);
  
  // Clean up multiple [removed] tags in a row
  result = result.replace(/(\[(?:phone|email|social) removed\]\s*)+/g, '[contact info removed] ');
  
  return result.trim();
}

/**
 * Truncates text to a specified word count with optional "read more" indicator
 */
export function truncateToWords(text: string, maxWords: number): { truncated: string; isTruncated: boolean } {
  if (!text) return { truncated: '', isTruncated: false };
  
  const words = text.split(/\s+/);
  if (words.length <= maxWords) {
    return { truncated: text, isTruncated: false };
  }
  
  const truncated = words.slice(0, maxWords).join(' ');
  return { truncated: truncated + '...', isTruncated: true };
}

/**
 * Count words in a string
 */
export function countWords(text: string): number {
  if (!text || !text.trim()) return 0;
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Format location as State, Country
 */
export function formatLocation(state?: string | null, country?: string | null): string {
  const parts = [state, country].filter(Boolean);
  return parts.join(', ') || 'Location not set';
}
