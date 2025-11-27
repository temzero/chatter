// components/call/components/VideoStream.tsx
import { useEffect, useRef } from "react";
import { RemoteTrack } from "livekit-client";

interface VideoStreamProps {
  stream: MediaStream | RemoteTrack | null;
  className?: string;
  muted?: boolean;
  objectCover?: boolean;
  mirror?: boolean;
}

export const VideoStream = ({
  stream,
  className = "",
  objectCover = false,
  muted = false,
  mirror = false,
}: VideoStreamProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl || !stream) return;

    videoEl.srcObject = null;

    if (stream instanceof RemoteTrack) {
      requestAnimationFrame(() => stream.attach(videoEl));
    } else if (stream instanceof MediaStream) {
      videoEl.srcObject = stream;
      videoEl.onloadedmetadata = () => {
        videoEl.play().catch((err) => {
          console.warn("Video play failed:", err);
        });
      };
    }

    // Unified cleanup
    return () => {
      if (stream instanceof RemoteTrack) {
        stream.detach(videoEl);
      } else if (stream instanceof MediaStream) {
        videoEl.pause();
        videoEl.srcObject = null;
      }
    };
  }, [stream]);

  return (
    <video
      ref={videoRef}
      className={`h-full w-full select-none transition-all ${className} ${
        objectCover && "object-cover"
      }`}
      autoPlay
      playsInline
      muted={muted}
      style={{
        transform: mirror ? "scaleX(-1)" : "none",
      }}
    />
  );
};
