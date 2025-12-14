function extractFirstUrl(text: string): string | null {
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

export default extractFirstUrl;
