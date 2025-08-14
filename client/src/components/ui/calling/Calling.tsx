import { ChatResponse } from "@/types/responses/chat.response";
import { Button } from "../Button";
import { VideoStream } from "./components/VideoStream";
import { useCallStore } from "@/stores/callStore";
import { CallTimer } from "./components/CallTimer";
import { callWebSocketService } from "@/lib/websocket/services/call.websocket.service";
import { CallHeader } from "./components/CallHeader";

export const Calling = ({ chat }: { chat: ChatResponse }) => {
  const { isVideoCall, localStream, remoteStream } = useCallStore();
  const endCall = useCallStore((state) => state.endCall);
  const closeCallModal = useCallStore((state) => state.closeCallModal);

  if (!chat) return null;

  const handleEndCall = () => {
    callWebSocketService.endCall({
      chatId: chat.id,
    });
    endCall(true);
    closeCallModal();
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center text-white">
      {/* Background Video Area - now relative */}

      {isVideoCall ? (
        <div className="relative w-full h-full bg-black">
          <VideoStream
            stream={remoteStream}
            className="w-full h-full object-cover"
          />
          <VideoStream
            stream={localStream}
            className="absolute bottom-4 right-4 w-32 h-48 rounded-md object-cover border-2 border-white"
            muted
          />
        </div>
      ) : (
        <CallHeader
          chat={chat}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
        />
      )}

      {/* Absolute positioned overlay content */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <CallTimer />
          {isVideoCall && (
            <span className="material-symbols-outlined text-sm">videocam</span>
          )}
        </div>
        <p className="text-sm truncate max-w-[160px]">{chat.name}</p>
      </div>

      {/* Absolute positioned controls */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-6 z-10">
        <Button
          variant="ghost"
          className="rounded-full p-3 bg-gray-700/50 hover:bg-gray-600/50"
          icon="mic"
        />
        <Button
          variant="ghost"
          className="rounded-full p-3 bg-gray-700/50 hover:bg-gray-600/50"
          icon="videocam"
        />
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
