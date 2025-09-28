// components/call-room/LocalVideoPreview.tsx
import { motion } from "framer-motion";
import { VideoStream } from "../VideoStream";
import { VoiceVisualizerBorder } from "@/components/ui/VoiceVisualizerBorder";
import { useState } from "react";

interface LocalVideoPreviewProps {
  videoStream: MediaStream | null;
  audioStream: MediaStream | null;
  isVideoEnabled: boolean;
  isMuted: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export const LocalVideoPreview = ({
  videoStream,
  audioStream,
  isVideoEnabled,
  isMuted,
  containerRef,
}: LocalVideoPreviewProps) => {
  const [isLarge, setIsLarge] = useState(false);

  if (!videoStream || !isVideoEnabled) return null;

  return (
    <motion.div
      className="absolute bottom-4 right-4 z-20 cursor-grab active:cursor-grabbing overflow-hidden rounded-full group"
      drag
      dragConstraints={containerRef}
      dragElastic={0.8}
      dragMomentum={false}
    >
      <VideoStream
        stream={videoStream}
        className={`${
          isLarge ? "w-80 h-80" : "w-52 h-52"
        } rounded-full object-cover border-4 border-[--input-border-color] shadow-xl transition-all duration-300`}
        muted
      />

      <VoiceVisualizerBorder
        stream={audioStream}
        isMuted={isMuted}
        color="lightgreen"
        isCircle={true}
        className="rounded-full"
      />

      <button
        onClick={() => setIsLarge((prev) => !prev)}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full p-4 bg-black/30 backdrop-blur w-10 h-10 flex items-center justify-center text-2xl font-bold"
      >
        <span className="material-symbols-outlined">
          {isLarge ? "hide" : "open_in_full"}
        </span>
      </button>

      <div className="absolute left-1/2 transform -translate-x-1/2 bottom-2">
        You {isMuted && "🔇"}
      </div>
    </motion.div>
  );
};
