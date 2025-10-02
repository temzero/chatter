// components/call-room/UserCamera.tsx
import { VideoStream } from "../VideoStream";
import { VoiceVisualizerBorder } from "@/components/ui/VoiceVisualizerBorder";
import { RemoteTrack } from "livekit-client";
import { useState } from "react";

interface UserCameraProps {
  videoStream: MediaStream | RemoteTrack | null;
  audioStream: MediaStream | RemoteTrack | null;
}

export const UserCamera = ({ videoStream, audioStream }: UserCameraProps) => {
  const [isLarge, setIsLarge] = useState(false);

  if (!videoStream) return null;

  return (
    <div
      className={`relative group transition-all ${
        isLarge ? "w-[360px] h-[360px]" : "w-40 h-40"
      } rounded-full overflow-hidden border-4 border-[--input-border-color] shadow-xl`}
    >
      <VideoStream
        stream={videoStream}
        className="rounded-full"
        objectCover
        muted
        mirror
      />

      {audioStream && (
        <VoiceVisualizerBorder
          stream={audioStream}
          color="lightgreen"
          isCircle
          className="rounded-full"
        />
      )}

      <button
        onClick={() => setIsLarge((prev) => !prev)}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full p-4 bg-black/30 backdrop-blur w-10 h-10 flex items-center justify-center text-2xl font-bold"
      >
        <span className="material-symbols-outlined">
          {isLarge ? "hide" : "open_in_full"}
        </span>
      </button>

      {!audioStream && (
        <h1 className="absolute left-1/2 -translate-x-1/2 bottom-0">🔇</h1>
      )}
    </div>
  );
};
