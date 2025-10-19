export function formatDateTime(
  time?: Date | string | null,
  isDateOnly: boolean = false
): string | null {
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
    month: "short", // e.g. Jun
    day: "numeric", // e.g. 30
  };

  if (isDateOnly) {
    // Only show date (no time)
    return date.toLocaleDateString(undefined, dateOptions);
  }

  if (isSameDay) {
    return date.toLocaleTimeString(undefined, timeOptions);
  } else {
    return `${date.toLocaleDateString(
      undefined,
      dateOptions
    )} ${date.toLocaleTimeString(undefined, timeOptions)}`;
  }
}
