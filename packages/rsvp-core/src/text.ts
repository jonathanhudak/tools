/**
 * Split text into an array of words for RSVP display.
 * Filters out empty strings and normalizes whitespace.
 *
 * @param text - The text to split
 * @returns Array of words
 *
 * @example
 * ```ts
 * splitTextIntoWords("Hello world!  How are you?")
 * // ["Hello", "world!", "How", "are", "you?"]
 * ```
 */
export function splitTextIntoWords(text: string): string[] {
  return text
    .split(/\s+/)
    .filter(word => word.length > 0);
}

/**
 * Validate that text is suitable for RSVP reading.
 *
 * @param text - The text to validate
 * @returns Object with validation result and optional error message
 */
export function validateText(text: string): { valid: boolean; error?: string } {
  if (!text || text.trim().length === 0) {
    return { valid: false, error: 'Text cannot be empty' };
  }

  const words = splitTextIntoWords(text);
  if (words.length === 0) {
    return { valid: false, error: 'No valid words found in text' };
  }

  return { valid: true };
}

/**
 * Extract readable text from HTML content.
 * This is a basic implementation - for production use, consider using
 * a library like Readability.js or similar.
 *
 * @param html - HTML string
 * @returns Plain text content
 */
export function extractTextFromHTML(html: string): string {
  // Remove script and style tags
  let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, ' ');

  // Decode HTML entities (basic set)
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");

  // Normalize whitespace
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}
