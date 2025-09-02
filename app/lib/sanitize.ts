export function stripCitations(text: string): string {
  // Remove trailing "Sources:" section (if present)
  let cleaned = text.replace(/\n?Sources?:[\s\S]*$/i, '').trim()
  // Remove footnote markers like [1], [2], ...
  cleaned = cleaned.replace(/\s*\[\d+\]/g, '')
  // Preserve line breaks; only tidy small artifacts
  cleaned = cleaned
    .replace(/[ \t]+\n/g, '\n')  // strip trailing spaces before newlines
    .replace(/\n{3,}/g, '\n\n')  // collapse 3+ newlines to 2
    .trim()
  return cleaned
}
