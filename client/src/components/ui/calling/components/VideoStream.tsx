import { useEffect, useRef } from "react";

export const VideoStream = ({
  stream,
  className = "",
  muted = false,
}: {
  stream: MediaStream | null;
  className?: string;
  muted?: boolean;
  showVisualizer?: boolean;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className={`${className} relative aspect-video overflow-hidden`}>
      {/* Video as background */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover z-0"
        autoPlay
        playsInline
        muted={muted}
      />
    </div>
  );
};
