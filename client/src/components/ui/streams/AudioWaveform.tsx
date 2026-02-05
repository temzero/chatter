import React, { useRef, useEffect, useState, useCallback } from "react";
import { BarLoader } from "react-spinners";
import {
  calculateBarDimensions,
  calculateProgressIndex,
  fetchAndDecodeAudio,
  generateWaveformFromAudioBuffer,
  normalizeWaveform,
  drawRoundedBar,
  adjustColor,
  WaveformConfig,
} from "@/common/utils/audioWaveformUtils";

interface AudioWaveVisualizerProps extends WaveformConfig {
  mediaUrl: string;
  isPlaying: boolean;
  currentTime?: number;
  duration?: number;
  onSeek?: (time: number) => void;
  showLoadingIndicator?: boolean;
  loadingColor?: string;
  loadingErrorText?: string;
}

const WAVE_COLOR = "#555";

const AudioWaveform = ({
  mediaUrl,
  isPlaying,
  currentTime = 0,
  duration = 0,
  height = 48,
  color = "rgb(134, 239, 172)",
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
      if (
        !canvasRef.current ||
        duration === 0 ||
        containerWidth === 0 ||
        loadingError
      )
        return;

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickPercentage = Math.max(0, Math.min(1, clickX / containerWidth));
      const seekTime = clickPercentage * duration;

      onSeek?.(seekTime);
    },
    [containerWidth, duration, onSeek, loadingError],
  );

  // Loading animation
  const drawLoadingAnimation = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const { actualBarWidth } = calculateBarDimensions(
        containerWidth,
        barCount,
        barSpacing,
        barWidth,
      );

      ctx.clearRect(0, 0, containerWidth, height);

      const now = Date.now();
      const pulseSpeed = 0.002;

      for (let i = 0; i < barCount; i++) {
        const pulse = Math.sin(now * pulseSpeed + i * 0.1) * 0.5 + 0.5;
        const barHeight = Math.max(2, height * 0.6 * pulse);
        const x = i * (actualBarWidth + barSpacing);
        const y = height - barHeight;

        const gradient = ctx.createLinearGradient(0, y, 0, height);
        gradient.addColorStop(0, loadingColor);
        gradient.addColorStop(1, adjustColor(loadingColor, -30));

        ctx.fillStyle = gradient;
        drawRoundedBar(ctx, x, y, actualBarWidth, barHeight, 4);
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

  // Decode audio into waveform
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWaveReady(false);
    setIsLoading(true);
    setLoadingError(null);

    const generate = async () => {
      try {
        const audioBuffer = await fetchAndDecodeAudio(mediaUrl);
        const waveformData = await generateWaveformFromAudioBuffer(
          audioBuffer,
          barCount,
        );
        staticWaveRef.current = normalizeWaveform(waveformData, maxBarHeight);

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
    const { actualBarCount, actualBarWidth } = calculateBarDimensions(
      containerWidth,
      barCount,
      barSpacing,
      barWidth,
    );

    const radius = Math.min(actualBarWidth / 2, 4);

    const draw = () => {
      const progressIndex = calculateProgressIndex(
        currentTime,
        duration,
        actualBarCount,
      );

      ctx.clearRect(0, 0, containerWidth, height);
      const barsToDraw = Math.min(actualBarCount, wave.length);

      for (let i = 0; i < barsToDraw; i++) {
        const barHeight = Math.max(2, wave[i] * height);
        const x = i * (actualBarWidth + barSpacing);
        const y = height - barHeight;

        ctx.fillStyle = i < progressIndex ? color : WAVE_COLOR;
        drawRoundedBar(ctx, x, y, actualBarWidth, barHeight, radius);
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

export default AudioWaveform;
