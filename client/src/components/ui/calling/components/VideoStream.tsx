// components/call/components/VideoStream.tsx
import { useEffect, useRef } from "react";
import { RemoteTrack } from "livekit-client";

export const VideoStream = ({
  stream,
  className = "",
  muted = false,
}: {
  stream: MediaStream | RemoteTrack | null;
  className?: string;
  muted?: boolean;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    // Detach previous track if needed
    const videoEl = videoRef.current;
    if (stream instanceof RemoteTrack) {
      stream.attach(videoEl);
      return () => {
        stream.detach(videoEl);
      };
    } else if (stream instanceof MediaStream) {
      videoEl.srcObject = stream;
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
          transform: "scaleX(-1)",
        }}
      />
    </div>
  );
};
