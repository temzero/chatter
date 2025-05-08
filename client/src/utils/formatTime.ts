export function formatTime(time?: Date | null): string {
  if (!time) return "N/A";
  const date = new Date(time);
  const options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  };
  return date.toLocaleTimeString(undefined, options);
}