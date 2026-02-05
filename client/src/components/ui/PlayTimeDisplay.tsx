import { memo } from "react";
import { formatDuration } from "@/common/utils/format/formatDuration";

interface TimeDisplayProps {
  currentTime: number;
  duration: number;
  className?: string;
  onClick?: () => void;
}

const PlayTimeDisplay = memo(
  ({ currentTime, duration, className = "", onClick }: TimeDisplayProps) => (
    <div
      className={`text-center text-sm whitespace-nowrap shrink-0 ${className}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      {currentTime !== 0 && <>{formatDuration(currentTime)} / </>}
      {formatDuration(duration)}
    </div>
  ),
);

PlayTimeDisplay.displayName = "PlayTimeDisplay";

export default PlayTimeDisplay;
