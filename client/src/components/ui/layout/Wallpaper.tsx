// Wallpaper.tsx
import { WallpaperOption } from "@/common/constants/wallpaperOptions";
import { WallpaperType } from "@/shared/types/enums/wallpaper-type.enum";

type WallpaperProps = {
  wallpaper: WallpaperOption;
  className?: string;
};

const Wallpaper = ({ wallpaper, className }: WallpaperProps) => {
  const { type, background } = wallpaper;

  const style: React.CSSProperties = {
    backgroundSize: wallpaper.backgroundSize || "cover",
    backgroundPosition: wallpaper.backgroundPosition || "center",
    backgroundRepeat: wallpaper.backgroundRepeat || "no-repeat",
  };

  // Handle different wallpaper types
  switch (type) {
    case WallpaperType.IMAGE:
      style.backgroundImage = `url(${background})`;
      break;

    case WallpaperType.PATTERN:
      style.backgroundImage = background;
      // Pattern might include fallback color, e.g.: "linear-gradient(45deg, #888 25%, transparent 25%), #000"
      break;

    case WallpaperType.GRADIENT:
      style.backgroundImage = background;
      break;

    case WallpaperType.SOLID:
    case WallpaperType.DEFAULT:
    default:
      style.backgroundColor = background;
      break;
  }

  return (
    <div className={`w-full h-full ${className}`} aria-hidden="true">
      <div className="w-full h-full z-1" style={style}></div>
      <div className="-z-1 absolute inset-0 bg-(--background-color)"></div>
    </div>
  );
};

export default Wallpaper;
