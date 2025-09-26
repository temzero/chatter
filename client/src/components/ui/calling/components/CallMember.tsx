import React from "react";
import { VideoStream } from "./VideoStream";
import { VoiceStream } from "./VoiceStream";
import { VoiceStreamWithVisualizer } from "./VoiceStreamWithVisualizer";
import { Avatar } from "../../avatar/Avatar";
import { VoiceVisualizer } from "../../VoiceVisualizer";
import { Participant } from "livekit-client";
import { useRemoteTracks } from "@/hooks/mediaStreams/useRemoteTracks";
import callManImage from "@/assets/image/call-man.png";

interface CallMemberProps {
  participant: Participant;
  showVoiceVisualizer?: boolean;
  className?: string;
}

const CallMember = ({
  participant,
  showVoiceVisualizer = true,
  className = "",
}: CallMemberProps) => {
  // Use the custom hook for streams
  const { videoTrack, audioTrack, screenTrack } = useRemoteTracks(participant);

  // Parse metadata from participant
  const participantMetadata = React.useMemo(() => {
    try {
      return participant.metadata ? JSON.parse(participant.metadata) : {};
    } catch (error) {
      console.error("Failed to parse participant metadata:", error);
      return {};
    }
  }, [participant.metadata]);

  // Get avatarUrl and name
  const avatarUrl = participantMetadata.avatarUrl;
  const displayName =
    participant.name || participant.identity || "Unknown User";

  // Derived states
  const hasVideo = !!(videoTrack || screenTrack);
  const isMuted = !audioTrack;
  const isShowingScreen = !!screenTrack;

  return (
    <div
      className={`relative w-full h-full overflow-hidden bg-[--border-color] flex items-center justify-center ${className}`}
    >
      {/* Background avatar if no video */}
      {/* {avatarUrl && !hasVideo && (
        <img
          src={avatarUrl}
          alt={displayName}
          className="absolute inset-0 w-full h-full object-cover opacity-20 z-0"
        />
      )} */}
      {/* Background avatar or fallback icon if no video */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center z-0 bg-[--border-color]">
        {avatarUrl && !hasVideo ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
        ) : !hasVideo ? (
          <img
            src={callManImage}
            alt={displayName}
            className="absolute inset-0 w-full h-full object-cover opacity-80 blur"
          />
        ) : null}
      </div>

      {hasVideo ? (
        <>
          {/* Video or screen share */}
          <VideoStream
            stream={screenTrack || videoTrack!}
            className="absolute inset-0 w-full h-full object-cover z-0"
            mirror={true}
          />

          {/* Audio with visualizer */}
          {audioTrack && (
            <VoiceStreamWithVisualizer
              stream={audioTrack}
              muted={isMuted}
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
        // Audio-only participant
        <div className="flex flex-col gap-2 items-center justify-center p-4 relative">
          {audioTrack && <VoiceStream stream={audioTrack} muted={isMuted} />}

          <div className="relative flex items-center justify-center">
            {showVoiceVisualizer && audioTrack && !isMuted && (
              <div className="absolute inset-0 flex items-center justify-center">
                <VoiceVisualizer
                  stream={audioTrack}
                  isMuted={isMuted}
                  size={101}
                  circleColor="grey"
                  className="custom-border"
                />
              </div>
            )}
            <Avatar
              avatarUrl={avatarUrl}
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

      {/* Overlay name */}
      <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-sm z-10">
        {displayName}
        {isMuted && " 🔇"}
        {isShowingScreen && " 🖥️"}
      </div>
    </div>
  );
};

export default React.memo(CallMember);
