/**
 * Utility function to remove emoji characters from a string
 * @param text The string to remove emojis from
 * @returns The string with emojis removed and whitespace trimmed
 */
export function removeEmojis(text: string): string {
  return text.replace(/[\u{1F300}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{1F100}-\u{1F1FF}]|[\u{1F200}-\u{1F2FF}]|[\u{2B00}-\u{2BFF}]|[\u{1F700}-\u{1F77F}]|[\u{1F780}-\u{1F7FF}]|[\u{1F800}-\u{1F8FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]/gu, '').trim();
}