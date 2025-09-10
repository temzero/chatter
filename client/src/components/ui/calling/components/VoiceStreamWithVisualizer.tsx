// components/call/VoiceStream.tsx
import { useEffect, useRef, useMemo } from "react";
import { RemoteTrack } from "livekit-client";
import { VoiceVisualizerBar } from "../../VoiceVisualizerBar";

type VoiceStreamProps = {
  stream?: MediaStream | RemoteTrack | null;
  muted?: boolean;
  className?: string;
  showVisualizer?: boolean;
  visualizerWidth?: number;
  visualizerHeight?: number;
  visualizerColor?: string;
};

export const VoiceStreamWithVisualizer = ({
  stream,
  muted = false,
  className = "",
  showVisualizer = true,
  visualizerWidth = 200,
  visualizerHeight = 40,
  visualizerColor = "white",
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
      // LiveKit RemoteTrack
      mediaStream = new MediaStream([stream.mediaStreamTrack]);
      hasVideoTrack = stream.kind === "video";
    }

    return { mediaStream, hasVideoTrack };
  }, [stream]);

  // Attach MediaStream to <audio>
  // useEffect(() => {
  //   if (!audioRef.current || !mediaStream) return;

  //   const audioEl = audioRef.current;
  //   audioEl.srcObject = mediaStream;
  //   audioEl.muted = muted;

  //   audioEl
  //     .play()
  //     .catch((err) =>
  //       console.warn("Audio play failed (needs user interaction):", err)
  //     );

  //   return () => {
  //     audioEl.pause();
  //     audioEl.srcObject = null;
  //   };
  // }, [mediaStream, muted]);

  // Attach MediaStream to <audio>
  useEffect(() => {
    if (!audioRef.current || !mediaStream) return;

    // ✅ Enable all audio tracks
    mediaStream.getAudioTracks().forEach((track) => {
      track.enabled = true;
    });

    const audioEl = audioRef.current;
    audioEl.srcObject = mediaStream;
    audioEl.muted = muted;

    audioEl
      .play()
      .catch((err) =>
        console.warn("Audio play failed (needs user interaction):", err)
      );

    return () => {
      audioEl.pause();
      audioEl.srcObject = null;
    };
  }, [mediaStream, muted]);

  if (!mediaStream) return null;

  return (
    <div className={`absolute bottom-[74px] left-0 w-full ${className}`}>
      <audio ref={audioRef} autoPlay playsInline className="hidden" />
      {showVisualizer && !muted && !hasVideoTrack && (
        <VoiceVisualizerBar
          stream={mediaStream}
          isMuted={muted}
          width={visualizerWidth}
          height={visualizerHeight}
          barColor={visualizerColor}
          className="w-full h-[32px] opacity-40"
        />
      )}
    </div>
  );
};
