// SidebarSettingsWallpaper.tsx
import React, { useState, useCallback } from "react";
import { SidebarMode } from "@/common/enums/sidebarMode";
import { useTranslation } from "react-i18next";
import SidebarLayout from "@/layouts/SidebarLayout";
import { useTheme, Theme } from "@/stores/themeStore";
import { useWallpaperStore } from "@/stores/wallpaperStore";
import { WallpaperType } from "@/shared/types/enums/wallpaper-type.enum";
import { WallpaperOption } from "@/common/constants/wallpaperOptions";
import clsx from "clsx";
import { SelectionBar } from "@/components/ui/SelectionBar";
import { SlidingContainer } from "@/components/ui/layout/SlidingContainer";

const themeOptions = [
  {
    id: "light",
    label: "settings.theme_options.light",
    icon: "light_mode",
  },
  {
    id: "dark",
    label: "settings.theme_options.dark",
    icon: "dark_mode",
  },
] as const;

const SidebarSettingsWallpaper: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { setWallpaper, getWallpaper, getAllOptions } = useWallpaperStore();

  const [activeIndex, setActiveIndex] = useState<number>(
    theme === "light" ? 0 : 1
  );
  const [direction, setDirection] = useState<1 | -1>(1);

  const { light: lightOptions, dark: darkOptions } = getAllOptions();
  const currentTheme = themeOptions[activeIndex].id as Theme;
  const currentOptions = currentTheme === "light" ? lightOptions : darkOptions;
  const currentWallpaper = getWallpaper(currentTheme);

  const handleWallpaperSelect = (id: string) => {
    setWallpaper(currentTheme, id);
  };

  const getThumbnailStyle = (wallpaper: WallpaperOption) => {
    if (wallpaper.imageUrl) {
      return {
        backgroundImage: `url(${wallpaper.imageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    }

    if (wallpaper.type === WallpaperType.PATTERN && wallpaper.value) {
      return {
        backgroundImage: wallpaper.value,
        backgroundSize: "20px 20px",
      };
    }

    return {
      background: wallpaper.value || "#ccc",
    };
  };

  const handleThemeSelect = useCallback(
    (theme: string) => {
      const index = themeOptions.findIndex((option) => option.id === theme);
      if (index === activeIndex) return;

      setDirection(index > activeIndex ? 1 : -1);
      setActiveIndex(index);
    },
    [activeIndex]
  );

  const getThemeIcon = (themeId: string) => {
    const option = themeOptions.find((opt) => opt.id === themeId);
    return option?.icon || "";
  };

  return (
    <SidebarLayout
      title={t("settings.wallpaper")}
      backLocation={SidebarMode.SETTINGS}
    >
      {/* Theme Selection Bar */}
      <SelectionBar
        options={themeOptions.map((opt) => opt.id)}
        selected={currentTheme}
        onSelect={handleThemeSelect}
        getIcon={getThemeIcon}
        className="mt-4!"
      />
      <div className="p-3">
        <SlidingContainer uniqueKey={activeIndex} direction={direction}>
          <div className="space-y-4">
            {/* Preview */}
            <div className="relative h-40 rounded-xl border-2 border-(--border-color) overflow-hidden">
              {/* 1️⃣ Background layer */}
              <div
                className={clsx(
                  "absolute inset-0",
                  currentTheme === "light"
                    ? "bg-(--background-color-light)"
                    : "bg-(--background-color-dark)"
                )}
                style={{ zIndex: -1 }}
              />

              {/* 2️⃣ Wallpaper layer */}
              <div
                className="absolute inset-0"
                style={{
                  ...getThumbnailStyle(currentWallpaper),
                  zIndex: 1,
                }}
              />

              {/* 3️⃣ Message layer */}
              <div className="relative p-4 space-y-3" style={{ zIndex: 2 }}>
                <div
                  className={clsx(
                    "w-3/4 h-8 rounded-lg custom-border",
                    currentTheme === "light"
                      ? "bg-(--message-light-color)"
                      : "bg-(--message-dark-color)"
                  )}
                />
                <div className="w-1/2 h-8 rounded-lg custom-border ml-auto bg-(--primary-green)" />
                <div
                  className={clsx(
                    "w-3/4 h-8 rounded-lg custom-border",
                    currentTheme === "light"
                      ? "bg-(--message-light-color)"
                      : "bg-(--message-dark-color)"
                  )}
                />
              </div>
            </div>

            {/* Wallpaper Selection */}
            <div className="grid grid-cols-3 gap-3">
              {currentOptions.map((wallpaper) => (
                <button
                  key={wallpaper.id}
                  onClick={() => handleWallpaperSelect(wallpaper.id)}
                  className={clsx(
                    "relative aspect-square overflow-hidden border-(--border-color) hover:scale-110 transition-all",
                    currentWallpaper.id === wallpaper.id
                      ? "border-(--primary-green-glow) border-4"
                      : "border-2",
                    {
                      " rounded-full!":
                        wallpaper.type === WallpaperType.DEFAULT,
                      "rounded-lg!": wallpaper.type !== WallpaperType.DEFAULT,
                    }
                  )}
                  style={getThumbnailStyle(wallpaper)}
                  title={wallpaper.name}
                >
                  {currentWallpaper.id === wallpaper.id &&
                    wallpaper.type !== WallpaperType.DEFAULT && (
                      <div
                        className={clsx(
                          "absolute inset-0",
                          currentTheme === "light"
                            ? "bg-(--background-color-light)"
                            : "bg-(--background-color-dark)"
                        )}
                        style={{ zIndex: -1 }}
                      />
                    )}

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
                </button>
              ))}
            </div>
          </div>
        </SlidingContainer>
      </div>
    </SidebarLayout>
  );
};

export default SidebarSettingsWallpaper;
