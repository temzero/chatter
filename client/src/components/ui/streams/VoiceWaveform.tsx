// components/ui/streams/VoiceWaveform.tsx - UPDATED
import { useRef, useEffect, useState } from "react";
import {
  calculateBarDimensions,
  calculateProgressIndex,
  decodeAudioBlob,
  generateWaveformFromAudioBuffer,
  normalizeWaveform,
  WaveformConfig,
} from "@/common/utils/audioWaveformUtils";

interface VoiceWaveformProps extends WaveformConfig {
  audioBlob: Blob | null;
  currentTime?: number;
  duration?: number;
  className?: string;
  fallbackToMock?: boolean;
}

const VoiceWaveform = ({
  audioBlob,
  currentTime = 0,
  duration = 0,
  height = 40,
  color = "#ffffff",
  processColor,
  barCount = 100,
  barSpacing = 1,
  barWidth,
  maxBarHeight = 1,
  className = "",
  fallbackToMock = true,
}: VoiceWaveformProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [waveform, setWaveform] = useState<number[]>([]);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [hasError, setHasError] = useState<boolean>(false);
  const prevAudioBlobRef = useRef<string | null>(null);

  // Measure container width
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateWidth = () => {
      setContainerWidth(container.clientWidth);
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.unobserve(container);
    };
  }, []);

  // Decode audio into waveform - FIXED VERSION
  useEffect(() => {
    let isMounted = true;
    let animationFrameId: number;

    const processWaveform = async () => {
      // Reset error state
      setHasError(false);

      if (!audioBlob) {
        animationFrameId = requestAnimationFrame(() => {
          if (isMounted) {
            setWaveform([]);
          }
        });
        return;
      }

      // ADD THIS CHECK: Validate blob has actual audio data
      if (audioBlob.size < 100) {
        // Minimum size for audio data
        // console.log("Skipping waveform: audio blob too small or empty");
        animationFrameId = requestAnimationFrame(() => {
          if (isMounted) {
            setWaveform([]);
          }
        });
        return;
      }

      // Also check if it's a valid audio type
      if (
        !audioBlob.type.startsWith("audio/") &&
        !audioBlob.type.includes("webm") &&
        !audioBlob.type.includes("opus")
      ) {
        console.log("Skipping waveform: not an audio blob");
        animationFrameId = requestAnimationFrame(() => {
          if (isMounted) {
            setWaveform([]);
          }
        });
        return;
      }

      // Check if this is the same blob we already processed
      const blobKey = `${audioBlob.size}-${audioBlob.type}`;
      if (prevAudioBlobRef.current === blobKey && waveform.length > 0) {
        return; // Skip reprocessing same blob
      }

      try {
        // Validate blob first
        if (audioBlob.size === 0) {
          throw new Error("Empty audio blob");
        }

        const audioBuffer = await decodeAudioBlob(audioBlob);

        // Additional validation
        if (
          !audioBuffer ||
          audioBuffer.length === 0 ||
          audioBuffer.duration === 0
        ) {
          throw new Error("Invalid audio buffer");
        }

        const waveformData = await generateWaveformFromAudioBuffer(
          audioBuffer,
          barCount,
        );
        const normalized = normalizeWaveform(waveformData, maxBarHeight);

        // Store blob key to avoid reprocessing
        prevAudioBlobRef.current = blobKey;

        animationFrameId = requestAnimationFrame(() => {
          if (isMounted) {
            setWaveform(normalized);
          }
        });
      } catch (error) {
        console.error("Failed to generate waveform:", error);

        animationFrameId = requestAnimationFrame(() => {
          if (isMounted) {
            setWaveform([]); // Just set empty array on error
          }
        });
      }
    };

    processWaveform();

    return () => {
      isMounted = false;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [audioBlob, barCount, maxBarHeight, fallbackToMock, waveform.length]);

  // Draw waveform
  useEffect(() => {
    if (
      !canvasRef.current ||
      !containerWidth ||
      containerWidth === 0 ||
      waveform.length === 0
    ) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    // Set canvas dimensions
    canvas.width = containerWidth;
    canvas.height = height;

    const { actualBarCount, actualBarWidth } = calculateBarDimensions(
      containerWidth,
      barCount,
      barSpacing,
      barWidth,
    );

    const progressIndex = calculateProgressIndex(
      currentTime,
      duration,
      actualBarCount,
    );

    // Clear canvas
    ctx.clearRect(0, 0, containerWidth, height);

    // If there's an error, draw a placeholder
    if (hasError && waveform.length > 0) {
      ctx.fillStyle = `${color}30`; // Even more transparent for error state
      for (let i = 0; i < Math.min(actualBarCount, waveform.length); i++) {
        const barHeight = Math.max(2, (waveform[i] || 0.1) * height * 0.7); // Smaller bars for error
        const x = i * (actualBarWidth + barSpacing);
        const y = height - barHeight;
        ctx.fillRect(x, y, actualBarWidth, barHeight);
      }
      return;
    }

    // Draw each bar
    for (let i = 0; i < Math.min(actualBarCount, waveform.length); i++) {
      const barHeight = Math.max(2, (waveform[i] || 0.1) * height);
      const x = i * (actualBarWidth + barSpacing);
      const y = height - barHeight;

      // Determine color: played vs unplayed
      ctx.fillStyle = i < progressIndex ? processColor || color : `${color}60`; // Use color with 60% opacity

      ctx.fillRect(x, y, actualBarWidth, barHeight);
    }
  }, [
    waveform,
    containerWidth,
    height,
    color,
    processColor,
    currentTime,
    duration,
    barSpacing,
    barWidth,
    barCount,
    hasError,
  ]);

  return (
    <div
      ref={containerRef}
      className={`w-full ${className}`}
      style={{ minHeight: `${height}px` }}
    >
      <canvas
        ref={canvasRef}
        className="w-full"
        style={{
          height: `${height}px`,
          display: waveform.length > 0 ? "block" : "none",
          opacity: hasError ? 0.7 : 1,
        }}
      />
    </div>
  );
};

export default VoiceWaveform;
