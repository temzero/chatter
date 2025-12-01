// components/Timer.tsx
import { useEffect, useState } from "react";

interface TimerProps {
  startTime?: Date | string | null;
}

export const Timer = ({ startTime }: TimerProps) => {
  // ✅ Initialize state with the calculation
  const [seconds, setSeconds] = useState(() => {
    if (!startTime) return 0;
    return Math.floor((Date.now() - new Date(startTime).getTime()) / 1000);
  });

  useEffect(() => {
    // ✅ NO setState here at all!
    if (!startTime) return;

    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const minutes = Math.floor(seconds / 60);
  const displaySeconds = seconds % 60;

  return (
    <span>
      {minutes}:{displaySeconds.toString().padStart(2, "0")}
    </span>
  );
};
