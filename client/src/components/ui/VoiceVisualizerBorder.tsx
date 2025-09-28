import { useEffect, useRef, useMemo, useState } from "react";
import { RemoteTrack } from "livekit-client";

type VoiceVisualizerBorderProps = {
  stream: MediaStream | RemoteTrack | null;
  isMuted?: boolean;
  className?: string;
  isCircle?: boolean;
  color?: string;
};

export const VoiceVisualizerBorder = ({
  stream,
  isMuted = false,
  className = "",
  isCircle = false,
  color = "white",
}: VoiceVisualizerBorderProps) => {
  const [borderWidth, setBorderWidth] = useState(2); // starting border width
  const [opacity, setOpacity] = useState(0.1); // starting opacity
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);

  // Convert RemoteTrack to MediaStream
  const mediaStream = useMemo(() => {
    if (!stream) return null;
    if (stream instanceof MediaStream) return stream;
    if ("mediaStreamTrack" in stream)
      return new MediaStream([stream.mediaStreamTrack]);
    return null;
  }, [stream]);

  useEffect(() => {
    if (!mediaStream || isMuted) {
      if (audioContextRef.current && audioContextRef.current.state !== "closed")
        audioContextRef.current.close();
      return;
    }

    const AudioContext =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;

    const analyzer = audioContext.createAnalyser();
    analyzer.fftSize = 256;
    analyzerRef.current = analyzer;

    const source = audioContext.createMediaStreamSource(mediaStream);
    source.connect(analyzer);

    let animationFrame: number;

    const animate = () => {
      if (!analyzerRef.current) return;

      const bufferLength = analyzer.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyzer.getByteTimeDomainData(dataArray);

      // calculate RMS volume
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = (dataArray[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / bufferLength);
      const volume = Math.min(rms * 5, 1);

      // map to border width and opacity
      setBorderWidth(2 + volume * 10);
      setOpacity(0.1 + volume * 0.5);

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrame);
      if (
        audioContextRef.current &&
        audioContextRef.current.state !== "closed"
      ) {
        audioContextRef.current.close();
      }
    };
  }, [mediaStream, isMuted]);

  return (
    <canvas
      ref={useRef<HTMLCanvasElement>(null)}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{
        borderStyle: "solid",
        borderColor: color,
        borderWidth: `${borderWidth}px`,
        borderRadius: isCircle ? "50%" : "0",
        opacity: opacity,
      }}
    />
  );
};
