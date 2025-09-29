// components/call-room/CallControls.tsx
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { VoiceVisualizerButton } from "@/components/ui/VoiceVisualizerBtn";
import { useCallStore } from "@/stores/callStore/callStore";

interface CallControlsProps {
  isVideoEnabled: boolean;
  isMuted: boolean;
  isScreenshare?: boolean;
  isEnableScreenshare?: boolean;
  audioStream: MediaStream | null;
  onLeaveCall: () => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export const CallControls = ({
  isVideoEnabled = false,
  isMuted = false,
  isScreenshare = false,
  isEnableScreenshare = false,
  audioStream,
  onLeaveCall,
  containerRef,
}: CallControlsProps) => {
  const toggleLocalVideo = useCallStore((state) => state.toggleLocalVideo);
  const toggleLocalVoice = useCallStore((state) => state.toggleLocalVoice);
  const toggleLocalScreenShare = useCallStore(
    (state) => state.toggleLocalScreenShare
  );

  return (
    <motion.div
      initial={{ x: "-50%" }}
      className="flex justify-center gap-4 p-3 absolute bottom-3 left-1/2 
             z-30 bg-black/10 shadow-2xl border-4 border-white/5 backdrop-blur-lg 
             rounded-full cursor-grab active:cursor-grabbing"
      drag
      dragConstraints={containerRef}
      dragElastic={0.8}
      dragMomentum={false}
    >
      {isEnableScreenshare && (
        <Button
          variant="ghost"
          className={`w-12 h-12 bg-black/20 ${
            isScreenshare ? "!bg-[--primary-green]" : ""
          }`}
          icon={isScreenshare ? "screen_share" : "stop_screen_share"}
          isIconFilled={isScreenshare}
          isRoundedFull
          onClick={() => toggleLocalScreenShare()}
        />
      )}

      <Button
        variant="ghost"
        className={`w-12 h-12 bg-black/20 ${
          isVideoEnabled ? "!bg-[--primary-green]" : ""
        }`}
        icon={isVideoEnabled ? "videocam" : "videocam_off"}
        isIconFilled={isVideoEnabled}
        isRoundedFull
        onClick={() => toggleLocalVideo()}
      />

      <VoiceVisualizerButton
        variant="ghost"
        isMuted={isMuted}
        stream={audioStream}
        onClick={() => toggleLocalVoice()}
        circleColor="var(--primary-green)"
        className={`w-12 h-12 rounded-full ${!isMuted && "bg-black/20"} `}
      />

      <Button
        variant="ghost"
        className="w-12 h-12 text-red-400 hover:text-white/90 hover:bg-red-500"
        isIconFilled={true}
        isRoundedFull
        onClick={onLeaveCall}
        icon="call_end"
      />
    </motion.div>
  );
};
