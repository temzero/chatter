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

// export const lightWallpaperOptions: WallpaperOption[] = [
//   {
//     id: null,
//     name: "None",
//     type: WallpaperType.DEFAULT,
//     background: "transparent",
//   },
//   {
//     id: "gradient_light_gray",
//     name: "Gradient Light Gray",
//     type: WallpaperType.GRADIENT,
//     background: "linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)",
//   },
//   {
//     id: "solid_light_lavender",
//     name: "Light Lavender",
//     type: WallpaperType.SOLID,
//     background: "#f4f0ff",
//   },

//   // 🌤️ LIGHT THEME GRADIENTS

// // 🔴 RED
// {
//   id: "red_blush_light",
//   name: "Red Blush",
//   type: WallpaperType.GRADIENT,
//   background: "linear-gradient(135deg, #ffe5e5 0%, #ffb3b3 100%)",
// },
// {
//   id: "red_rose_light",
//   name: "Soft Rose",
//   type: WallpaperType.GRADIENT,
//   background: "linear-gradient(135deg, #ffd6d6 0%, #ff9a9a 100%)",
// },
// {
//   id: "red_coral_light",
//   name: "Coral Light",
//   type: WallpaperType.GRADIENT,
//   background: "linear-gradient(135deg, #ffc2c2 0%, #ff8585 100%)",
// },

// // 🟠 ORANGE
// {
//   id: "orange_peach_light",
//   name: "Peach Glow",
//   type: WallpaperType.GRADIENT,
//   background: "linear-gradient(135deg, #fff1e0 0%, #ffd1a3 100%)",
// },
// {
//   id: "orange_apricot_light",
//   name: "Apricot Light",
//   type: WallpaperType.GRADIENT,
//   background: "linear-gradient(135deg, #ffe8cc 0%, #ffbf80 100%)",
// },
// {
//   id: "orange_mango_light",
//   name: "Mango Soft",
//   type: WallpaperType.GRADIENT,
//   background: "linear-gradient(135deg, #ffddb3 0%, #ffa94d 100%)",
// },

// // 🟡 YELLOW
// {
//   id: "yellow_sunlight",
//   name: "Sunlight",
//   type: WallpaperType.GRADIENT,
//   background: "linear-gradient(135deg, #fff9db 0%, #ffe066 100%)",
// },
// {
//   id: "yellow_butter_light",
//   name: "Butter Glow",
//   type: WallpaperType.GRADIENT,
//   background: "linear-gradient(135deg, #fff3bf 0%, #ffd43b 100%)",
// },
// {
//   id: "yellow_gold_light",
//   name: "Soft Gold",
//   type: WallpaperType.GRADIENT,
//   background: "linear-gradient(135deg, #ffec99 0%, #fcc419 100%)",
// },

// // 🟢 GREEN
// {
//   id: "green_mint_light",
//   name: "Mint Breeze",
//   type: WallpaperType.GRADIENT,
//   background: "linear-gradient(135deg, #e6fcf5 0%, #96f2d7 100%)",
// },
// {
//   id: "green_sage_light",
//   name: "Sage Light",
//   type: WallpaperType.GRADIENT,
//   background: "linear-gradient(135deg, #ebfbee 0%, #b2f2bb 100%)",
// },
// {
//   id: "green_lime_light",
//   name: "Lime Soft",
//   type: WallpaperType.GRADIENT,
//   background: "linear-gradient(135deg, #f4fce3 0%, #d8f5a2 100%)",
// },

// // 🔵 BLUE
// {
//   id: "blue_sky_light",
//   name: "Sky Blue",
//   type: WallpaperType.GRADIENT,
//   background: "linear-gradient(135deg, #e7f5ff 0%, #a5d8ff 100%)",
// },
// {
//   id: "blue_ice_light",
//   name: "Ice Blue",
//   type: WallpaperType.GRADIENT,
//   background: "linear-gradient(135deg, #edf2ff 0%, #bac8ff 100%)",
// },
// {
//   id: "blue_ocean_light",
//   name: "Ocean Mist",
//   type: WallpaperType.GRADIENT,
//   background: "linear-gradient(135deg, #e3fafc 0%, #99e9f2 100%)",
// },

// // 🟣 INDIGO
// {
//   id: "indigo_dawn_light",
//   name: "Indigo Dawn",
//   type: WallpaperType.GRADIENT,
//   background: "linear-gradient(135deg, #f3f0ff 0%, #d0bfff 100%)",
// },
// {
//   id: "indigo_lavender_light",
//   name: "Lavender Indigo",
//   type: WallpaperType.GRADIENT,
//   background: "linear-gradient(135deg, #ede9fe 0%, #c4b5fd 100%)",
// },
// {
//   id: "indigo_soft_light",
//   name: "Soft Indigo",
//   type: WallpaperType.GRADIENT,
//   background: "linear-gradient(135deg, #e5dbff 0%, #b197fc 100%)",
// },

// // 🟪 VIOLET
// {
//   id: "violet_lilac_light",
//   name: "Lilac Glow",
//   type: WallpaperType.GRADIENT,
//   background: "linear-gradient(135deg, #f8f0fc 0%, #eebefa 100%)",
// },
// {
//   id: "violet_orchid_light",
//   name: "Orchid Light",
//   type: WallpaperType.GRADIENT,
//   background: "linear-gradient(135deg, #f3e8ff 0%, #d8b4fe 100%)",
// },
// {
//   id: "violet_plum_light",
//   name: "Plum Soft",
//   type: WallpaperType.GRADIENT,
//   background: "linear-gradient(135deg, #ede7f6 0%, #b39ddb 100%)",
// },

// // 💗 PINK
// {
//   id: "pink_cotton_light",
//   name: "Cotton Candy",
//   type: WallpaperType.GRADIENT,
//   background: "linear-gradient(135deg, #fff0f6 0%, #ffb3d9 100%)",
// },
// {
//   id: "pink_sakura_light",
//   name: "Sakura Light",
//   type: WallpaperType.GRADIENT,
//   background: "linear-gradient(135deg, #ffe3ec 0%, #ffa8c5 100%)",
// },
// {
//   id: "pink_blush_light",
//   name: "Pink Blush",
//   type: WallpaperType.GRADIENT,
//   background: "linear-gradient(135deg, #ffd6e8 0%, #f783ac 100%)",
// },

//   {
//     id: "image_light_sky",
//     name: "Sky Background",
//     type: WallpaperType.IMAGE,
//     background: LightSkyWallpaper,
//     backgroundSize: "cover",
//     backgroundPosition: "center",
//   },
// ];

export const lightWallpaperOptions: WallpaperOption[] = [
  {
    id: null,
    name: "None",
    type: WallpaperType.DEFAULT,
    background: "transparent",
  },

  /* ===== SOLID ===== */
  {
    id: "solid_light_cloud",
    name: "Cloud White",
    type: WallpaperType.SOLID,
    background: "#f8f9fa",
  },
  {
    id: "gradient_light_sky",
    name: "Gradient Sky",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)",
  },

  /* ===== GRADIENTS ===== */
  // 🔴 RED
  {
    id: "red_light_rose",
    name: "Light Rose Red",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #ffe5e5 0%, #ffcccc 100%)",
  },
  {
    id: "red_salmon",
    name: "Salmon Red",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #ffcccc 0%, #ff9999 100%)",
  },
  {
    id: "red_crimson_light",
    name: "Light Crimson",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #ff9999 0%, #ff6666 100%)",
  },

  // 🟠 ORANGE
  {
    id: "orange_peach",
    name: "Peach Cream",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #fff0e6 0%, #ffe4cc 100%)",
  },
  {
    id: "orange_apricot",
    name: "Apricot Glow",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #ffd8b1 0%, #ffc085 100%)",
  },
  {
    id: "orange_sunset",
    name: "Sunset Orange",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #ffb366 0%, #ff9933 100%)",
  },

  // 🟡 GOLD
  {
    id: "gold_light",
    name: "Light Gold",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)",
  },
  {
    id: "gold_warm",
    name: "Warm Gold",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #ffecb3 0%, #ffe082 100%)",
  },
  {
    id: "gold_rich",
    name: "Rich Gold",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #ffe082 0%, #ffd54f 100%)",
  },

  // 🟢 GREEN
  {
    id: "green_mint",
    name: "Mint Fresh",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)",
  },
  {
    id: "green_spring",
    name: "Spring Green",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #c8e6c9 0%, #a5d6a7 100%)",
  },
  {
    id: "green_meadow",
    name: "Meadow Green",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #a5d6a7 0%, #81c784 100%)",
  },

  // 🔵 BLUE
  {
    id: "blue_sky",
    name: "Clear Sky",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
  },
  {
    id: "blue_ocean",
    name: "Ocean Breeze",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #bbdefb 0%, #90caf9 100%)",
  },
  {
    id: "blue_azure",
    name: "Azure Blue",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #90caf9 0%, #64b5f6 100%)",
  },

  // 🟪 VIOLET
  {
    id: "violet_lavender",
    name: "Lavender Mist",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)",
  },
  {
    id: "violet_iris",
    name: "Iris Bloom",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #e1bee7 0%, #ce93d8 100%)",
  },
  {
    id: "violet_amethyst",
    name: "Amethyst Glow",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #ce93d8 0%, #ba68c8 100%)",
  },

  // 💗 PINK
  {
    id: "pink_cotton",
    name: "Cotton Candy",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%)",
  },
  {
    id: "pink_blossom",
    name: "Cherry Blossom",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #f8bbd9 0%, #f48fb1 100%)",
  },
  {
    id: "pink_rose",
    name: "Rose Petal",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #f48fb1 0%, #f06292 100%)",
  },

  /* ===== IMAGE ===== */
  {
    id: "image_light_clouds",
    name: "Cloudy Sky",
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

  /* ===== GRADIENTS ===== */
  // 🔴 RED
  {
    id: "red_glow",
    name: "Red Glow",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #4a1c1c 0%, #2b0f0f 100%)",
  },
  {
    id: "red_crimson",
    name: "Deep Crimson",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #3a1414 0%, #1f0b0b 100%)",
  },
  {
    id: "red_obsidian",
    name: "Obsidian Red",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #220909 0%, #120404 100%)",
  },

  // 🟠 ORANGE
  {
    id: "orange_ember",
    name: "Burning Ember",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #4a2a14 0%, #2b1609 100%)",
  },
  {
    id: "orange_rust",
    name: "Dark Rust",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #3a1f0f 0%, #1f1107 100%)",
  },
  {
    id: "orange_ash",
    name: "Ash Orange",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #241306 0%, #120904 100%)",
  },

  // 🟡 GOLD
  {
    id: "yellow_gold",
    name: "Dark Gold",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #68591F 0%, #1f1607 100%)",
  },
  {
    id: "yellow_amber",
    name: "Amber Night",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #5F471E 0%, #1f1607 100%)",
  },
  {
    id: "yellow_olive",
    name: "Olive Shadow",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #2d210c 0%, #171105 100%)",
  },

  // 🟢 GREEN
  {
    id: "green_fern",
    name: "Fern Green",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #2d5740 0%, #0d1b1e 100%)",
  },
  {
    id: "green_forest",
    name: "Forest Green",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #1b3a2e 0%, #0d1b1e 100%)",
  },
  {
    id: "green_moss",
    name: "Deep Moss",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #142a22 0%, #0a1511 100%)",
  },

  // 🔵 BLUE
  {
    id: "blue_aurora",
    name: "Blue Aurora",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #203a43 0%, #0f2027 100%)",
  },
  {
    id: "blue_midnight",
    name: "Midnight Blue",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #162b3a 0%, #0a141f 100%)",
  },
  {
    id: "blue_void",
    name: "Blue Void",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #0a121a 0%, #04080d 100%)",
  },

  // 🟪 VIOLET
  {
    id: "violet_glow",
    name: "Violet Glow",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #3b1e4a 0%, #24112d 100%)",
  },
  {
    id: "violet_deep",
    name: "Deep Violet",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #2a1435 0%, #150a1b 100%)",
  },
  {
    id: "violet_void",
    name: "Violet Void",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #160a1b 0%, #09040d 100%)",
  },
  // 💗 PINK
  {
    id: "pink_night_glow",
    name: "Pink Night Glow",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #5a1f3c 0%, #2b0f1f 100%)",
  },
  {
    id: "pink_rose_shadow",
    name: "Rose Shadow",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #3b1e2b 0%, #1f0f17 100%)",
  },
  {
    id: "pink_void",
    name: "Pink Void",
    type: WallpaperType.GRADIENT,
    background: "linear-gradient(135deg, #1f0f17 0%, #0d060a 100%)",
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
