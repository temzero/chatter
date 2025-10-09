import { useRef } from "react";
import { Button } from "../Button";
import { ChatResponse } from "@/types/responses/chat.response";
import { VideoStream } from "./components/VideoStream";
import { useCallStore } from "@/stores/callStore/callStore";
import { useModalStore } from "@/stores/modalStore";
import { VoiceVisualizerButton } from "../VoiceVisualizerBtn";
import { useLocalPreviewVoiceTrack } from "@/hooks/mediaStreams/useLocalPreviewVoiceTrack";
import { useLocalPreviewVideoTrack } from "@/hooks/mediaStreams/useLocalPreviewVideoTrack";
import { useLocalPreviewScreenTrack } from "@/hooks/mediaStreams/useLocalPreviewScreenTrack";
import CallHeader from "./components/CallHeader";
import { useDeviceStore } from "@/stores/deviceStore";
import { motion } from "framer-motion";

const BroadcastPreviewModal = ({ chat }: { chat: ChatResponse }) => {
  const isMobile = useDeviceStore((state) => state.isMobile);

  const startCall = useCallStore((state) => state.startCall);
  const endCall = useCallStore((state) => state.endCall);
  const closeModal = useModalStore.getState().closeModal;

  const { localVoiceStream, isVoiceEnabled, toggleVoice, stopVoice } =
    useLocalPreviewVoiceTrack(true);
  const { localVideoStream, isVideoEnabled, toggleVideo, stopVideo } =
    useLocalPreviewVideoTrack(true);
  const { localScreenStream, isScreenEnabled, toggleScreen, stopScreen } =
    useLocalPreviewScreenTrack(false, { stopOnUnmount: false });

  // ref for draggable constraints
  const containerRef = useRef<HTMLDivElement | null>(null);

  const startBroadcast = async () => {
    try {
      await startCall(chat.id, isVideoEnabled, {
        screenStream: localScreenStream,
      });
    } catch (err) {
      console.error("[BroadcastPreviewModal] Failed to start broadcast:", err);
    }
  };

  const cancelCall = () => {
    stopVoice();
    stopVideo();
    stopScreen();

    endCall({ isCancel: true });
    closeModal();
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full p-10 flex flex-col items-center justify-between relative overflow-hidden"
    >
      {/* Mobile Background Video */}
      {isMobile && isVideoEnabled && localVideoStream && (
        <VideoStream
          stream={localVideoStream}
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
          mirror
        />
      )}

      {/* Foreground Content */}
      <div className="relative z-10 flex flex-col items-center justify-between w-full h-full">
        {/* Header */}
        <CallHeader chat={chat} />
        <motion.p
          className="flex items-center gap-1 opacity-60 mt-2 mb-4 bg-[--border-color] rounded-full p-1 pr-2"
          animate={{
            opacity: [1, 0.6, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
            repeatDelay: 1,
          }}
        >
          <span className="material-symbols-outlined">info</span>
          Check your mic, webcam, and screen before broadcasting
        </motion.p>

        <div
          className={`flex items-center justify-center gap-4 w-full h-[200px] rounded-md ${
            isMobile ? "flex-col" : ""
          }`}
        >
          {/* Screen Share Preview */}
          {isScreenEnabled && localScreenStream && (
            <VideoStream
              stream={localScreenStream}
              className="flex-1 rounded-xl custom-border z-10"
              objectCover
            />
          )}

          {/* Local Video Preview (not background) */}
          {!isMobile && isVideoEnabled && localVideoStream && (
            <div className="h-full aspect-square rounded-full overflow-hidden custom-border z-10">
              <VideoStream stream={localVideoStream} objectCover mirror />
            </div>
          )}
        </div>

        <div className="flex justify-center gap-4 my-6 z-10">
          <Button
            variant="ghost"
            className={`w-12 h-12 bg-black/20 ${
              isScreenEnabled ? "!bg-[--primary-green]" : ""
            }`}
            icon={isScreenEnabled ? "tv" : "tv_off"}
            isIconFilled={isScreenEnabled}
            isRoundedFull
            onClick={() => toggleScreen()}
          />
          <Button
            variant="ghost"
            className={`w-12 h-12 bg-black/20 ${
              isVideoEnabled ? "!bg-[--primary-green]" : ""
            }`}
            icon={isVideoEnabled ? "videocam" : "videocam_off"}
            isIconFilled={isVideoEnabled}
            isRoundedFull
            onClick={() => toggleVideo()}
          />
          <VoiceVisualizerButton
            variant="ghost"
            isMuted={!isVoiceEnabled}
            stream={localVoiceStream ?? null}
            onClick={() => toggleVoice()}
            circleColor="var(--primary-green)"
            className={`w-12 h-12 rounded-full ${
              isVoiceEnabled ? "bg-black/20" : ""
            }`}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-4 w-full z-10">
          <Button
            variant="primary"
            icon="play_arrow"
            fullWidth
            isIconFilled={true}
            onClick={startBroadcast}
          >
            Start Broadcast
          </Button>
          <Button
            variant="transparent"
            className="text-white hover:text-black"
            fullWidth
            onClick={cancelCall}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BroadcastPreviewModal;
