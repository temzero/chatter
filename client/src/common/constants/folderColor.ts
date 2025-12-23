export const COLOR_PRESETS = {
  red: "#FF5252",
  purple: "#E040FB",
  blue: "#536DFE",
  cyan: "#00BCD4",
  green: "#4CAF50",
  lime: "#CDDC39",
  yellow: "#4CAF50",
  orange: "#FF9800",
  default: null,
} as const;

export const COLORS_ARRAY = [
  null,
  "red",
  "purple",
  "blue",
  "cyan",
  "green",
  "lime",
  "yellow",
  "orange",
] as const;

export type ColorPresetName = keyof typeof COLOR_PRESETS;
export type ColorPreset = ColorPresetName | null;

export const getColorFromPreset = (
  color: ColorPreset | string | undefined
): string | null | undefined => {
  if (!color) return null;
  return COLOR_PRESETS[color as ColorPresetName] || null;
};

// Add this utility function
export const getContrastColor = (
  hexColor: string | null
): "black" | "white" => {
  if (!hexColor) return "black"; // Default to black for null/transparent

  // Remove # if present
  const hex = hexColor.replace("#", "");

  // Convert hex to RGB
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? "black" : "white";
};
