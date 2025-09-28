import { useMemo } from "react";
import { RemoteTrack } from "livekit-client";
import { VoiceVisualizer } from "./VoiceVisualizer";
import { Button } from "./Button";

type VoiceVisualizerButtonProps = {
  stream: MediaStream | RemoteTrack | null;
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
  circleColor,
  variant = "ghost",
  size = "md",
}: VoiceVisualizerButtonProps) => {
  const buttonSize = {
    sm: 32,
    md: 40,
    lg: 48,
  }[size];

  // Convert RemoteTrack to MediaStream if needed
  const mediaStream = useMemo(() => {
    if (!stream) return null;
    if (stream instanceof MediaStream) return stream;
    if ("mediaStreamTrack" in stream)
      return new MediaStream([stream.mediaStreamTrack]);
    return null;
  }, [stream]);

  console.log("VoiceVisualizerButton muted:", isMuted);

  return (
    <div
      className={`relative inline-flex items-center justify-center overflow-hidden aspect-square ${className}`}
    >
      {!isMuted && mediaStream && (
        <VoiceVisualizer
          stream={mediaStream}
          isMuted={isMuted}
          size={buttonSize}
          circleColor={circleColor}
        />
      )}

      <Button
        variant={variant}
        size={size}
        onClick={onClick}
        icon={isMuted ? "mic_off" : "mic"}
        isIconFilled={!isMuted}
        isRoundedFull
        className={`w-full h-full z-10 ${
          isMuted ? "bg-red-500/50" : "!text-[--primary-green]"
        }`}
      />
    </div>
  );
};
