// src/stores/wallpaperStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ResolvedTheme } from "@/shared/types/enums/theme.enum";
import {
  lightWallpaperOptions,
  darkWallpaperOptions,
  WallpaperOption,
} from "@/common/constants/wallpaperOptions";
import { useResolvedTheme } from "./themeStore";

interface WallpaperState {
  // Current selections
  lightWallpaperId: string;
  darkWallpaperId: string;

  // Actions
  setLightWallpaper: (id: string) => void;
  setDarkWallpaper: (id: string) => void;
  setWallpaper: (theme: ResolvedTheme, id: string) => void;

  // Getters
  getWallpaper: (theme: ResolvedTheme) => WallpaperOption;
  getAllOptions: () => {
    light: WallpaperOption[];
    dark: WallpaperOption[];
  };
}

export const useWallpaperStore = create<WallpaperState>()(
  persist(
    (set, get) => ({
      lightWallpaperId: "default",
      darkWallpaperId: "default",

      setLightWallpaper: (id: string) => {
        set({ lightWallpaperId: id });
      },

      setDarkWallpaper: (id: string) => {
        set({ darkWallpaperId: id });
      },

      setWallpaper: (theme: ResolvedTheme, id: string) => {
        if (theme === ResolvedTheme.LIGHT) {
          set({ lightWallpaperId: id });
        } else {
          set({ darkWallpaperId: id });
        }
      },

      getWallpaper: (theme: ResolvedTheme): WallpaperOption => {
        const state = get();
        const wallpaperId =
          theme === ResolvedTheme.LIGHT
            ? state.lightWallpaperId
            : state.darkWallpaperId;

        const options =
          theme === ResolvedTheme.LIGHT
            ? lightWallpaperOptions
            : darkWallpaperOptions;

        // Find the wallpaper option
        const wallpaper = options.find((w) => w.id === wallpaperId);

        // Fallback to default if not found
        return wallpaper || options[0];
      },

      getAllOptions: () => ({
        light: lightWallpaperOptions,
        dark: darkWallpaperOptions,
      }),
    }),
    {
      name: "wallpaper-storage",
      // Only save essential data
      partialize: (state) => ({
        lightWallpaperId: state.lightWallpaperId,
        darkWallpaperId: state.darkWallpaperId,
      }),
    }
  )
);

export const useCurrentWallpaper = () => {
  const resolvedTheme = useResolvedTheme();
  return useWallpaperStore().getWallpaper(resolvedTheme);
};
