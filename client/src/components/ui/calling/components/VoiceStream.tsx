// components/call/VoiceStream.tsx
import { useEffect, useRef } from "react";
import { RemoteTrack } from "livekit-client";

type VoiceStreamProps = {
  stream?: MediaStream | RemoteTrack | null;
  muted?: boolean;
  className?: string;
};

export const VoiceStream = ({
  stream,
  muted = false,
  className = "",
}: VoiceStreamProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  // Helper: convert RemoteTrack to MediaStream
  const getMediaStream = (
    s: MediaStream | RemoteTrack | null | undefined
  ): MediaStream | null => {
    if (!s) return null;
    if (s instanceof MediaStream) return s;
    if (s instanceof RemoteTrack) return new MediaStream([s.mediaStreamTrack]);
    return null;
  };

  useEffect(() => {
    const audioEl = audioRef.current;
    const mediaStream = getMediaStream(stream);
    if (!audioEl || !mediaStream) return;

    audioEl.srcObject = mediaStream;
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

  const mediaStream = getMediaStream(stream);
  if (!mediaStream) return null;

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
