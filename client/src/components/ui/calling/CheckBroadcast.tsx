import { ChatResponse } from "@/types/responses/chat.response";
import { CallHeader } from "./components/CallHeader";
import { BounceLoader } from "react-spinners";
import { Button } from "../Button";
import { VideoStream } from "./components/VideoStream";
import { useLocalPreviewVideoTrack } from "@/hooks/mediaStreams/useLocalPreviewVideoTrack";
import { useLocalPreviewScreenTrack } from "@/hooks/mediaStreams/useLocalPreviewScreenTrack";
import { useCallStore } from "@/stores/callStore/callStore";
import { useModalStore } from "@/stores/modalStore";
import { useRef } from "react";
import { VoiceVisualizerButton } from "../VoiceVisualizerBtn";
import { useLocalPreviewVoiceTrack } from "@/hooks/mediaStreams/useLocalPreviewVoiceTrack";

export const CheckBroadcast = ({ chat }: { chat: ChatResponse }) => {
  const endCall = useCallStore((state) => state.endCall);
  const closeModal = useModalStore.getState().closeModal;

  const { localVoiceStream, isVoiceEnabled, toggleVoice } =
    useLocalPreviewVoiceTrack(true);
  const { localVideoStream, isVideoEnabled, toggleVideo } =
    useLocalPreviewVideoTrack(true);
  const { localScreenStream, isScreenEnabled, toggleScreen } =
    useLocalPreviewScreenTrack(false);

  // ref for draggable constraints
  const containerRef = useRef<HTMLDivElement | null>(null);

  const startBroadcast = async () => {
    try {
      await useCallStore
        .getState()
        .startCall(chat.id, isVideoEnabled, isScreenEnabled);
    } catch (err) {
      console.error("[CheckBroadcast] Failed to start broadcast:", err);
    }
  };

  const cancelCall = () => {
    endCall({ isDeclined: true });
    closeModal();
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center w-full h-full relative"
    >
      {/* Header */}
      <CallHeader chat={chat} />
      <p className="text-sm text-gray-400 mt-1">
        Check your mic, webcam, and screen before broadcasting
      </p>

      <div className="flex items-center justify-center gap-2 mt-4 w-full h-[200px] rounded-md">
        {/* Local Video Preview */}
        {isVideoEnabled && localVideoStream && (
          <div className="h-full aspect-square rounded-full overflow-hidden custom-border">
            <VideoStream
              stream={localVideoStream}
              className="w-full h-full object-cover"
              muted
            />
          </div>
        )}

        {/* Screen Share Preview */}
        {isScreenEnabled && localScreenStream && (
          <VideoStream
            stream={localScreenStream}
            className="flex-1 h-full rounded-xl object-cover  custom-border"
            mirror={false}
            muted
          />
        )}

        {!isVideoEnabled && !isScreenEnabled && (
          <div className="flex items-center justify-center w-full h-full opacity-40">
            <span className="material-symbols-outlined text-4xl">close</span>
          </div>
        )}

        {/* Loading Animation */}
        {!localVideoStream && !localScreenStream && (
          <BounceLoader color="#8b8b8b" size={50} />
        )}
      </div>

      {/* Draggable Call Controls */}
      <div className="flex justify-center gap-4 mt-6">
        {/* Video toggle */}
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

        {/* Screen share toggle */}
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
      </div>

      {/* Actions */}
      <div className="flex gap-4 mt-6 w-full">
        <Button onClick={startBroadcast} variant="success" fullWidth>
          Start Broadcast
        </Button>
        <Button onClick={cancelCall} variant="danger" fullWidth>
          Cancel
        </Button>
      </div>
    </div>
  );
};
