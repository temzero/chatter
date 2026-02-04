// components/ui/streams/VoiceWaveform.tsx - FIXED PROPERLY
import { useRef, useEffect, useState } from "react";

interface VoiceWaveformProps {
  audioBlob: Blob | null;
  currentTime?: number;
  duration?: number;
  height?: number;
  color?: string;
  barCount?: number;
  barSpacing?: number;
  barWidth?: number;
  maxBarHeight?: number;
  className?: string;
}

const VoiceWaveform = ({
  audioBlob,
  currentTime = 0,
  duration = 0,
  height = 40,
  color = "#86EFAC",
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

  // Decode audio into waveform - USING useCallback PATTERN
  useEffect(() => {
    let isMounted = true;
    let animationFrameId: number;

    const processWaveform = async () => {
      if (!audioBlob) {
        // Schedule the state update in the next animation frame instead of synchronously
        animationFrameId = requestAnimationFrame(() => {
          if (isMounted) {
            setWaveform([]);
          }
        });
        return;
      }

      try {
        const AudioContextClass =
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioContextClass();
        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        audioContext.close();

        const rawData = audioBuffer.getChannelData(0);
        const chunkSize = Math.max(1, Math.floor(rawData.length / barCount));
        const waveformData: number[] = [];

        for (let i = 0; i < barCount; i++) {
          let sum = 0;
          const start = i * chunkSize;
          const end = Math.min(start + chunkSize, rawData.length);

          if (start >= end) {
            waveformData.push(0);
            continue;
          }

          for (let j = start; j < end; j++) {
            sum += Math.abs(rawData[j]);
          }
          waveformData.push(sum / (end - start));
        }

        // Normalize
        const max = Math.max(...waveformData);
        const normalized = waveformData.map((v) =>
          max > 0 ? (v / max) * maxBarHeight : 0.1,
        );

        // Schedule the state update
        animationFrameId = requestAnimationFrame(() => {
          if (isMounted) {
            setWaveform(normalized);
          }
        });
      } catch (error) {
        console.error("Failed to generate waveform:", error);
        // Generate fake waveform
        const fakeWaveform = Array(barCount)
          .fill(0)
          .map((_, i) => Math.abs(Math.sin(i * 0.1)) * 0.5 + 0.2);

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
    if (!canvasRef.current || !containerWidth || containerWidth === 0) {
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

    const actualBarCount = Math.min(barCount, waveform.length);

    if (actualBarCount === 0) {
      ctx.clearRect(0, 0, containerWidth, height);
      return;
    }

    const actualBarWidth =
      barWidth ||
      Math.max(
        1,
        (containerWidth - (actualBarCount - 1) * barSpacing) / actualBarCount,
      );
    const progress = duration > 0 ? Math.min(1, currentTime / duration) : 0;
    const progressIndex = Math.floor(progress * actualBarCount);

    // Clear canvas
    ctx.clearRect(0, 0, containerWidth, height);

    // Draw each bar
    for (let i = 0; i < actualBarCount; i++) {
      const barHeight = Math.max(2, (waveform[i] || 0.1) * height);
      const x = i * (actualBarWidth + barSpacing);
      const y = height - barHeight;

      // Determine color: played vs unplayed
      const barColor = i < progressIndex ? color : `${color}80`;

      ctx.fillStyle = barColor;
      ctx.fillRect(x, y, actualBarWidth, barHeight);
    }
  }, [
    waveform,
    containerWidth,
    height,
    color,
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
