import { WallpaperType } from "@/shared/types/enums/wallpaper-type.enum";
import LightSkyWallpaper from "@/assets/image/backgroundSky.jpg";
import DarkSkyWallpaper from "@/assets/image/backgroundDark.jpg";
import { ResolvedTheme } from "@/shared/types/enums/theme.enum";

export interface WallpaperOption {
  id: string | null;
  name: string;
  type: WallpaperType;
  background: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundRepeat?: string;
}

// Light-specific wallpapers (enhanced to match dark theme variety)
export const lightWallpaperOptions: WallpaperOption[] = [
  {
    id: null,
    name: "None",
    type: WallpaperType.DEFAULT,
    background: "transparent",
  },
  {
    id: "gradient_light_gray",
    name: "Gradient Light Gray",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)",
  },
  {
    id: "solid_light_lavender",
    name: "Light Lavender",
    type: WallpaperType.SOLID,
    background: "#f4f0ff",
  },
  {
    id: "solid_pastel_blue",
    name: "Pastel Blue",
    type: WallpaperType.SOLID,
    background: "#e3f2fd",
  },

  {
    id: "gradient_seafoam",
    name: "Seafoam",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
  },
  {
    id: "gradient_light_forest",
    name: "Light Forest",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #e6f2ef 0%, #cde6d8 100%)",
  },
  {
    id: "gradient_lavender",
    name: "Lavender Mist",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #e6e6ff 0%, #d6c2ff 100%)",
  },
  {
    id: "gradient_light_clouds",
    name: "Soft Clouds",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
  },

  {
    id: "gradient_sky_blush",
    name: "Sky Blush",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
  },

  {
    id: "gradient_mint_fresh",
    name: "Mint Fresh",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)",
  },
  {
    id: "gradient_sunrise",
    name: "Sunrise",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
  },
  {
    id: "gradient_sunshine",
    name: "Golden Sunshine",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
  },
  {
    id: "solid_soft_pink",
    name: "Soft Pink",
    type: WallpaperType.SOLID,
    background: "#fde2e4",
  },
  {
    id: "gradient_pink_blush",
    name: "Pink Blush",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #fbc2eb 0%, #fde2e4 100%)",
  },

  {
    id: "image_light_sky",
    name: "Sky Background",
    type: WallpaperType.IMAGE,
    background: LightSkyWallpaper,
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
];

export const darkWallpaperOptions: WallpaperOption[] = [
  {
    id: null,
    name: "None",
    type: WallpaperType.DEFAULT,
    background: "transparent",
  },

  /* ===== SOLID ===== */
  {
    id: "solid_dark_graphite",
    name: "Dark Graphite",
    type: WallpaperType.SOLID,
    background: "#121212",
  },
  {
    id: "gradient_dark_gray",
    name: "Gradient Dark Gray",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #0f0f0f 0%, #1c1c1c 100%)",
  },
  {
    id: "solid_dark_indigo",
    name: "Dark Indigo",
    type: WallpaperType.SOLID,
    background: "#1a1f36",
  },

  /* ===== GRADIENTS ===== */

  {
    id: "gradient_deep_purple",
    name: "Deep Purple",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #1f1b2e 0%, #2d1f47 100%)",
  },
  {
    id: "gradient_dark_forest",
    name: "Dark Forest",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #0d1b1e 0%, #1b3a2e 100%)",
  },
  {
    id: "gradient_aurora_dark",
    name: "Aurora Dark",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #0f2027 0%, #2c5364 100%)",
  },

  {
    id: "gradient_deep_teal",
    name: "Deep Teal",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #0f2a2e 0%, #174a4f 100%)",
  },
  {
    id: "gradient_midnight_blue",
    name: "Midnight Blue",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #0f2027 0%, #203a43 100%)",
  },
  {
    id: "gradient_molten_red",
    name: "Molten Red",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #2b0f0f 0%, #4a1c1c 100%)",
  },

  {
    id: "gradient_red_blue_dark",
    name: "Crimson → Azure",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #3a0f1a 0%, #0f1e3a 100%)",
  },
  {
    id: "gradient_obsidian_gold",
    name: "Obsidian Gold",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #0b0d10 0%, #2a1f0f 100%)",
  },
  {
    id: "solid_dark_rose",
    name: "Dark Rose",
    type: WallpaperType.SOLID,
    background: "#3b1e2b",
  },
  {
    id: "gradient_dark_pink_glow",
    name: "Pink Night Glow",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #2b0f1f 0%, #5a1f3c 100%)",
  },

  /* ===== IMAGE ===== */
  {
    id: "image_dark_sky",
    name: "Night Sky",
    type: WallpaperType.IMAGE,
    background: DarkSkyWallpaper,
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
];

// Helper function to get combined options for a specific theme
export const getWallpaperOptionsForTheme = (
  theme: ResolvedTheme
): WallpaperOption[] => {
  return theme === ResolvedTheme.LIGHT
    ? lightWallpaperOptions
    : darkWallpaperOptions;
};
