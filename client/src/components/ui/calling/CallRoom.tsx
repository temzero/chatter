import { ChatResponse } from "@/types/responses/chat.response";
import { Button } from "../Button";
import { VideoStream } from "./components/VideoStream";
import { useCallStore } from "@/stores/callStore";
import { callWebSocketService } from "@/lib/websocket/services/call.websocket.service";
import { CallHeader } from "./components/CallHeader";
import { Timer } from "../Timer";
import { VoiceVisualizerButton } from "../VoiceVisualizerBtn";
import { useShallow } from "zustand/shallow";
import CallMember from "./components/CallMember";

export const CallRoom = ({ chat }: { chat: ChatResponse }) => {
  const {
    callMembers,
    isMuted,
    isVideoEnable,
    localVoiceStream,
    localVideoStream,
    startedAt,
    toggleLocalVoice,
    toggleLocalVideo,
    endCall,
    closeCallModal,
  } = useCallStore(
    useShallow((state) => ({
      isMuted: state.isMuted,
      callMembers: state.callMembers,
      isVideoEnable: state.isVideoEnabled,
      isVideoCall: state.isVideoCall,
      localVoiceStream: state.localVoiceStream,
      localVideoStream: state.localVideoStream,
      startedAt: state.startedAt,
      toggleLocalVoice: state.toggleLocalVoice,
      toggleLocalVideo: state.toggleLocalVideo,
      endCall: state.endCall,
      closeCallModal: state.closeCallModal,
    }))
  );

  if (!chat) return null;

  const handleHangUp = () => {
    callWebSocketService.hangup({ chatId: chat.id });
    endCall();
    closeCallModal();
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center text-white">
      {callMembers.length > 0 ? (
        <div className="relative w-full h-full bg-black">
          {/* Display all call members */}
          <div
            className={`w-full h-full grid gap-2 auto-rows-fr ${
              callMembers.length === 1
                ? "grid-cols-1"
                : callMembers.length === 2
                ? "grid-cols-1 sm:grid-cols-2"
                : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
            }`}
          >
            {callMembers.map((member) => (
              <CallMember key={member.memberId} member={member} />
            ))}
          </div>
        </div>
      ) : (
        <CallHeader
          chat={chat}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
        />
      )}

      {/* Local video overlay */}
      {localVideoStream && isVideoEnable && (
        <div className="absolute bottom-4 right-4 z-20">
          <VideoStream
            stream={localVideoStream}
            className="w-52 h-52 rounded-md object-cover border-2 border-white"
            muted
          />
          <div className="absolute bottom-2 right-2 bg-black/50 px-2 py-1 rounded text-sm">
            You {isMuted && "🔇"}
          </div>
        </div>
      )}

      {/* Top overlay with timer & name */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <p className="text-sm truncate max-w-[200px]">{chat.name}</p>
        <div className="flex items-center gap-2">
          {callMembers.length > 1 && (
            <span className="text-xs text-gray-400">
              {callMembers.length} members
            </span>
          )}
          <Timer startTime={startedAt} />
        </div>
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-4 left-0 right-0 z-10">
        <div className="flex justify-center gap-6">
          <Button
            variant="ghost"
            className={`w-14 h-14 ${
              isVideoEnable
                ? "bg-gray-700/50 text-green-500 filled"
                : "bg-red-500/50 opacity-60"
            }`}
            icon={isVideoEnable ? "videocam" : "videocam_off"}
            isIconFilled={isVideoEnable}
            isRoundedFull
            onClick={toggleLocalVideo}
          />
          <VoiceVisualizerButton
            variant="ghost"
            isMuted={isMuted}
            stream={localVoiceStream || new MediaStream()}
            onClick={toggleLocalVoice}
            className="w-14 h-14 rounded-full"
          />
          <Button
            variant="ghost"
            className="hover:bg-red-500/50 w-14 h-14"
            isRoundedFull
            onClick={handleHangUp}
            icon="call_end"
          />
        </div>
      </div>
    </div>
  );
};
