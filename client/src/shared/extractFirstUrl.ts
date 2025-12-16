export function extractFirstUrl(text: string): string | null {
  if (!text) return null;

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = text.match(urlRegex);

  if (!urls || urls.length === 0) return null;

  try {
    // Validate first URL
    return new URL(urls[0]).href;
  } catch {
    return null;
  }
}

export function removeUrlFromText(text: string, url: string): string {
  // Escape special regex chars in URL
  const escapedUrl = url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  return text
    .replace(new RegExp(`\\s*${escapedUrl}\\s*`, "i"), " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}
