// components/call/VoiceStream.tsx
import { useEffect, useRef } from "react";

export const VoiceStream = ({
  stream,
  muted = false,
  className = "",
}: {
  stream?: MediaStream | null;
  muted?: boolean;
  className?: string;
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl || !stream) return;

    audioEl.srcObject = stream;
    audioEl
      .play()
      .catch((err) =>
        console.warn("Audio play failed, needs user interaction:", err)
      );

    return () => {
      if (audioEl) {
        audioEl.pause();
        audioEl.srcObject = null;
      }
    };
  }, [stream]);

  if (!stream) return null;

  return (
    <audio
      ref={audioRef}
      autoPlay
      playsInline
      muted={muted}
      className={className || "hidden"}
    />
  );
};
