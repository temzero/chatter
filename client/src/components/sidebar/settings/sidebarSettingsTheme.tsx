// SidebarSettingsTheme.tsx
import React from "react";
import { useTranslation } from "react-i18next";
import { SidebarMode } from "@/common/enums/sidebarMode";
import SidebarLayout from "@/layouts/SidebarLayout";
import { useResolvedTheme, useThemeMode } from "@/stores/themeStore";
import { ResolvedTheme } from "@/shared/types/enums/theme.enum";
import {
  useCurrentWallpaper,
  useCurrentPattern,
  useWallpaperStore,
} from "@/stores/wallpaperStore";
import ThemeSelectionBar from "@/components/ui/selectionBar/ThemeSelectionBar";
import Wallpaper from "@/components/ui/layout/Wallpaper";
import WallpaperPattern from "@/components/ui/layout/WallpaperPattern";
import { wallpaperPatternOptions } from "@/common/constants/wallpaperPatternOptions";
import {
  darkWallpaperOptions,
  lightWallpaperOptions,
} from "@/common/constants/wallpaperOptions";
import { SelectionGrid } from "@/components/ui/ThemeSelectionGrid";

const SidebarSettingsTheme: React.FC = () => {
  const { t } = useTranslation();
  const resolvedTheme = useResolvedTheme();
  const themeMode = useThemeMode();
  const currentWallpaper = useCurrentWallpaper();
  const currentPattern = useCurrentPattern();

  const setWallpaper = useWallpaperStore().setWallpaper;
  const setPattern = useWallpaperStore().setPattern;

  const currentOptions =
    resolvedTheme === ResolvedTheme.LIGHT
      ? lightWallpaperOptions
      : darkWallpaperOptions;

  const handleWallpaperSelect = (id: string | null) => {
    setWallpaper(resolvedTheme, id);
  };

  const handlePatternSelect = (id: string | null) => {
    setPattern(resolvedTheme, id);
  };

  const renderWallpaperBackground = (wallpaper: typeof currentWallpaper) => (
    <Wallpaper wallpaper={wallpaper} className="absolute inset-0 -z-9" />
  );

  const renderPatternBackground = (pattern: typeof currentPattern) =>
    pattern.id !== null && (
      <WallpaperPattern
        pattern={pattern}
        className="absolute inset-0 -z-9"
        opacity={0.8}
      />
    );

  return (
    <SidebarLayout
      title={`${t("settings.theme")}: ${t(
        `settings.theme_mode.${themeMode.toLowerCase()}`
      )}`}
      backLocation={SidebarMode.SETTINGS_THEME}
    >
      <div className="p-3 pb-[250px]!">
        <SelectionGrid
          items={currentOptions}
          selectedId={currentWallpaper.id}
          onSelect={handleWallpaperSelect}
          renderItemBackground={renderWallpaperBackground}
          columns={3}
        />

        <div className="w-full h-px rounded bg-(--border-color) my-6"></div>
        <SelectionGrid
          items={wallpaperPatternOptions}
          selectedId={currentPattern?.id || null}
          onSelect={handlePatternSelect}
          renderItemBackground={renderPatternBackground}
          columns={3}
        />
      </div>

      <div
        style={{ zIndex: 99 }}
        className="absolute bottom-0 left-0 right-0 border-4 border-b-0 border-(--message-color) overflow-hidden space-y-2 rounded-t-4xl shadow-4xl"
      >
        {/* Preview */}
        <div className="p-2">
          <div className="w-3/4 h-10 rounded-full custom-border bg-(--message-color) hover:scale-110 origin-bottom-left transition-all" />
          <div className="w-1/2 h-10 rounded-full custom-border ml-auto bg-(--primary-green) hover:scale-110 origin-bottom-right transition-all mt-2 mb-4" />
          <Wallpaper
            wallpaper={currentWallpaper}
            className="absolute inset-0 -z-9"
          />
          {currentPattern && currentPattern.id !== null && (
            <WallpaperPattern
              pattern={currentPattern}
              className="absolute inset-0 -z-8"
              opacity={0.7}
              blendMode="overlay"
            />
          )}

          <ThemeSelectionBar />
        </div>
      </div>
    </SidebarLayout>
  );
};

export default SidebarSettingsTheme;
