export function formatDateTime(time?: Date | string | null): string | null {
  if (!time) return null;

  const date = new Date(time);
  const now = new Date();

  const isSameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };

  const dateOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short", // or "2-digit" if you prefer
    day: "numeric",
  };

  if (isSameDay) {
    return date.toLocaleTimeString(undefined, timeOptions);
  } else {
    return `${date.toLocaleDateString(
      undefined,
      dateOptions
    )} ${date.toLocaleTimeString(undefined, timeOptions)}`;
  }
}
