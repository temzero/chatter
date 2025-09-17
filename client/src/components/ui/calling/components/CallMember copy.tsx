// components/call/CallMember.tsx
import React, { useEffect, useMemo, useState } from "react";
import { VideoStream } from "./VideoStream";
import { VoiceStream } from "./VoiceStream";
import { VoiceStreamWithVisualizer } from "./VoiceStreamWithVisualizer";
import { Avatar } from "../../avatar/Avatar";
import { useChatMemberStore } from "@/stores/chatMemberStore";
import { ChatMember } from "@/types/responses/chatMember.response";
import { VoiceVisualizer } from "../../VoiceVisualizer";
import { callMember } from "@/stores/callStore/sfuCallStore";

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
  const getChatMemberById = useChatMemberStore(
    (state) => state.getChatMemberById
  );

  // Fetch chat member info
  useEffect(() => {
    const fetchMember = async () => {
      try {
        const result = await getChatMemberById(member.memberId, true);
        setChatMember(result || null);
      } catch (error) {
        console.error("Failed to fetch chat member:", error);
        setChatMember(null);
      }
    };
    fetchMember();
  }, [member.memberId, getChatMemberById]);

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

  // Determine which video to show: screen share takes priority over camera
  const activeVideoTrack = member.videoStream || member.screenStream;
  const activeVoiceTrack = member.voiceStream || null;
  const isShowingScreen = !!member.screenStream;
  const hasVideo = member.isVideoEnabled && activeVideoTrack;

  console.log("activeVoiceTrack", activeVoiceTrack);
  console.log("activeVideoTrack", activeVideoTrack);

  return (
    <div
      className={`relative w-full h-full overflow-hidden bg-black flex items-center justify-center ${className}`}
    >
      {/* Background avatar image with opacity - only show if no video */}
      {chatMember?.avatarUrl && !hasVideo && (
        <img
          src={chatMember.avatarUrl}
          alt={displayName}
          className="absolute inset-0 w-full h-full object-cover opacity-20 z-0"
        />
      )}

      {/* Video participant (camera or screen share) */}
      {hasVideo ? (
        <>
          <VideoStream
            stream={activeVideoTrack}
            className="absolute inset-0 w-full h-full object-cover z-0"
          />

          {activeVoiceTrack && (
            <VoiceStreamWithVisualizer
              stream={activeVoiceTrack}
              muted={member.isMuted}
              showVisualizer={showVoiceVisualizer}
              visualizerWidth={200}
              visualizerHeight={40}
              visualizerColor="white"
            />
          )}

          {/* Screen share indicator */}
          {isShowingScreen && (
            <div className="absolute top-2 left-2 bg-blue-600/80 px-2 py-1 rounded text-xs z-10">
              🖥️ Screen Sharing
            </div>
          )}
        </>
      ) : (
        /* Audio-only participant (avatar + circle visualizer) */
        <div className="flex flex-col gap-2 items-center justify-center p-4 relative">
          {activeVoiceTrack && (
            <VoiceStream stream={activeVoiceTrack} muted={member.isMuted} />
          )}

          {/* Voice visualizer around avatar */}
          <div className="relative flex items-center justify-center">
            {showVoiceVisualizer && activeVoiceTrack && !member.isMuted && (
              <div className="absolute inset-0 flex items-center justify-center">
                <VoiceVisualizer
                  stream={activeVoiceTrack}
                  isMuted={member.isMuted ?? false}
                  size={101}
                  circleColor="grey"
                  className="custom-border"
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

      {/* Overlay name (works for both video and audio) */}
      <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-sm z-10">
        {displayName}
        {member.isMuted && " 🔇"}
        {isShowingScreen && " 🖥️"}
      </div>
    </div>
  );
};

export default React.memo(CallMember);
