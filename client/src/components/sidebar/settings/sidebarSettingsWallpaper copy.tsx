// SidebarSettingsWallpaper.tsx
import * as React from "react";
import { SidebarMode } from "@/common/enums/sidebarMode";
import { useTranslation } from "react-i18next";
import SidebarLayout from "@/layouts/SidebarLayout";
import { useState } from "react";
import { useTheme, Theme } from "@/stores/themeStore";
import { useWallpaperStore } from "@/stores/wallpaperStore";
import { WallpaperType } from "@/shared/types/enums/wallpaper-type.enum";
import { WallpaperOption } from "@/common/constants/wallpaperOptions";
import clsx from "clsx";

const SidebarSettingsWallpaper: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { setWallpaper, getWallpaper, getAllOptions } = useWallpaperStore();

  const [activeTab, setActiveTab] = useState<Theme>(theme);

  const { light: lightOptions, dark: darkOptions } = getAllOptions();
  const currentOptions = activeTab === "light" ? lightOptions : darkOptions;
  const currentWallpaper = getWallpaper(
    activeTab === "light" ? Theme.Light : Theme.Dark
  );

  const handleWallpaperSelect = (id: string) => {
    const selectedTheme = activeTab === "light" ? Theme.Light : Theme.Dark;
    setWallpaper(selectedTheme, id);
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

  return (
    <SidebarLayout
      title={t("settings.wallpaper")}
      backLocation={SidebarMode.SETTINGS}
    >
      <div className="p-4 space-y-6">
        {/* Theme Tabs */}
        <div className="flex border-b border-(--border-color)">
          <button
            onClick={() => setActiveTab(Theme.Light)}
            className={clsx(
              "flex-1 py-3 font-medium text-center transition-colors",
              activeTab === Theme.Light
                ? "text-(--primary-green-glow) border-b-2 border-(--primary-green-glow)"
                : ""
            )}
          >
            <div className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-lg">
                light_mode
              </span>
              {t("settings.theme_options.light")}
            </div>
          </button>
          <button
            onClick={() => setActiveTab(Theme.Dark)}
            className={clsx(
              "flex-1 py-3 font-medium text-center transition-colors",
              activeTab === Theme.Dark
                ? "text-(--primary-green-glow) border-b-2 border-(--primary-green-glow)"
                : ""
            )}
          >
            <div className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-lg">
                dark_mode
              </span>
              {t("settings.theme_options.dark")}
            </div>
          </button>
        </div>

        {/* Preview */}
        <div className="relative h-40 rounded-xl border-2 border-(--border-color) overflow-hidden">
          {/* 1️⃣ Background layer */}
          <div
            className={clsx(
              "absolute inset-0",
              activeTab === Theme.Light
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
                activeTab === Theme.Light
                  ? "bg-(--message-light-color)"
                  : "bg-(--message-dark-color)"
              )}
            />
            <div className="w-1/2 h-8 rounded-lg custom-border ml-auto bg-(--primary-green)" />
            <div
              className={clsx(
                "w-3/4 h-8 rounded-lg custom-border",
                activeTab === Theme.Light
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
                  " rounded-full!": wallpaper.type === WallpaperType.DEFAULT,
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
                      activeTab === Theme.Light
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
    </SidebarLayout>
  );
};

export default SidebarSettingsWallpaper;
