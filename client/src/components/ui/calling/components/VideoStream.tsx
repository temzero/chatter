import { useEffect, useRef } from "react";

// VideoStream component implementation
export const VideoStream = ({
  stream,
  className = "",
  muted = false,
}: {
  stream: MediaStream | null;
  className?: string;
  muted?: boolean;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      className={className}
      autoPlay
      playsInline
      muted={muted}
    />
  );
};