// src/components/common/BackgroundWallpaper.tsx
import { useWallpaperStore } from "@/stores/wallpaperStore";
import { useTheme } from "@/stores/themeStore";
import { WallpaperType } from "@/shared/types/enums/wallpaper-type.enum";

const BackgroundWallpaper = () => {
  const theme = useTheme();
  const { getWallpaper } = useWallpaperStore();
  const wallpaper = getWallpaper(theme);

  // Handle image type
  if (wallpaper.type === WallpaperType.IMAGE && wallpaper.imageUrl) {
    return (
      <div className="fixed inset-0 overflow-hidden -z-10">
        <img
          className="w-full h-full object-cover"
          src={wallpaper.imageUrl}
          alt="Background"
          aria-hidden="true"
        />
        <div
          className={`absolute inset-0 ${
            theme === "dark" ? "bg-black/30" : "bg-white/10"
          }`}
        />
      </div>
    );
  }

  // Handle CSS-based wallpapers
  const style =
    wallpaper.type === WallpaperType.PATTERN
      ? { backgroundImage: wallpaper.value, backgroundSize: "40px 40px" }
      : { background: wallpaper.value };

  return (
    <div className="fixed inset-0 -z-10" style={style} aria-hidden="true" />
  );
};

export default BackgroundWallpaper;
