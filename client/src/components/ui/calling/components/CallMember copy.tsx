// components/call/CallMember.tsx
import React from "react";
import { VideoStream } from "./VideoStream";
import { VoiceVisualizerBar } from "../../VoiceVisualizerBar";
import { Avatar } from "../../avatar/Avatar";
import type { CallMember as CallMemberType } from "@/stores/callStore";
import { useChatMemberStore } from "@/stores/chatMemberStore";
import { useEffect, useMemo, useState } from "react";
import { ChatMember } from "@/types/responses/chatMember.response";
import { VoiceVisualizer } from "../../VoiceVisualizer";

const CallMember = ({
  member,
  showVoiceVisualizer = true,
  className = "",
}: {
  member: CallMemberType;
  showVoiceVisualizer?: boolean;
  className?: string;
}) => {
  const [chatMember, setChatMember] = useState<ChatMember | null>(null);
  const getChatMember = useChatMemberStore((state) => state.getChatMember);

  console.log(`🎙️ Member voiceStream:`, member.voiceStream);
  console.log(`🎙️ Voice stream tracks:`, member.voiceStream?.getTracks());
  console.log(`🎙️ Voice stream active:`, member.voiceStream?.active);
  console.log(`🎙️ Voice stream id:`, member.voiceStream?.id);

  if (member.voiceStream) {
    member.voiceStream.getTracks().forEach((track, index) => {
      console.log(`🎙️ Track ${index}:`, {
        kind: track.kind,
        enabled: track.enabled,
        readyState: track.readyState,
        muted: track.muted,
        id: track.id,
      });
    });
  }

  // console.log(
  //   `🎥Video enabled: ${member.isVideoEnabled}, 🎥videoStream: ${member.videoStream}`
  // );

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const result = await getChatMember(member.memberId, true);
        setChatMember(result || null);
      } catch (error) {
        console.error("Failed to fetch chat member:", error);
        setChatMember(null);
      }
    };

    fetchMember();
  }, [member.memberId, getChatMember]);

  const displayName = useMemo(() => {
    return chatMember
      ? chatMember.nickname ??
          ([chatMember.firstName, chatMember.lastName]
            .filter(Boolean)
            .join(" ")
            .trim() ||
            "Unknown User")
      : "Unknown User";
  }, [chatMember]);

  return (
    <div
      className={`relative w-full h-full overflow-hidden bg-black flex items-center justify-center ${className}`}
    >
      {chatMember?.avatarUrl && (
        <img
          src={chatMember?.avatarUrl}
          alt={displayName}
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
      )}
      {/* Video stream if available */}
      {member.isVideoEnabled && member.videoStream ? (
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
        <div className="flex flex-col gap-2 items-center justify-center p-4 relative">
          {/* Voice visualizer behind avatar */}
          <div className="relative flex items-center justify-center">
            {showVoiceVisualizer && member.voiceStream && (
              <div className="absolute inset-0 flex items-center justify-center z-0">
                <VoiceVisualizer
                  stream={member.voiceStream}
                  isMuted={false}
                  // isMuted={member.isMuted ?? false}
                  size={200}
                  circleColor="grey"
                />
              </div>
            )}

            <Avatar
              avatarUrl={chatMember?.avatarUrl}
              name={displayName}
              size="24"
              className="z-10 relative"
            />
          </div>

          <p className="text-lg font-medium text-center relative z-10">
            {displayName}
          </p>
        </div>
      )}

      {/* Display name overlay (for both video and audio) */}
      <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-sm">
        {displayName}
        {member.isMuted && " 🔇"}
      </div>
    </div>
  );
};

export default React.memo(CallMember);
