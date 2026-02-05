// components/ui/streams/VoiceWaveform.tsx - UPDATED
import { useRef, useEffect, useState } from "react";
import {
  calculateBarDimensions,
  calculateProgressIndex,
  decodeAudioBlob,
  generateWaveformFromAudioBuffer,
  normalizeWaveform,
  createFakeWaveform,
  WaveformConfig,
} from "@/common/utils/audioWaveformUtils";

interface VoiceWaveformProps extends WaveformConfig {
  audioBlob: Blob | null;
  currentTime?: number;
  duration?: number;
  className?: string;
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
}: VoiceWaveformProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [waveform, setWaveform] = useState<number[]>([]);
  const [containerWidth, setContainerWidth] = useState<number>(0);

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

  // Decode audio into waveform
  useEffect(() => {
    let isMounted = true;
    let animationFrameId: number;

    const processWaveform = async () => {
      if (!audioBlob) {
        animationFrameId = requestAnimationFrame(() => {
          if (isMounted) {
            setWaveform([]);
          }
        });
        return;
      }

      try {
        const audioBuffer = await decodeAudioBlob(audioBlob);
        const waveformData = await generateWaveformFromAudioBuffer(audioBuffer, barCount);
        const normalized = normalizeWaveform(waveformData, maxBarHeight);

        animationFrameId = requestAnimationFrame(() => {
          if (isMounted) {
            setWaveform(normalized);
          }
        });
      } catch (error) {
        console.error("Failed to generate waveform:", error);
        const fakeWaveform = createFakeWaveform(barCount, maxBarHeight);
        
        animationFrameId = requestAnimationFrame(() => {
          if (isMounted) {
            setWaveform(fakeWaveform);
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
  }, [audioBlob, barCount, maxBarHeight]);

  // Draw waveform
  useEffect(() => {
    if (!canvasRef.current || !containerWidth || containerWidth === 0 || waveform.length === 0) {
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
      barWidth
    );

    const progressIndex = calculateProgressIndex(currentTime, duration, actualBarCount);

    // Clear canvas
    ctx.clearRect(0, 0, containerWidth, height);

    // Draw each bar
    for (let i = 0; i < Math.min(actualBarCount, waveform.length); i++) {
      const barHeight = Math.max(2, (waveform[i] || 0.1) * height);
      const x = i * (actualBarWidth + barSpacing);
      const y = height - barHeight;

      // Determine color: played vs unplayed
      ctx.fillStyle = i < progressIndex
        ? processColor || color
        : `${color}60`; // Use color with 60% opacity

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
        }}
      />
    </div>
  );
};

export default VoiceWaveform;