import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

type TimerFormat = "digital" | "analog" | "text";
type TimerSize = "sm" | "md" | "lg";

interface CallTimerProps {
  /**
   * Start time as Date object or timestamp (ms)
   * If not provided, starts from 0
   */
  startTime?: Date | number;
  /**
   * If true, pauses the timer
   * @default false
   */
  paused?: boolean;
  /**
   * Timer display format
   * @default 'digital'
   */
  format?: TimerFormat;
  /**
   * Size of the timer
   * @default 'md'
   */
  size?: TimerSize;
  /**
   * Callback when timer updates
   * @param duration Duration in seconds
   */
  onUpdate?: (duration: number) => void;
  /**
   * Custom class name
   */
  className?: string;
}

export const CallTimer = ({
  startTime,
  paused = false,
  format = "digital",
  size = "md",
  onUpdate,
  className = "",
}: CallTimerProps) => {
  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | undefined>(null);
  const [duration, setDuration] = useState(0);
  const startRef = useRef(startTime ? +new Date(startTime) : null);

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
  };

  // Format duration into HH:MM:SS
  const formatDigital = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Format duration into "X min Y sec"
  const formatText = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    if (mins > 0) {
      return `${mins} min ${secs} sec`;
    }
    return `${secs} sec`;
  };

  // Analog clock face (simplified)
  const renderAnalog = () => {
    const minutesAngle = ((duration % 3600) / 60) * 6;
    const secondsAngle = (duration % 60) * 6;

    return (
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-gray-300" />
        <motion.div
          className="absolute left-1/2 top-1/2 h-1/2 w-0.5 origin-bottom -ml-[1px] bg-gray-700"
          animate={{ rotate: minutesAngle }}
        />
        <motion.div
          className="absolute left-1/2 top-1/2 h-1/2 w-px origin-bottom -ml-[0.5px] bg-red-500"
          animate={{ rotate: secondsAngle }}
        />
      </div>
    );
  };

  const updateTimer = (time: number) => {
    if (previousTimeRef.current === undefined) {
      previousTimeRef.current = time;
    }

    const deltaTime = time - (previousTimeRef.current ?? time);
    previousTimeRef.current = time;

    if (!paused) {
      setDuration((prev) => {
        const newDuration = prev + Math.floor(deltaTime / 1000);
        onUpdate?.(newDuration);
        return newDuration;
      });
    }
  };

  useEffect(() => {
    if (startTime) {
      const now = +new Date();
      const initialDuration = Math.floor((now - +new Date(startTime)) / 1000);
      setDuration(initialDuration);
      startRef.current = +new Date(startTime);
    } else {
      setDuration(0);
      startRef.current = null;
    }
  }, [startTime]);

  useEffect(() => {
    const animate = (time: number) => {
      updateTimer(time);
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused]);

  return (
    <div className={`flex items-center ${sizeClasses[size]} ${className}`}>
      {format === "analog" ? (
        renderAnalog()
      ) : (
        <span className="tabular-nums">
          {format === "digital"
            ? formatDigital(duration)
            : formatText(duration)}
        </span>
      )}
    </div>
  );
};
