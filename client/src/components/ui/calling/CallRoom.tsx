// Calling.tsx
import { ChatResponse } from "@/types/responses/chat.response";
import { Button } from "../Button";
import { VideoStream } from "./components/VideoStream";
import { useCallStore } from "@/stores/callStore";
import { callWebSocketService } from "@/lib/websocket/services/call.websocket.service";
import { CallHeader } from "./components/CallHeader";
import { Timer } from "../Timer";

export const CallRoom = ({ chat }: { chat: ChatResponse }) => {
  const {
    isVideoCall,
    localStream,
    remoteStreams,
    callStartTime,
    isMuted,
    isLocalVideoDisabled,
    toggleMute,
    toggleVideo,
  } = useCallStore();

  const endCall = useCallStore((state) => state.endCall);
  const closeCallModal = useCallStore((state) => state.closeCallModal);

  if (!chat) return null;
  console.log("Calling component rendered with chat:", chat);

  const handleEndCall = () => {
    callWebSocketService.endCall({ chatId: chat.id });
    endCall(true);
    closeCallModal();
  };

  const handleToggleMic = () => {
    toggleMute();
  };

  const handleToggleVideo = async () => {
    try {
      await toggleVideo();
    } catch (error) {
      console.error("Failed to toggle video:", error);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center text-white">
      {isVideoCall ? (
        <div className="relative w-full h-full bg-black">
          {/* Remote video streams */}
          <div className="w-full h-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {Object.entries(remoteStreams).map(([participantId, stream]) => (
              <VideoStream
                key={participantId}
                stream={stream}
                className="w-full h-full object-cover"
              />
            ))}
          </div>

          {/* Local video overlay */}
          {localStream && (
            <VideoStream
              stream={localStream}
              className="absolute bottom-4 right-4 w-52 h-52 rounded-md object-cover border-2 border-white"
              muted
            />
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
          <Timer startTime={callStartTime} />
          {isVideoCall && (
            <span className="material-symbols-outlined text-sm">videocam</span>
          )}
        </div>
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-6 z-10">
        <Button
          variant="ghost"
          className={`rounded-full p-3 ${
            isMuted
              ? "bg-red-500/50 hover:bg-red-600/50"
              : "bg-gray-700/50 hover:bg-gray-600/50"
          }`}
          icon={isMuted ? "mic_off" : "mic"}
          onClick={handleToggleMic}
        />
        {isVideoCall && (
          <Button
            variant="ghost"
            className={`rounded-full p-3 ${
              isLocalVideoDisabled
                ? "bg-red-500/50 hover:bg-red-600/50"
                : "bg-gray-700/50 hover:bg-gray-600/50"
            }`}
            icon={isLocalVideoDisabled ? "videocam_off" : "videocam"}
            onClick={handleToggleVideo}
          />
        )}
        <Button
          variant="danger"
          className="rounded-full p-3"
          onClick={handleEndCall}
          icon="call_end"
        />
      </div>
    </div>
  );
};
