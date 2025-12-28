// src/stores/wallpaperStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  lightWallpaperOptions,
  darkWallpaperOptions,
  WallpaperOption,
} from "@/common/constants/wallpaperOptions";
import { Theme } from "./themeStore";

interface WallpaperState {
  // Current selections
  lightWallpaperId: string;
  darkWallpaperId: string;

  // Actions
  setLightWallpaper: (id: string) => void;
  setDarkWallpaper: (id: string) => void;
  setWallpaper: (theme: Theme, id: string) => void;

  // Getters
  getWallpaper: (theme: Theme) => WallpaperOption;
  getAllOptions: () => {
    light: WallpaperOption[];
    dark: WallpaperOption[];
  };
}

export const useWallpaperStore = create<WallpaperState>()(
  persist(
    (set, get) => ({
      lightWallpaperId: "default_light",
      darkWallpaperId: "default_dark",

      setLightWallpaper: (id: string) => {
        set({ lightWallpaperId: id });
      },

      setDarkWallpaper: (id: string) => {
        set({ darkWallpaperId: id });
      },

      setWallpaper: (theme: Theme, id: string) => {
        if (theme === Theme.Light) {
          set({ lightWallpaperId: id });
        } else {
          set({ darkWallpaperId: id });
        }
      },

      getWallpaper: (theme: Theme): WallpaperOption => {
        const state = get();
        const wallpaperId =
          theme === Theme.Light ? state.lightWallpaperId : state.darkWallpaperId;

        const options =
          theme === Theme.Light ? lightWallpaperOptions : darkWallpaperOptions;

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
