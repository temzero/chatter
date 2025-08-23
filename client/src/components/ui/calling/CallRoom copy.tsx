import { ChatResponse } from "@/types/responses/chat.response";
import { Button } from "../Button";
import { VideoStream } from "./components/VideoStream";
import { useCallStore } from "@/stores/callStore";
import { callWebSocketService } from "@/lib/websocket/services/call.websocket.service";
import { CallHeader } from "./components/CallHeader";
import { Timer } from "../Timer";
import { VoiceVisualizerBar } from "../VoiceVisualizerBar";
import { VoiceVisualizerButton } from "../VoiceVisualizerBtn";

export const CallRoom = ({ chat }: { chat: ChatResponse }) => {
  const {
    isVideoCall,
    localStream,
    remoteStreams,
    callStartTime,
    isMuted,
    toggleLocalVoice,
    switchCallType,
  } = useCallStore();

  const endCall = useCallStore((state) => state.endCall);
  const closeCallModal = useCallStore((state) => state.closeCallModal);

  if (!chat) return null;

  const handleEndCall = () => {
    callWebSocketService.endCall({ chatId: chat.id });
    endCall(true);
    closeCallModal();
  };

  const handleToggleMic = () => {
    toggleLocalVoice();
  };

  const handleToggleVideo = async () => {
    try {
      await switchCallType();
    } catch (error) {
      console.error("Failed to toggle video:", error);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center text-white">
      {isVideoCall ? (
        <div className="relative w-full h-full bg-black">
          {/* Remote video streams */}
          <div
            className={`w-full h-full grid gap-2 auto-rows-fr ${
              Object.keys(remoteStreams).length === 1
                ? "grid-cols-1"
                : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
            }`}
          >
            {Object.entries(remoteStreams).map(([participantId, stream]) => (
              <div
                key={participantId}
                className="relative w-full overflow-hidden"
              >
                {/* Aspect-ratio wrapper to control height cleanly */}
                <VideoStream
                  stream={stream}
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {Object.keys(remoteStreams).length === 1 && (
                  <VoiceVisualizerBar
                    stream={stream}
                    isMuted={false}
                    width={200}
                    height={40}
                    className="w-full h-10 opacity-20 absolute bottom-16 left-0"
                    barColor="white"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Local video overlay */}
          {localStream && (
            <div className="absolute bottom-4 right-4">
              <VideoStream
                stream={localStream}
                className="w-52 h-52 rounded-md object-cover border-2 border-white"
                muted
              />
            </div>
          )}
        </div>
      ) : (
        <CallHeader
          chat={chat}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
        />
      )}

      {/* Top overlay with timer & name */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <p className="text-sm truncate max-w-[200px]">{chat.name}</p>
        <div className="flex items-center gap-2">
          {isVideoCall && (
            <span className="material-symbols-outlined">videocam</span>
          )}
          <Timer startTime={callStartTime} />
        </div>
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-4 left-0 right-0 z-10">
        <div className="flex justify-center gap-6">
          <Button
            variant="ghost"
            className={`w-14 h-14 ${
              isVideoCall
                ? "bg-gray-700/50  text-green-500"
                : " bg-red-500/50 opacity-60"
            }`}
            icon={isVideoCall ? "videocam" : "videocam_off"}
            isRoundedFull
            onClick={handleToggleVideo}
          />
          <VoiceVisualizerButton
            variant="ghost"
            stream={localStream}
            isMuted={isMuted}
            onClick={handleToggleMic}
            className="w-14 h-14 custom-border rounded-full"
          />
          <Button
            variant="ghost"
            className="hover:bg-red-500/50 w-14 h-14"
            isRoundedFull
            onClick={handleEndCall}
            icon="call_end"
          />
        </div>
      </div>
    </div>
  );
};
