import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
} from "react";
import { BarLoader } from "react-spinners";

interface AudioWaveVisualizerProps {
  mediaUrl: string;
  isPlaying: boolean;
  currentTime?: number;
  duration?: number; // Get duration from parent
  height?: number;
  color?: string;
  onSeek?: (time: number) => void;
  barCount?: number;
  barSpacing?: number;
  barWidth?: number;
  maxBarHeight?: number;
  showLoadingIndicator?: boolean;
  loadingColor?: string;
  loadingErrorText?: string;
}

const PROGRESS_COLOR = "rgb(134, 239, 172)";
const WAVE_COLOR = "#555";

const AudioWaveVisualizer = ({
  mediaUrl,
  isPlaying,
  currentTime = 0,
  duration = 0, // From parent
  height = 48,
  color = PROGRESS_COLOR,
  onSeek,
  barCount = 200,
  barSpacing = 1,
  barWidth,
  maxBarHeight = 1,
  showLoadingIndicator = true,
  loadingColor = WAVE_COLOR,
  loadingErrorText = "Failed to load audio",
}: AudioWaveVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const staticWaveRef = useRef<number[]>([]);

  const [waveReady, setWaveReady] = useState(false);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  // Measure container width
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Handle canvas click for seeking
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current || duration === 0 || containerWidth === 0 || loadingError)
        return;

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickPercentage = Math.max(0, Math.min(1, clickX / containerWidth));
      const seekTime = clickPercentage * duration;

      // Notify parent about seek
      onSeek?.(seekTime);
    },
    [containerWidth, duration, onSeek, loadingError],
  );

  // Decode audio into waveform
  useEffect(() => {
    setWaveReady(false);
    setIsLoading(true);
    setLoadingError(null);

    const generate = async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const offlineCtx = new AudioCtx();

        const response = await fetch(mediaUrl);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await offlineCtx.decodeAudioData(arrayBuffer);
        await offlineCtx.close();

        const rawData = audioBuffer.getChannelData(0);
        const targetBarCount = barCount;
        const chunkSize = Math.floor(rawData.length / targetBarCount);
        const waveform: number[] = [];

        for (let i = 0; i < targetBarCount; i++) {
          let sum = 0;
          for (let j = 0; j < chunkSize; j++) {
            sum += Math.abs(rawData[i * chunkSize + j]);
          }
          waveform.push(sum / chunkSize);
        }

        const max = Math.max(...waveform);
        staticWaveRef.current = waveform.map((v) => (v / max) * maxBarHeight);

        setWaveReady(true);
        setIsLoading(false);
        setLoadingError(null);
      } catch (e) {
        console.error("Failed to decode audio:", e);
        setLoadingError(e instanceof Error ? e.message : "Unknown error");
        setIsLoading(false);
      }
    };

    generate();
  }, [mediaUrl, barCount, maxBarHeight]);

  // Loading animation
  const drawLoadingAnimation = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const waveCount = barCount || 200;
      const actualBarWidth =
        barWidth ||
        (containerWidth - (waveCount - 1) * barSpacing) / waveCount;

      ctx.clearRect(0, 0, containerWidth, height);

      const now = Date.now();
      const pulseSpeed = 0.002;

      for (let i = 0; i < waveCount; i++) {
        const pulse = Math.sin(now * pulseSpeed + i * 0.1) * 0.5 + 0.5;
        const barHeight = Math.max(2, height * 0.6 * pulse);
        const x = i * (actualBarWidth + barSpacing);
        const y = height - barHeight;

        const gradient = ctx.createLinearGradient(0, y, 0, height);
        gradient.addColorStop(0, loadingColor);
        gradient.addColorStop(1, adjustColor(loadingColor, -30));

        ctx.fillStyle = gradient;

        const radius = Math.min(actualBarWidth / 2, 4);
        if (radius > 0 && barHeight >= radius * 2) {
          const r = radius;
          ctx.beginPath();
          ctx.moveTo(x + r, y);
          ctx.lineTo(x + actualBarWidth - r, y);
          ctx.arcTo(x + actualBarWidth, y, x + actualBarWidth, y + r, r);
          ctx.lineTo(x + actualBarWidth, y + barHeight - r);
          ctx.arcTo(
            x + actualBarWidth,
            y + barHeight,
            x + actualBarWidth - r,
            y + barHeight,
            r,
          );
          ctx.lineTo(x + r, y + barHeight);
          ctx.arcTo(x, y + barHeight, x, y + barHeight - r, r);
          ctx.lineTo(x, y + r);
          ctx.arcTo(x, y, x + r, y, r);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillRect(x, y, actualBarWidth, barHeight);
        }
      }
    },
    [barCount, barSpacing, barWidth, containerWidth, height, loadingColor],
  );

  // Error state
  const drawErrorState = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      ctx.clearRect(0, 0, containerWidth, height);
      ctx.fillStyle = "rgba(255, 0, 0, 0.1)";
      ctx.fillRect(0, 0, containerWidth, height);
      ctx.fillStyle = "#ff4444";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(loadingErrorText, containerWidth / 2, height / 2);
    },
    [containerWidth, height, loadingErrorText],
  );

  // Color adjustment
  const adjustColor = (color: string, amount: number): string => {
    if (color.startsWith("#")) {
      let r = parseInt(color.slice(1, 3), 16);
      let g = parseInt(color.slice(3, 5), 16);
      let b = parseInt(color.slice(5, 7), 16);

      r = Math.max(0, Math.min(255, r + amount));
      g = Math.max(0, Math.min(255, g + amount));
      b = Math.max(0, Math.min(255, b + amount));

      return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
    }
    return color;
  };

  // Drawing effect
  useEffect(() => {
    if (containerWidth === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    // Loading state
    if (showLoadingIndicator && isLoading) {
      const animateLoading = () => {
        drawLoadingAnimation(ctx);
        animationRef.current = requestAnimationFrame(animateLoading);
      };
      animationRef.current = requestAnimationFrame(animateLoading);
      return () => cancelAnimationFrame(animationRef.current);
    }

    // Error state
    if (loadingError) {
      drawErrorState(ctx);
      return;
    }

    // Normal drawing
    if (!waveReady || staticWaveRef.current.length === 0) return;

    const wave = staticWaveRef.current;
    let actualBarCount: number;
    let actualBarWidth: number;

    if (barWidth) {
      actualBarWidth = barWidth;
      actualBarCount = Math.floor(containerWidth / (barWidth + barSpacing));
    } else {
      actualBarCount = barCount;
      actualBarWidth =
        (containerWidth - (barCount - 1) * barSpacing) / barCount;
    }

    const radius = Math.min(actualBarWidth / 2, 4);

    const draw = () => {
      const progress = duration > 0 ? currentTime / duration : 0;
      const progressIndex = Math.floor(progress * actualBarCount);

      ctx.clearRect(0, 0, containerWidth, height);
      const barsToDraw = Math.min(actualBarCount, wave.length);

      for (let i = 0; i < barsToDraw; i++) {
        const barHeight = Math.max(2, wave[i] * height);
        const x = i * (actualBarWidth + barSpacing);
        const y = height - barHeight;

        ctx.fillStyle = i < progressIndex ? color : WAVE_COLOR;

        if (radius > 0 && barHeight >= radius * 2) {
          const r = radius;
          ctx.beginPath();
          ctx.moveTo(x + r, y);
          ctx.lineTo(x + actualBarWidth - r, y);
          ctx.arcTo(x + actualBarWidth, y, x + actualBarWidth, y + r, r);
          ctx.lineTo(x + actualBarWidth, y + barHeight - r);
          ctx.arcTo(
            x + actualBarWidth,
            y + barHeight,
            x + actualBarWidth - r,
            y + barHeight,
            r,
          );
          ctx.lineTo(x + r, y + barHeight);
          ctx.arcTo(x, y + barHeight, x, y + barHeight - r, r);
          ctx.lineTo(x, y + r);
          ctx.arcTo(x, y, x + r, y, r);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillRect(x, y, actualBarWidth, barHeight);
        }
      }
    };

    draw();

    if (isPlaying) {
      const loop = () => {
        draw();
        animationRef.current = requestAnimationFrame(loop);
      };
      animationRef.current = requestAnimationFrame(loop);
    }

    return () => cancelAnimationFrame(animationRef.current);
  }, [
    isLoading,
    loadingError,
    isPlaying,
    waveReady,
    containerWidth,
    height,
    color,
    duration,
    currentTime,
    barCount,
    barSpacing,
    barWidth,
    showLoadingIndicator,
    drawLoadingAnimation,
    drawErrorState,
  ]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "end",
        justifyContent: "center",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {showLoadingIndicator && isLoading ? (
        <BarLoader width="100%" color={WAVE_COLOR} />
      ) : (
        <canvas
          ref={canvasRef}
          width={containerWidth}
          height={height}
          style={{
            width: "100%",
            height: "100%",
            cursor: loadingError ? "not-allowed" : "pointer",
            display: "block",
          }}
          onClick={handleCanvasClick}
          title={loadingError ? loadingErrorText : "Click to seek"}
        />
      )}
    </div>
  );
};

export default AudioWaveVisualizer;