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
import {
  WallpaperPatternOption,
  wallpaperPatternOptions,
} from "@/common/constants/wallpaperPatternOptions";
import { audioManager, SoundType } from "@/services/audioManager";

interface WallpaperState {
  // Current selections
  lightPatternId: string | null;
  darkPatternId: string | null;

  lightWallpaperId: string | null;
  darkWallpaperId: string | null;

  // Actions
  setPattern: (theme: ResolvedTheme, id: string | null) => void;
  setWallpaper: (theme: ResolvedTheme, id: string | null) => void;

  // Getters
  getWallpaper: (theme: ResolvedTheme) => WallpaperOption;
  getPattern: (theme: ResolvedTheme) => WallpaperPatternOption;
}

export const useWallpaperStore = create<WallpaperState>()(
  persist(
    (set, get) => ({
      lightPatternId: null,
      darkPatternId: null,
      lightWallpaperId: null,
      darkWallpaperId: null,

      setWallpaper: (theme, id) => {
        if (id) {
          audioManager.playSound(SoundType.TAP1);
        }
        if (theme === ResolvedTheme.LIGHT) {
          set({ lightWallpaperId: id });
        } else {
          set({ darkWallpaperId: id });
        }
      },

      setPattern: (theme, id) => {
        if (id) {
          audioManager.playSound(SoundType.TAP2);
        }
        if (theme === ResolvedTheme.LIGHT) {
          set({ lightPatternId: id });
        } else {
          set({ darkPatternId: id });
        }
      },

      getWallpaper: (theme): WallpaperOption => {
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

      getPattern: (theme): WallpaperPatternOption => {
        const state = get();
        const patternId =
          theme === ResolvedTheme.LIGHT
            ? state.lightPatternId
            : state.darkPatternId;

        const pattern = wallpaperPatternOptions.find((w) => w.id === patternId);
        return pattern || wallpaperPatternOptions[0];
      },
    }),
    {
      name: "wallpaper-storage",
      // Only save essential data
      partialize: (state) => ({
        lightPatternId: state.lightPatternId,
        darkPatternId: state.darkPatternId,
        lightWallpaperId: state.lightWallpaperId,
        darkWallpaperId: state.darkWallpaperId,
      }),
    }
  )
);

export const useCurrentPattern = () => {
  const resolvedTheme = useResolvedTheme();
  return useWallpaperStore().getPattern(resolvedTheme);
};

export const useCurrentWallpaper = () => {
  const resolvedTheme = useResolvedTheme();
  return useWallpaperStore().getWallpaper(resolvedTheme);
};
