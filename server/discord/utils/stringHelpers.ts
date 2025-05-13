/**
 * Utility function to remove emoji characters from a string
 * @param text The string to remove emojis from
 * @returns The string with emojis removed and whitespace trimmed
 */
export function removeEmojis(text: string): string {
  // Simpler approach for emoji removal that works in NodeJS v16
  return text.replace(/[^\w\s.,\-]/g, '').trim();
}