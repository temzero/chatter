import { WallpaperType } from "@/shared/types/enums/wallpaper-type.enum";
import { Theme } from "@/stores/themeStore";
import LightSkyWallpaper from "@/assets/image/backgroundSky.jpg";
import DarkSkyWallpaper from "@/assets/image/backgroundDark.jpg";

// Type definitions
export interface WallpaperOption {
  id: string;
  name: string;
  type: WallpaperType;
  value?: string;
  imageUrl?: string;
}

// Light-specific wallpapers (optimized for light theme)
export const lightWallpaperOptions = [
  {
    id: "transparent",
    name: "Transparent",
    type: WallpaperType.DEFAULT,
    value: "transparent",
  },
  {
    id: "gradient_light_gray",
    name: "Gradient light ray",
    type: WallpaperType.GRADIENT,
    value: "linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)",
  },
  {
    id: "light_clouds",
    name: "Clouds",
    type: WallpaperType.GRADIENT,
    value: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
  },
  {
    id: "light_sunrise",
    name: "Sunrise",
    type: WallpaperType.GRADIENT,
    value: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
  },
  {
    id: "light_mint",
    name: "Mint Fresh",
    type: WallpaperType.GRADIENT,
    value: "linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)",
  },
  {
    id: "solid_pastel_blue",
    name: "Pastel Blue",
    type: WallpaperType.SOLID,
    value: "#e3f2fd",
  },
  {
    id: "pattern_light_grid",
    name: "Light Grid",
    type: WallpaperType.PATTERN,
    value: `
      linear-gradient(45deg, #e8e8e8 25%, transparent 25%),
      linear-gradient(-45deg, #e8e8e8 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #e8e8e8 75%),
      linear-gradient(-45deg, transparent 75%, #e8e8e8 75%)
    `,
  },
  {
    id: "pattern_light_dots",
    name: "Light Dots",
    type: WallpaperType.PATTERN,
    value: `radial-gradient(#e0e0e0 1px, transparent 1px)`,
  },
  {
    id: "image_light_sky",
    name: "Sky Background",
    type: WallpaperType.IMAGE,
    imageUrl: LightSkyWallpaper,
  },
];

// Dark-specific wallpapers (optimized for dark theme)
export const darkWallpaperOptions = [
  {
    id: "transparent",
    name: "Transparent",
    type: WallpaperType.DEFAULT,
    value: "transparent",
  },
  {
    id: "gradient_dark_gray",
    name: "Gradient dark gray",
    type: WallpaperType.GRADIENT,
    value: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)",
  },
  {
    id: "dark_night",
    name: "Night Sky",
    type: WallpaperType.GRADIENT,
    value: "linear-gradient(135deg, #0c1e42 0%, #1a1a2e 100%)",
  },
  {
    id: "dark_deep_purple",
    name: "Deep Purple",
    type: WallpaperType.GRADIENT,
    value: "linear-gradient(135deg, #1a0933 0%, #3a0e47 100%)",
  },
  {
    id: "dark_forest",
    name: "Dark Forest",
    type: WallpaperType.GRADIENT,
    value: "linear-gradient(135deg, #0d1b1e 0%, #1b3a2e 100%)",
  },
  {
    id: "solid_navy_blue",
    name: "Navy Blue",
    type: WallpaperType.SOLID,
    value: "#0a1929",
  },
  {
    id: "pattern_dark_grid",
    name: "Dark Grid",
    type: WallpaperType.PATTERN,
    value: `
      linear-gradient(45deg, #222222 25%, transparent 25%),
      linear-gradient(-45deg, #222222 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #222222 75%),
      linear-gradient(-45deg, transparent 75%, #222222 75%)
    `,
  },
  {
    id: "pattern_dark_dots",
    name: "Dark Dots",
    type: WallpaperType.PATTERN,
    value: `radial-gradient(#333333 1px, transparent 1px)`,
  },
  {
    id: "image_dark_night",
    name: "Night Background",
    type: WallpaperType.IMAGE,
    imageUrl: DarkSkyWallpaper,
  },
];

// Helper function to get combined options for a specific theme
export const getWallpaperOptionsForTheme = (
  theme: Theme
): WallpaperOption[] => {
  return theme === Theme.Light ? lightWallpaperOptions : darkWallpaperOptions;
};
