import { WallpaperType } from "@/shared/types/enums/wallpaper-type.enum";
import LightSkyWallpaper from "@/assets/image/backgroundSky.jpg";
import DarkSkyWallpaper from "@/assets/image/backgroundDark.jpg";
import { ResolvedTheme } from "@/shared/types/enums/theme.enum";

export interface WallpaperOption {
  id: string;
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
    id: "default",
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
    id: "gradient_light_clouds",
    name: "Soft Clouds",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
  },
  {
    id: "gradient_sunrise",
    name: "Sunrise",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
  },
  {
    id: "gradient_mint_fresh",
    name: "Mint Fresh",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)",
  },
  {
    id: "gradient_lavender",
    name: "Lavender Mist",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #e6e6ff 0%, #d6c2ff 100%)",
  },
  {
    id: "gradient_cotton_candy",
    name: "Cotton Candy",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)",
  },
  {
    id: "gradient_sunshine",
    name: "Golden Sunshine",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
  },
  {
    id: "gradient_seafoam",
    name: "Seafoam",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
  },
  {
    id: "solid_pastel_blue",
    name: "Pastel Blue",
    type: WallpaperType.SOLID,
    background: "#e3f2fd",
  },
  {
    id: "solid_ivory",
    name: "Ivory",
    type: WallpaperType.SOLID,
    background: "#fffff0",
  },
  {
    id: "solid_light_lavender",
    name: "Light Lavender",
    type: WallpaperType.SOLID,
    background: "#f4f0ff",
  },
  {
    id: "pattern_light_dots",
    name: "Light Dots",
    type: WallpaperType.PATTERN,
    background: `
      radial-gradient(circle at 2px 2px, #cccccc 2px, transparent 2px),
      linear-gradient(to bottom, #f8f8f8, #f8f8f8)
    `,
    backgroundSize: "32px 32px, auto",
    backgroundPosition: "0 0, 0 0",
    backgroundRepeat: "repeat",
  },
  {
    id: "pattern_subtle_lines_light",
    name: "Subtle Lines",
    type: WallpaperType.PATTERN,
    background: `
      linear-gradient(to bottom, 
        transparent 39px,
        rgba(200, 200, 200, 0.3) 40px
      )
    `,
    backgroundSize: "100% 40px",
    backgroundPosition: "0 0",
    backgroundRepeat: "repeat",
  },
  {
    id: "pattern_diagonal_stripes_light",
    name: "Diagonal Stripes",
    type: WallpaperType.PATTERN,
    background: `
      repeating-linear-gradient(
        45deg,
        #f0f0f0,
        #f0f0f0 10px,
        #ffffff 10px,
        #ffffff 20px
      )
    `,
    backgroundSize: "auto auto",
    backgroundRepeat: "repeat",
  },
  {
    id: "pattern_carbon_fiber_light",
    name: "Carbon Fiber",
    type: WallpaperType.PATTERN,
    background: `
    linear-gradient(45deg, #f5f5f5 25%, transparent 25%, transparent 75%, #f5f5f5 75%),
    linear-gradient(45deg, #f5f5f5 25%, transparent 25%, transparent 75%, #f5f5f5 75%)
  `,
    backgroundSize: "50px 50px, 50px 50px",
    backgroundPosition: "0 0, 25px 25px",
    backgroundRepeat: "repeat",
  },
  {
    id: "pattern_isometric_grid_light",
    name: "Isometric Grid Light",
    type: WallpaperType.PATTERN,
    background: `
      linear-gradient(30deg, #e0e0e0 12.5%, transparent 12.5%, transparent 87.5%, #e0e0e0 87.5%),
      linear-gradient(150deg, #e0e0e0 12.5%, transparent 12.5%, transparent 87.5%, #e0e0e0 87.5%),
      linear-gradient(30deg, #e0e0e0 12.5%, transparent 12.5%, transparent 87.5%, #e0e0e0 87.5%),
      linear-gradient(150deg, #e0e0e0 12.5%, transparent 12.5%, transparent 87.5%, #e0e0e0 87.5%),
      linear-gradient(60deg, #f0f0f0 25%, transparent 25%, transparent 75%, #f0f0f0 75%)
    `,
    backgroundSize: "80px 140px",
    backgroundPosition: "0 0, 0 0, 40px 70px, 40px 70px, 0 0",
    backgroundRepeat: "repeat",
  },
  {
    id: "pattern_chevron_light",
    name: "Chevron Light",
    type: WallpaperType.PATTERN,
    background: `
      linear-gradient(45deg, #e0e0e0 25%, transparent 25%, transparent 75%, #e0e0e0 75%),
      linear-gradient(-45deg, #e0e0e0 25%, transparent 25%, transparent 75%, #e0e0e0 75%)
    `,
    backgroundSize: "40px 40px",
    backgroundPosition: "0 0, 0 20px",
    backgroundRepeat: "repeat",
  },
  {
    id: "pattern_brushed_metal_light",
    name: "Brushed Metal Light",
    type: WallpaperType.PATTERN,
    background: `
      repeating-linear-gradient(
        0deg,
        rgba(0, 0, 0, 0.05) 0px,
        rgba(0, 0, 0, 0.05) 1px,
        transparent 1px,
        transparent 3px
      ),
      linear-gradient(90deg, #f0f0f0, #ffffff)
    `,
    backgroundSize: "auto, 100% 100%",
    backgroundPosition: "0 0, 0 0",
    backgroundRepeat: "repeat",
  },
  {
    id: "pattern_pinstripes_light",
    name: "Pinstripes Light",
    type: WallpaperType.PATTERN,
    background: `
      repeating-linear-gradient(
        90deg,
        transparent,
        transparent 9px,
        rgba(150, 150, 150, 0.3) 9px,
        rgba(150, 150, 150, 0.3) 10px
      )
    `,
    backgroundSize: "50px 50px",
    backgroundRepeat: "repeat",
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

// Dark-specific wallpapers (optimized for dark theme) - kept as is
export const darkWallpaperOptions: WallpaperOption[] = [
  {
    id: "default",
    name: "None",
    type: WallpaperType.DEFAULT,
    background: "transparent",
  },
  {
    id: "gradient_dark_gray",
    name: "Gradient Dark Gray",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)",
  },
  {
    id: "gradient_night_sky",
    name: "Night Sky",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #0c1e42 0%, #1a1a2e 100%)",
  },
  {
    id: "gradient_deep_purple",
    name: "Deep Purple",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #1a0933 0%, #3a0e47 100%)",
  },
  {
    id: "gradient_dark_forest",
    name: "Dark Forest",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #0d1b1e 0%, #1b3a2e 100%)",
  },
  {
    id: "gradient_dark_forest_red",
    name: "Dark Forest Red",
    type: WallpaperType.GRADIENT,
    background:
      "linear-gradient(135deg, #0d1b1e 0%, #1b2a2e 40%, #3a1414 100%)",
  },
  {
    id: "gradient_dark_crimson",
    name: "Dark Crimson",
    type: WallpaperType.GRADIENT,
    background:
      "linear-gradient(135deg, #120708 0%, #2b0f14 50%, #4a1418 100%)",
  },
  {
    id: "gradient_midnight_blue",
    name: "Midnight Blue",
    type: WallpaperType.GRADIENT,
    background:
      "linear-gradient(135deg, #050b14 0%, #0f1e33 60%, #162b44 100%)",
  },
  {
    id: "gradient_dark_ember",
    name: "Dark Ember",
    type: WallpaperType.GRADIENT,
    background:
      "linear-gradient(135deg, #0b0a08 0%, #1f1a12 45%, #3a2614 100%)",
  },
  {
    id: "pattern_dark_dots",
    name: "Dark Dots",
    type: WallpaperType.PATTERN,
    background: `
      radial-gradient(circle at 2px 2px, #333333 2px, transparent 2px),
      linear-gradient(to bottom, #111111, #111111)
    `,
    backgroundSize: "32px 32px, auto",
    backgroundPosition: "0 0, 0 0",
    backgroundRepeat: "repeat",
  },
  {
    id: "pattern_subtle_lines",
    name: "Subtle Lines",
    type: WallpaperType.PATTERN,
    background: `
      linear-gradient(to bottom, 
        transparent 39px,
        rgba(150, 150, 150, 0.3) 40px
      )
    `,
    backgroundSize: "100% 40px",
    backgroundPosition: "0 0",
    backgroundRepeat: "repeat",
  },
  {
    id: "pattern_diagonal_stripes",
    name: "Diagonal Stripes",
    type: WallpaperType.PATTERN,
    background: `
      repeating-linear-gradient(
        45deg,
        #111111,
        #111111 10px,
        #222222 10px,
        #222222 20px
      )
    `,
    backgroundSize: "auto auto",
    backgroundRepeat: "repeat",
  },
  {
    id: "pattern_carbon_fiber",
    name: "Carbon Fiber",
    type: WallpaperType.PATTERN,
    background: `
    linear-gradient(45deg, #111111 25%, transparent 25%, transparent 75%, #111111 75%),
    linear-gradient(45deg, #111111 25%, transparent 25%, transparent 75%, #111111 75%)
  `,
    backgroundSize: "50px 50px, 50px 50px",
    backgroundPosition: "0 0, 25px 25px",
    backgroundRepeat: "repeat",
  },
  {
    id: "pattern_isometric_grid",
    name: "Isometric Grid",
    type: WallpaperType.PATTERN,
    background: `
      linear-gradient(30deg, #222222 12.5%, transparent 12.5%, transparent 87.5%, #222222 87.5%),
      linear-gradient(150deg, #222222 12.5%, transparent 12.5%, transparent 87.5%, #222222 87.5%),
      linear-gradient(30deg, #222222 12.5%, transparent 12.5%, transparent 87.5%, #222222 87.5%),
      linear-gradient(150deg, #222222 12.5%, transparent 12.5%, transparent 87.5%, #222222 87.5%),
      linear-gradient(60deg, #333333 25%, transparent 25%, transparent 75%, #333333 75%)
    `,
    backgroundSize: "80px 140px",
    backgroundPosition: "0 0, 0 0, 40px 70px, 40px 70px, 0 0",
    backgroundRepeat: "repeat",
  },
  {
    id: "pattern_chevron",
    name: "Chevron",
    type: WallpaperType.PATTERN,
    background: `
      linear-gradient(45deg, #222222 25%, transparent 25%, transparent 75%, #222222 75%),
      linear-gradient(-45deg, #222222 25%, transparent 25%, transparent 75%, #222222 75%)
    `,
    backgroundSize: "40px 40px",
    backgroundPosition: "0 0, 0 20px",
    backgroundRepeat: "repeat",
  },
  {
    id: "pattern_brushed_metal",
    name: "Brushed Metal",
    type: WallpaperType.PATTERN,
    background: `
      repeating-linear-gradient(
        0deg,
        rgba(255, 255, 255, 0.05) 0px,
        rgba(255, 255, 255, 0.05) 1px,
        transparent 1px,
        transparent 3px
      ),
      linear-gradient(90deg, #111111, #222222)
    `,
    backgroundSize: "auto, 100% 100%",
    backgroundPosition: "0 0, 0 0",
    backgroundRepeat: "repeat",
  },
  {
    id: "pattern_pinstripes",
    name: "Pinstripes",
    type: WallpaperType.PATTERN,
    background: `
      repeating-linear-gradient(
        90deg,
        transparent,
        transparent 9px,
        rgba(50, 50, 50, 0.5) 9px,
        rgba(50, 50, 50, 0.5) 10px
      )
    `,
    backgroundSize: "50px 50px",
    backgroundRepeat: "repeat",
  },
  {
    id: "image_dark_night",
    name: "Night Background",
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
