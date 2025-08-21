// components/call/CallMember.tsx
import { VideoStream } from "./VideoStream";
import { VoiceVisualizerBar } from "../../VoiceVisualizerBar";
import { Avatar } from "../../avatar/Avatar";
import type { CallMember as CallMemberType } from "@/stores/callStore";
import { useChatMemberStore } from "@/stores/chatMemberStore";

interface CallMemberProps {
  member: CallMemberType;
  showVoiceVisualizer?: boolean;
  className?: string;
}

export const CallMember = ({
  member,
  showVoiceVisualizer = true,
  className = "",
}: CallMemberProps) => {
  // const chatMember = useChatMemberStore
  //   .getState()
  //   .getChatMember(member.memberId);
  const getChatMember = useChatMemberStore((state) => state.getChatMember);
  const chatMember = getChatMember(member.memberId);
  const displayName =
    chatMember?.nickname ??
    ([chatMember?.firstName, chatMember?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() ||
      "Unknown User");
  console.log("chatMember", chatMember);

  return (
    <div
      className={`relative w-full h-full overflow-hidden bg-black flex items-center justify-center ${className}`}
    >
      {/* Video stream if available */}
      {member.videoStream ? (
        <>
          <VideoStream
            stream={member.videoStream}
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Voice visualizer for video participants */}
          {showVoiceVisualizer && member.voiceStream && (
            <VoiceVisualizerBar
              stream={member.voiceStream}
              isMuted={member.isMuted}
              width={200}
              height={40}
              className="w-full h-10 opacity-20 absolute bottom-16 left-0"
              barColor="white"
            />
          )}
        </>
      ) : (
        /* Avatar and name display when no video */
        <div className="flex flex-col gap-2 items-center justify-center p-4">
          <Avatar
            avatarUrl={chatMember?.avatarUrl}
            name={displayName}
            size="20"
          />
          <p className="text-lg font-medium text-center">{displayName}</p>
          {member.isMuted && (
            <p className="text-sm text-gray-400 mt-1">Muted</p>
          )}
        </div>
      )}

      {/* Display name overlay (for both video and audio) */}
      <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-sm">
        {displayName}
        {member.isMuted && " 🔇"}
      </div>

      {/* Audio indicator */}
      {member.voiceStream && !member.isMuted && (
        <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
      )}

      {/* Voice visualizer for audio-only participants */}
      {showVoiceVisualizer && member.voiceStream && !member.isMuted && (
        <VoiceVisualizerBar
          stream={member.voiceStream}
          width={150}
          height={30}
          className="absolute bottom-20 left-0 right-0 w-full h-8 opacity-20"
          barColor="white"
        />
      )}
    </div>
  );
};
