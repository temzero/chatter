import { useEffect, useRef, useMemo } from "react";
import { RemoteTrack } from "livekit-client";

type VoiceVisualizerProps = {
  stream: MediaStream | RemoteTrack | null;
  isMuted?: boolean;
  width?: number;
  height?: number;
  className?: string;
  barColor?: string;
};

export const VoiceVisualizerBar = ({
  stream,
  isMuted = false,
  width = 200,
  height = 30,
  className = "",
  barColor = "#3b82f6",
}: VoiceVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);

  // Convert RemoteTrack to MediaStream if needed
  const mediaStream = useMemo(() => {
    if (!stream) return null;

    if (stream instanceof MediaStream) return stream;

    // LiveKit RemoteTrack (audio)
    if ("mediaStreamTrack" in stream) {
      return new MediaStream([stream.mediaStreamTrack]);
    }

    return null;
  }, [stream]);

  useEffect(() => {
    if (!mediaStream || isMuted) {
      // Clean up if no stream or muted
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current?.state !== "closed") {
        audioContextRef.current?.close();
      }
      return;
    }

    try {
      const AudioContext =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const analyzer = audioContext.createAnalyser();
      analyzerRef.current = analyzer;
      analyzer.fftSize = 256;

      const source = audioContext.createMediaStreamSource(mediaStream);
      source.connect(analyzer);

      const drawWaveform = () => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const canvasCtx = canvas.getContext("2d");
        if (!canvasCtx) return;

        const bufferLength = analyzer.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyzer.getByteTimeDomainData(dataArray);

        // Clear canvas
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw waveform
        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = barColor;
        canvasCtx.beginPath();

        const sliceWidth = canvas.width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * canvas.height) / 2;

          if (i === 0) {
            canvasCtx.moveTo(x, y);
          } else {
            canvasCtx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        canvasCtx.lineTo(canvas.width, canvas.height / 2);
        canvasCtx.stroke();
        animationRef.current = requestAnimationFrame(drawWaveform);
      };

      drawWaveform();
    } catch (error) {
      console.error("Error setting up audio visualization:", error);
    }

    return () => {
      // Cleanup function
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current?.state !== "closed") {
        audioContextRef.current?.close();
      }
    };
  }, [mediaStream, isMuted, barColor]);

  console.log("VoiceVisualizerBar muted:", isMuted);
  console.log("VoiceVisualizerBar stream:", mediaStream);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
    />
  );
};
