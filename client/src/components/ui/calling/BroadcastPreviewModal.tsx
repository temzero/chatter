import { ChatResponse } from "@/types/responses/chat.response";
import { CallHeader } from "./components/CallHeader";
import { Button } from "../Button";
import { VideoStream } from "./components/VideoStream";
import { useCallStore } from "@/stores/callStore/callStore";
import { useModalStore } from "@/stores/modalStore";
import { useRef } from "react";
import { VoiceVisualizerButton } from "../VoiceVisualizerBtn";
import { useLocalPreviewVoiceTrack } from "@/hooks/mediaStreams/useLocalPreviewVoiceTrack";
import { useLocalPreviewVideoTrack } from "@/hooks/mediaStreams/useLocalPreviewVideoTrack";
import { useLocalPreviewScreenTrack } from "@/hooks/mediaStreams/useLocalPreviewScreenTrack";

export const BroadcastPreviewModal = ({ chat }: { chat: ChatResponse }) => {
  const endCall = useCallStore((state) => state.endCall);
  const closeModal = useModalStore.getState().closeModal;

  const { localVoiceStream, isVoiceEnabled, toggleVoice, stopVoice } =
    useLocalPreviewVoiceTrack(true);
  const { localVideoStream, isVideoEnabled, toggleVideo, stopVideo } =
    useLocalPreviewVideoTrack(true, { stopOnUnmount: false });
  const { localScreenStream, isScreenEnabled, toggleScreen, stopScreen } =
    useLocalPreviewScreenTrack(false, { stopOnUnmount: false });

  // ref for draggable constraints
  const containerRef = useRef<HTMLDivElement | null>(null);

  console.log("localVideoStream", localVideoStream);
  console.log("localScreenStream", localScreenStream);

  const startBroadcast = async () => {
    try {
      await useCallStore.getState().startCall(chat.id, isVideoEnabled, {
        screenStream: localScreenStream,
      });
    } catch (err) {
      console.error("[BroadcastPreviewModal] Failed to start broadcast:", err);
    }
  };

  const cancelCall = () => {
    // Stop all local tracks explicitly
    stopVoice();
    stopVideo();
    stopScreen();

    endCall({ isCancel: true });
    closeModal();
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center w-full h-full relative"
    >
      {/* Header */}
      <CallHeader chat={chat} />
      <p className="flex items-center gap-1 opacity-60 mt-2 mb-4 bg-[--border-color] rounded-full p-1 pr-2">
        <span className="material-symbols-outlined">info</span>
        Check your mic, webcam, and screen before broadcasting
      </p>
      <div className="flex items-center justify-center gap-4 w-full h-[200px] rounded-md">
        {/* Screen Share Preview */}
        {isScreenEnabled && localScreenStream && (
          <VideoStream
            stream={localScreenStream}
            className="flex-1 rounded-xl custom-border"
            objectCover
          />
        )}

        {/* Local Video Preview */}
        {isVideoEnabled && localVideoStream && (
          <div className="h-full aspect-square rounded-full overflow-hidden custom-border">
            <VideoStream stream={localVideoStream} objectCover mirror />
          </div>
        )}

        {!localVideoStream && !localScreenStream && (
          <span className="material-symbols-outlined opacity-50 text-6xl">
            close
          </span>
        )}
      </div>

      <div className="flex justify-center gap-4 my-6">
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

        {/* Mic toggle with visualizer */}
        <VoiceVisualizerButton
          variant="ghost"
          isMuted={!isVoiceEnabled}
          stream={localVoiceStream ?? null} // ⚠️ replace with mic stream if you add one
          onClick={() => toggleVoice()}
          circleColor="var(--primary-green)"
          className={`w-12 h-12 rounded-full ${
            isVoiceEnabled ? "bg-black/20" : ""
          }`}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-4 w-full">
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
  );
};
