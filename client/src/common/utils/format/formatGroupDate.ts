export const formatGroupDate = (
  dateString: string,
  t: (key: string) => string,
) => {
  if (!dateString) return t("time.today");

  try {
    // Parse to Date object
    const date = parseDateString(dateString);

    if (!date) {
      console.warn(`Invalid date: ${dateString}`);
      return dateString;
    }

    // Check if today or yesterday
    if (isToday(date)) return t("time.today");
    if (isYesterday(date)) return t("time.yesterday");

    // Format as dd/mm/yyyy
    return formatToDDMMYYYY(date);
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
};

// Helper functions
const parseDateString = (dateString: string): Date | null => {
  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  // DD/MM/YYYY or MM/DD/YYYY
  if (dateString.includes("/")) {
    const parts = dateString.split("/").map(Number);
    // If first part > 12, assume DD/MM/YYYY
    if (parts[0] > 12 && parts[0] <= 31) {
      return new Date(parts[2], parts[1] - 1, parts[0]); // DD/MM/YYYY
    }
    return new Date(parts[2], parts[0] - 1, parts[1]); // MM/DD/YYYY
  }

  // Try direct parse
  const parsed = Date.parse(dateString);
  return isNaN(parsed) ? null : new Date(parsed);
};

const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const isYesterday = (date: Date): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  );
};

const formatToDDMMYYYY = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};
