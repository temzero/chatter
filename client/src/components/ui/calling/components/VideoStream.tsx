// components/call/components/VideoStream.tsx
import { useEffect, useRef } from "react";
import { RemoteTrack } from "livekit-client";

interface VideoStreamProps {
  stream: MediaStream | RemoteTrack | null;
  className?: string;
  muted?: boolean;
  mirror?: boolean; // optional mirror for self-view
}

export const VideoStream = ({
  stream,
  className = "",
  muted = false,
  mirror = false,
}: VideoStreamProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl || !stream) return;

    // Clear previous src
    videoEl.srcObject = null;

    if (stream instanceof RemoteTrack) {
      // Attach with slight delay to ensure video element is ready
      requestAnimationFrame(() => stream.attach(videoEl));
      return () => {
        stream.detach(videoEl);
      };
    }

    if (stream instanceof MediaStream) {
      videoEl.srcObject = stream;
      videoEl.play().catch((err) => console.warn("Video play failed:", err));
    }
  }, [stream]);

  return (
    <div className={`${className} relative aspect-video overflow-hidden`}>
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover z-0"
        autoPlay
        playsInline
        muted={muted}
        style={{
          transform: mirror ? "scaleX(-1)" : "none",
        }}
      />
    </div>
  );
};
