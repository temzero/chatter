import { useEffect, useRef, useState } from "react";
import { Button } from "./Button";

type VoiceVisualizerButtonProps = {
  stream: MediaStream | null;
  isMuted: boolean;
  onClick: () => void;
  className?: string;
  circleColor?: string;
  variant?: "primary" | "secondary" | "success" | "danger" | "ghost" | "link";
  size?: "sm" | "md" | "lg";
};

export const VoiceVisualizerButton = ({
  stream,
  isMuted,
  onClick,
  className = "",
  circleColor = "#00ae8089",
  variant = "ghost",
  size = "md",
}: VoiceVisualizerButtonProps) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const [scale, setScale] = useState(1); // start invisible

  useEffect(() => {
    if (!stream || isMuted) {
      if (audioContextRef.current?.state !== "closed") {
        audioContextRef.current?.close();
      }
      setScale(0); // hide when muted/no stream
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

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyzer);

    const dataArray = new Uint8Array(analyzer.frequencyBinCount);

    const update = () => {
      analyzer.getByteTimeDomainData(dataArray);

      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const value = dataArray[i] - 128;
        sum += value * value;
      }

      // Root Mean Square (sound strength)
      const rms = Math.sqrt(sum / dataArray.length);

      // Normalize volume to [0 → 1]
      const normalized = Math.min(rms / 50, 1);

      // Scale range: 0 (silent/invisible) → 2 (loud)
      const newScale = normalized * 5;

      setScale(newScale);

      requestAnimationFrame(update);
    };

    update();

    return () => {
      if (audioContextRef.current?.state !== "closed") {
        audioContextRef.current?.close();
      }
    };
  }, [stream, isMuted]);

  const buttonSize = {
    sm: 32,
    md: 40,
    lg: 48,
  }[size];

  return (
    <div
      className={`relative inline-flex items-center justify-center overflow-hidden ${className}`}
    >
      {/* Pulsing circle */}
      {!isMuted && (
        <div
          className="absolute rounded-full transition-transform duration-75"
          style={{
            width: buttonSize,
            height: buttonSize,
            backgroundColor: circleColor,
            transform: `scale(${scale})`,
            opacity: 0.2,
            zIndex: 0,
          }}
        />
      )}

      {/* Mic button */}
      <Button
        variant={variant}
        size={size}
        onClick={onClick}
        icon={isMuted ? "mic_off" : "mic"}
        isIconFilled={!isMuted}
        isRoundedFull
        className={`w-full h-full z-10 ${
          isMuted ? "bg-red-500/50 opacity-60" : "text-green-500"
        }`}
      />
    </div>
  );
};
