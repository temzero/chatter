// SidebarSettingsTheme.tsx
import React, { useState } from "react";
import clsx from "clsx";
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
import { useIsMobile } from "@/stores/deviceStore";
import HorizontalSelector, {
  SelectorItem,
} from "@/components/ui/layout/HorizontalSelector";
import { SlidingContainer } from "@/components/ui/layout/SlidingContainer";

enum ThemeTab {
  WALLPAPER = "wallpaper",
  PATTERN = "pattern",
}

const ThemeTabSelector: React.FC<{
  activeTab: ThemeTab;
  onSelectTab: (tab: ThemeTab) => void;
}> = ({ activeTab, onSelectTab }) => {
  const { t } = useTranslation();

  const tabs: SelectorItem[] = [
    {
      id: ThemeTab.WALLPAPER,
      name: t("settings.wallpaper"),
      icon: "image",
    },
    {
      id: ThemeTab.PATTERN,
      name: t("settings.pattern"),
      icon: "texture",
    },
  ];

  const selectedTab = tabs.find((tab) => tab.id === activeTab);

  return (
    <HorizontalSelector
      items={tabs}
      selected={selectedTab!}
      onSelect={(item) => onSelectTab(item.id as ThemeTab)}
      expandFull={true}
    />
  );
};

const WallpaperTab: React.FC<{
  resolvedTheme: ResolvedTheme;
  currentWallpaper: ReturnType<typeof useCurrentWallpaper>;
  onSelect: (id: string | null) => void;
}> = ({ resolvedTheme, currentWallpaper, onSelect }) => {
  const currentOptions =
    resolvedTheme === ResolvedTheme.LIGHT
      ? lightWallpaperOptions
      : darkWallpaperOptions;

  const renderWallpaperBackground = (wallpaper: typeof currentWallpaper) => (
    <Wallpaper wallpaper={wallpaper} className="absolute inset-0 -z-9" />
  );

  return (
    <div className="py-3">
      <SelectionGrid
        items={currentOptions}
        selectedId={currentWallpaper.id}
        onSelect={onSelect}
        renderItemBackground={renderWallpaperBackground}
        columns={3}
      />
    </div>
  );
};

const PatternTab: React.FC<{
  currentPattern: ReturnType<typeof useCurrentPattern>;
  onSelect: (id: string | null) => void;
}> = ({ currentPattern, onSelect }) => {
  const renderPatternBackground = (pattern: typeof currentPattern) =>
    pattern.id !== null && (
      <WallpaperPattern
        pattern={pattern}
        className="absolute inset-0 -z-9"
        opacity={0.8}
      />
    );

  return (
    <div className="py-3">
      <SelectionGrid
        items={wallpaperPatternOptions}
        selectedId={currentPattern?.id || null}
        onSelect={onSelect}
        renderItemBackground={renderPatternBackground}
        columns={3}
      />
    </div>
  );
};

const SidebarSettingsTheme: React.FC = () => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const resolvedTheme = useResolvedTheme();
  const themeMode = useThemeMode();
  const currentWallpaper = useCurrentWallpaper();
  const currentPattern = useCurrentPattern();

  const setWallpaper = useWallpaperStore().setWallpaper;
  const setPattern = useWallpaperStore().setPattern;

  // State for active tab and slide direction
  const [activeTab, setActiveTab] = useState<ThemeTab>(ThemeTab.WALLPAPER);
  const [direction, setDirection] = useState<number>(1);

  const handleTabChange = (newTab: ThemeTab) => {
    const tabs = [ThemeTab.WALLPAPER, ThemeTab.PATTERN];
    const currentIndex = tabs.indexOf(activeTab);
    const newIndex = tabs.indexOf(newTab);

    setDirection(newIndex > currentIndex ? 1 : -1);
    setActiveTab(newTab);
  };

  const handleWallpaperSelect = (id: string | null) => {
    setWallpaper(resolvedTheme, id);
  };

  const handlePatternSelect = (id: string | null) => {
    setPattern(resolvedTheme, id);
  };

  return (
    <SidebarLayout
      title={`${t("settings.theme")}: ${t(
        `settings.theme_mode.${themeMode.toLowerCase()}`
      )}`}
      backLocation={SidebarMode.SETTINGS}
    >
      <div className="flex flex-col h-full">
        {/* Tabs header */}
        <ThemeTabSelector activeTab={activeTab} onSelectTab={handleTabChange} />

        {/* Content area with sliding animation */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto relative pb-[200px]">
          <SlidingContainer
            direction={direction}
            uniqueKey={activeTab}
            className="px-3"
          >
            {activeTab === ThemeTab.WALLPAPER ? (
              <WallpaperTab
                resolvedTheme={resolvedTheme}
                currentWallpaper={currentWallpaper}
                onSelect={handleWallpaperSelect}
              />
            ) : (
              <PatternTab
                currentPattern={currentPattern}
                onSelect={handlePatternSelect}
              />
            )}
          </SlidingContainer>
        </div>

        {/* Preview section */}
        <div
          style={{ zIndex: 99 }}
          className={clsx(
            "fixed bottom-0 left-0 right-0 p-2",
            "overflow-hidden space-y-2",
            "rounded-t-4xl",
            {
              "border-4 border-b-0 border-(--border-color) bg-(--background-color) shadow-4xl":
                isMobile,
            }
          )}
        >
          {isMobile && (
            <div className="p-2">
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
              <div className="w-3/4 h-8 rounded-lg custom-border bg-(--message-color) hover:scale-110 origin-bottom-left transition-all" />
              <div className="w-1/2 h-8 rounded-lg custom-border ml-auto bg-(--primary-green) hover:scale-110 origin-bottom-right transition-all mt-2" />
            </div>
          )}

          <ThemeSelectionBar />
        </div>
      </div>
    </SidebarLayout>
  );
};

export default SidebarSettingsTheme;
