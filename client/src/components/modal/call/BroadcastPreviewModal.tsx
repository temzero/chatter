import { useRef } from "react";
import { motion } from "framer-motion";
import { ChatResponse } from "@/shared/types/responses/chat.response";
import { callAnimations } from "@/common/animations/callAnimations";
import { VideoStream } from "@/components/ui/streams/VideoStream";
import { useCallStore } from "@/stores/callStore";
import { getCloseModal } from "@/stores/modalStore";
import { VoiceVisualizerButton } from "@/components/ui/streams/VoiceVisualizerBtn";
import { useLocalPreviewVoiceTrack } from "@/common/hooks/mediaStreams/useLocalPreviewVoiceTrack";
import { useLocalPreviewVideoTrack } from "@/common/hooks/mediaStreams/useLocalPreviewVideoTrack";
import { useLocalPreviewScreenTrack } from "@/common/hooks/mediaStreams/useLocalPreviewScreenTrack";
import { useIsMobile } from "@/stores/deviceStore";
import { useTranslation } from "react-i18next";
import CallHeader from "./components/CallHeader";
import Button from "@/components/ui/buttons/Button";

const BroadcastPreviewModal = ({ chat }: { chat: ChatResponse }) => {
  const { t } = useTranslation();

  const isMobile = useIsMobile();

  const startCall = useCallStore.getState().startCall;
  const endCall = useCallStore.getState().endCall;
  const closeModal = getCloseModal();

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
          {...callAnimations.titlePulse([1, 0.6, 1])}
        >
          <span className="material-symbols-outlined">info</span>
          {t("call.broadcast.check_devices")}
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
            {t("call.start_broadcast")}
          </Button>
          <Button
            variant="transparent"
            className="text-white hover:text-black"
            fullWidth
            onClick={cancelCall}
          >
            {t("common.actions.cancel")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BroadcastPreviewModal;
