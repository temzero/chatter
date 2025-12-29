// SidebarSettingsTheme.tsx
import React from "react";
import clsx from "clsx";
import { SidebarMode } from "@/common/enums/sidebarMode";
import { useTranslation } from "react-i18next";
import SidebarLayout from "@/layouts/SidebarLayout";
import { useResolvedTheme, useThemeMode } from "@/stores/themeStore";
import { ResolvedTheme } from "@/shared/types/enums/theme.enum";
import {
  useCurrentWallpaper,
  useWallpaperStore,
} from "@/stores/wallpaperStore";
import { WallpaperType } from "@/shared/types/enums/wallpaper-type.enum";
import ThemeSelectionBar from "@/components/ui/selectionBar/ThemeSelectionBar";
import Wallpaper from "@/components/ui/layout/Wallpaper";

const SidebarSettingsTheme: React.FC = () => {
  const { t } = useTranslation();
  const resolvedTheme = useResolvedTheme();
  const themeMode = useThemeMode();
  const currentWallpaper = useCurrentWallpaper();

  const { setWallpaper, getAllOptions } = useWallpaperStore();
  const { light: lightOptions, dark: darkOptions } = getAllOptions();
  const currentOptions =
    resolvedTheme === ResolvedTheme.LIGHT ? lightOptions : darkOptions;

  const handleWallpaperSelect = (id: string) => {
    setWallpaper(resolvedTheme, id);
  };

  return (
    <SidebarLayout
      title={`${t("settings.theme")}: ${t(
        `settings.theme_mode.${themeMode.toLowerCase()}`
      )}`}
      backLocation={SidebarMode.SETTINGS_THEME}
    >
      {/* ResolvedTheme Selection Bar */}
      <ThemeSelectionBar className="mt-2!" />

      <div className="p-3">
        <div className="space-y-4">
          {/* Preview */}
          <div className="relative p-4 space-y-3 rounded-xl border-2 border-(--border-color) overflow-hidden">
            <div className="w-3/4 h-8 rounded-lg custom-border bg-(--message-color) hover:scale-110 origin-bottom-left transition-all" />
            <div className="w-1/2 h-8 rounded-lg custom-border ml-auto bg-(--primary-green) hover:scale-110 origin-bottom-right transition-all" />
            <div className="w-3/4 h-8 rounded-lg custom-border bg-(--message-color) hover:scale-110 origin-bottom-left transition-all" />

            <Wallpaper
              wallpaper={currentWallpaper}
              className="absolute inset-0 -z-9"
            />
          </div>

          {/* Wallpaper Selection */}
          <div className="grid grid-cols-3 gap-3 overflow-auto">
            {currentOptions.map((wallpaper) => (
              <button
                key={wallpaper.id}
                onClick={() => handleWallpaperSelect(wallpaper.id)}
                className={clsx(
                  "relative aspect-square border-(--border-color) transition-all hover:scale-95 overflow-hidden",
                  currentWallpaper.id === wallpaper.id
                    ? "border-(--primary-green-glow) border-4"
                    : "border-2 hover:border-4",
                  {
                    " rounded-full!": wallpaper.type === WallpaperType.DEFAULT,
                    "rounded-lg!": wallpaper.type !== WallpaperType.DEFAULT,
                  }
                )}
                title={wallpaper.name}
              >
                <Wallpaper
                  wallpaper={wallpaper}
                  className="absolute inset-0 -z-9"
                />
                {wallpaper.type === WallpaperType.DEFAULT && (
                  <div
                    style={{ zIndex: 1 }}
                    className="pointer-events-none absolute inset-0"
                  >
                    <div
                      className={clsx(
                        "absolute top-1/2 left-[-25%] w-[150%] h-0.5 -rotate-45",
                        currentWallpaper.id === wallpaper.id
                          ? "bg-(--primary-green-glow)"
                          : "bg-(--border-color)"
                      )}
                    />
                  </div>
                )}
                {currentWallpaper.id === wallpaper.id && wallpaper.type !== WallpaperType.DEFAULT && (
                  <div className="absolute top-1.5 right-1.5 z-10">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-(--primary-green) shadow-md">
                      <span className="material-symbols-outlined">check</span>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default SidebarSettingsTheme;
