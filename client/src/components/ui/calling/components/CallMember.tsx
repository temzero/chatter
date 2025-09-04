// components/call/CallMember.tsx
import React, { useEffect, useMemo, useState } from "react";
import { VideoStream } from "./VideoStream";
import { VoiceStream } from "./VoiceStream";
import { VoiceVisualizerBar } from "../../VoiceVisualizerBar";
import { Avatar } from "../../avatar/Avatar";
import { useChatMemberStore } from "@/stores/chatMemberStore";
import { ChatMember } from "@/types/responses/chatMember.response";
import { VoiceVisualizer } from "../../VoiceVisualizer";
import { callMember } from "@/types/store/callMember.type";

const CallMember = ({
  member,
  showVoiceVisualizer = true,
  className = "",
}: {
  member: callMember;
  showVoiceVisualizer?: boolean;
  className?: string;
}) => {
  const [chatMember, setChatMember] = useState<ChatMember | null>(null);
  const getChatMember = useChatMemberStore((state) => state.getChatMember);

  // Debug logs
  console.log(
    `🎙️ Member isMuted: ${member.isMuted}, Member voiceStream:`,
    member.voiceStream
  );
  console.log(
    `🎥 Video enabled: ${member.isVideoEnabled}, 🎥 videoStream: ${member.videoStream}`
  );

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

  // Fetch chat member info
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
      {/* Background avatar image with opacity */}
      {chatMember?.avatarUrl && (
        <img
          src={chatMember?.avatarUrl}
          alt={displayName}
          className="absolute inset-0 w-full h-full object-cover opacity-20 z-0"
        />
      )}

      {/* Video participant */}
      {member.isVideoEnabled && member.videoStream ? (
        <>
          <VideoStream
            stream={member.videoStream}
            className="absolute inset-0 w-full h-full object-cover z-0"
          />

          {/* Voice stream (audio only) */}
          <VoiceStream stream={member.voiceStream} muted={member.isMuted} />

          {/* Voice visualizer (bars) */}
          {showVoiceVisualizer && member.voiceStream && !member.isMuted && (
            <VoiceVisualizerBar
              stream={member.voiceStream}
              isMuted={member.isMuted}
              width={200}
              height={40}
              className="w-full h-10 opacity-50 absolute bottom-16 left-0 z-10"
              barColor="white"
            />
          )}

          {/* Fallback if no active voice stream */}
          {showVoiceVisualizer &&
            (!member.voiceStream || !member.voiceStream.active) && (
              <div className="absolute inset-0 flex items-center justify-center z-0">
                <div className="w-48 h-48 border-4 border-red-400 rounded-full opacity-50" />
              </div>
            )}
        </>
      ) : (
        /* Audio-only participant (avatar + circle visualizer) */
        <div className="flex flex-col gap-2 items-center justify-center p-4 relative">
          <VoiceStream stream={member.voiceStream} muted={member.isMuted} />

          {/* Voice visualizer around avatar */}
          <div className="relative flex items-center justify-center">
            {showVoiceVisualizer && member.voiceStream && (
              <div className="absolute inset-0 flex items-center justify-center">
                <VoiceVisualizer
                  stream={member.voiceStream}
                  isMuted={member.isMuted ?? false}
                  size={101}
                  circleColor="grey"
                  className="custom-border"
                />
              </div>
            )}
            {/* {showVoiceVisualizer &&
              (!member.voiceStream || !member.voiceStream.active) && (
                <div className="absolute inset-0 flex items-center justify-center z-0">
                  <div className="w-48 h-48 border-2 border-gray-400 rounded-full opacity-50" />
                </div>
              )} */}
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

      {/* Overlay name (works for both video and audio) */}
      <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-sm">
        {displayName}
        {member.isMuted && " 🔇"}
      </div>
    </div>
  );
};

export default React.memo(CallMember);
