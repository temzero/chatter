// src/components/common/BackgroundWallpaper.tsx
import { useCurrentWallpaper } from "@/stores/wallpaperStore";
import Wallpaper from "./Wallpaper";

const BackgroundWallpaper = () => {
  const currentWallpaper = useCurrentWallpaper();

  return <Wallpaper wallpaper={currentWallpaper} className="fixed inset-0 -z-99" />;
};

export default BackgroundWallpaper;
