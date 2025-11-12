// components/call/VoiceStream.tsx
import { useEffect, useRef, useMemo } from "react";
import { RemoteTrack } from "livekit-client";
import { VoiceVisualizerBar } from "@/components/ui/streams/VoiceVisualizerBar";
import { VoiceVisualizerBorder } from "@/components/ui/streams/VoiceVisualizerBorder"; // import the border visualizer
import logger from "@/common/utils/logger";

type VoiceStreamProps = {
  stream?: MediaStream | RemoteTrack | null;
  muted?: boolean;
  className?: string;
  showVisualizer?: boolean;
  isBorder?: boolean; // <-- new prop
  visualizerWidth?: number;
  visualizerHeight?: number;
  color?: string;
};

export const VoiceStreamWithVisualizer = ({
  stream,
  muted = false,
  className = "",
  showVisualizer = true,
  isBorder = false, // default: false
  visualizerWidth = 200,
  visualizerHeight = 40,
  color = "white",
}: VoiceStreamProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  // Convert RemoteTrack to MediaStream if needed and check for video tracks
  const { mediaStream, hasVideoTrack } = useMemo(() => {
    if (!stream) return { mediaStream: null, hasVideoTrack: false };

    let mediaStream: MediaStream | null = null;
    let hasVideoTrack = false;

    if (stream instanceof MediaStream) {
      mediaStream = stream;
      hasVideoTrack = stream.getVideoTracks().length > 0;
    } else if ("mediaStreamTrack" in stream) {
      mediaStream = new MediaStream([stream.mediaStreamTrack]);
      hasVideoTrack = stream.kind === "video";
    }

    return { mediaStream, hasVideoTrack };
  }, [stream]);

  // Attach MediaStream to <audio>
  useEffect(() => {
    if (!audioRef.current || !mediaStream) return;

    mediaStream.getAudioTracks().forEach((track) => {
      track.enabled = true;
    });

    const audioEl = audioRef.current;
    audioEl.srcObject = mediaStream;
    audioEl.muted = muted;

    audioEl
      .play()
      .catch((err) =>
        logger.warn("Audio play failed (needs user interaction):", err)
      );

    return () => {
      audioEl.pause();
      audioEl.srcObject = null;
    };
  }, [mediaStream, muted]);

  if (!mediaStream) return null;

  return (
    <div className={`absolute left-0 w-full h-full ${className}`}>
      <audio ref={audioRef} autoPlay playsInline className="hidden" />
      {showVisualizer &&
        !muted &&
        !hasVideoTrack &&
        (isBorder ? (
          <VoiceVisualizerBorder
            stream={mediaStream}
            isMuted={muted}
            className="w-full h-full"
          />
        ) : (
          <VoiceVisualizerBar
            stream={mediaStream}
            isMuted={muted}
            width={visualizerWidth}
            height={visualizerHeight}
            barColor={color}
            className="w-full h-[32px] opacity-40"
          />
        ))}
    </div>
  );
};
