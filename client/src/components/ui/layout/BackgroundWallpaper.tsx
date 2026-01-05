// src/components/common/BackgroundWallpaper.tsx
import { memo } from "react";
import {
  useCurrentPattern,
  useCurrentWallpaper,
} from "@/stores/wallpaperStore";
import Wallpaper from "./Wallpaper";
import WallpaperPattern from "./WallpaperPattern";

const BackgroundWallpaper = memo(function BackgroundWallpaper() {
  const currentPattern = useCurrentPattern();
  const currentWallpaper = useCurrentWallpaper();
  const isNoneWallpaper = currentWallpaper.id === null;

  return (
    <div className="fixed inset-0 -z-50 bg-(--background-color)">
      {/* Pattern overlay on top */}
      <WallpaperPattern
        pattern={currentPattern}
        className="absolute inset-0 -z-9"
        opacity={isNoneWallpaper ? 0.12 : 0.3}
        blendMode={isNoneWallpaper ? undefined : "overlay"}
      />
      {/* Base wallpaper (image, gradient, or solid color) */}
      <Wallpaper
        wallpaper={currentWallpaper}
        className="absolute inset-0 -z-10"
      />
    </div>
  );
});

export default BackgroundWallpaper;
