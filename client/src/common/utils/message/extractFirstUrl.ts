const extractFirstUrl = (text: string): string | null => {
  const urlRegex =
    /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&//=]*)/gi;
  const urls = text.match(urlRegex);

  if (!urls || urls.length === 0) return null;

  try {
    new URL(urls[0]);
    return urls[0];
  } catch {
    return null;
  }
};

export default extractFirstUrl;
