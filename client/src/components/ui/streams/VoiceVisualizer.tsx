// components/VoiceVisualizer.tsx
import { useEffect, useRef, useState } from "react";
import { RemoteTrack } from "livekit-client";

type VoiceVisualizerProps = {
  stream: MediaStream | RemoteTrack | null;
  isMuted: boolean;
  size?: number; // circle size in px
  circleColor?: string;
  opacity?: number;
  className?: string;
};

export const VoiceVisualizer = ({
  stream,
  isMuted = false,
  size = 40,
  circleColor = "gray",
  opacity = 0.2,
  className = "",
}: VoiceVisualizerProps) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);

  // ✅ Move function declaration BEFORE using it
  const getMediaStream = (
    s: MediaStream | RemoteTrack | null | undefined
  ): MediaStream | null => {
    if (!s) return null;
    if (s instanceof MediaStream) return s;
    if (s instanceof RemoteTrack) return new MediaStream([s.mediaStreamTrack]);
    return null;
  };

  // ✅ Now you can use it here
  const [scale, setScale] = useState(() => {
    if (isMuted) return 0;
    const mediaStream = getMediaStream(stream);
    return !mediaStream || !mediaStream.getAudioTracks().length ? 0 : 1;
  });

  useEffect(() => {
    const mediaStream = getMediaStream(stream);

    if (!mediaStream || isMuted || !mediaStream.getAudioTracks().length) {
      if (audioContextRef.current?.state !== "closed") {
        audioContextRef.current?.close();
      }
      // ✅ Remove setScale(0) from here
      return;
    }

    const AudioContext =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;

    const analyzer = audioContext.createAnalyser();
    analyzer.fftSize = 256;
    analyzerRef.current = analyzer;

    const source = audioContext.createMediaStreamSource(mediaStream);
    source.connect(analyzer);

    const dataArray = new Uint8Array(analyzer.frequencyBinCount);

    const update = () => {
      analyzer.getByteTimeDomainData(dataArray);

      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const value = dataArray[i] - 128;
        sum += value * value;
      }

      const rms = Math.sqrt(sum / dataArray.length);
      const normalized = Math.min(rms / 50, 1);
      const newScale = normalized * 5;

      setScale(newScale); // ✅ This is fine - it's in a callback
      requestAnimationFrame(update);
    };

    update();

    return () => {
      if (audioContextRef.current?.state !== "closed") {
        audioContextRef.current?.close();
      }
    };
  }, [stream, isMuted]);

  // ✅ Derive visibility from isMuted instead of returning null
  if (isMuted) {
    return (
      <div
        className={`absolute rounded-full! transition-transform duration-75 ${className}`}
        style={{
          width: size,
          height: size,
          backgroundColor: circleColor,
          transform: `scale(0)`,
          opacity: opacity,
          zIndex: 0,
        }}
      />
    );
  }

  return (
    <div
      className={`absolute rounded-full! transition-transform duration-75 ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: circleColor,
        transform: `scale(${scale})`,
        opacity: opacity,
        zIndex: 0,
      }}
    />
  );
};
