import { ChatResponse } from "@/types/responses/chat.response";
import { Button } from "../Button";
import { VideoStream } from "./components/VideoStream";
import { useCallStore } from "@/stores/callStore";
import { CallTimer } from "./components/CallTimer";

export const CallActiveUI = ({
  chat,
  onEnd,
}: {
  chat: ChatResponse;
  onEnd: () => void;
}) => {
  const { isVideoCall, localStream, remoteStream } = useCallStore();

  return (
    <>
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <CallTimer />
          {isVideoCall && (
            <span className="material-symbols-outlined text-sm">videocam</span>
          )}
        </div>
        <p className="text-sm truncate max-w-[160px]">{chat.name}</p>
      </div>

      {/* Main Video Area */}
      <div className="relative flex-1 w-full rounded-lg overflow-hidden bg-black">
        {isVideoCall ? (
          <>
            <VideoStream
              stream={remoteStream}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <VideoStream
              stream={localStream}
              className="absolute bottom-4 right-4 w-32 h-48 rounded-md object-cover border-2 border-white"
              muted
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-32 h-32 rounded-full bg-blue-500/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-6xl">person</span>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-6 mt-4">
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
          onClick={onEnd}
          icon="call_end"
        />
      </div>
    </>
  );
};
