export function formatTime(time?: Date | null): string | null {
  if (!time) return null;
  const date = new Date(time);
  const options: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };
  return date.toLocaleTimeString(undefined, options);
}
