// components/ui/TimerDisplay.tsx
import { formatRecordingTimeMs } from "@/common/utils/format/formatTime";

interface TimerDisplayProps {
  durationMs: number;
  className?: string;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  durationMs,
  className = "font-mono text-3xl!",
}) => {
  return (
    <span className={className}>
      {formatRecordingTimeMs(durationMs)}
    </span>
  );
};