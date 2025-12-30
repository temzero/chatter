// src/components/common/WallpaperPattern.tsx
import { memo } from "react";
import clsx from "clsx";
import { WallpaperPatternOption } from "@/common/constants/wallpaperPatternOptions";

interface WallpaperPatternProps {
  pattern: WallpaperPatternOption;
  className?: string;
  opacity?: number;
  blendMode?: React.CSSProperties["mixBlendMode"];
}

const WallpaperPattern = memo(function WallpaperPattern({
  pattern,
  className,
  opacity = 1,
  blendMode = "normal",
}: WallpaperPatternProps) {
  // Early return for default/transparent patterns
  if (pattern.id === "default") {
    return null;
  }

  // Memoize style object to prevent unnecessary recalculations
  const style: React.CSSProperties = {
    backgroundImage: pattern.background,
    backgroundSize: pattern.backgroundSize ?? "auto",
    backgroundPosition: pattern.backgroundPosition ?? "center",
    backgroundRepeat: pattern.backgroundRepeat ?? "repeat",
    opacity,
    mixBlendMode: blendMode,
  };

  return (
    <div
      className={clsx("absolute inset-0", className)}
      style={style}
      aria-hidden="true"
      role="presentation"
    />
  );
});

export default WallpaperPattern;
