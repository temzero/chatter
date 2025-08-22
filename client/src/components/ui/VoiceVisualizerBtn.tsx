// components/VoiceVisualizerButton.tsx
import { VoiceVisualizer } from "./VoiceVisualizer";
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
  circleColor,
  variant = "ghost",
  size = "md",
}: VoiceVisualizerButtonProps) => {
  const buttonSize = {
    sm: 32,
    md: 40,
    lg: 48,
  }[size];

  return (
    <div
      className={`relative inline-flex items-center justify-center overflow-hidden ${
        isMuted || "custom-border"
      } ${className}`}
    >
      {/* Pulsing visualizer */}
      <VoiceVisualizer
        stream={stream}
        isMuted={isMuted}
        size={buttonSize}
        circleColor={circleColor}
      />

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
