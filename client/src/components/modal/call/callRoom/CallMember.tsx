import * as React from "react";
import { VideoStream } from "@/components/ui/streams/VideoStream";
import { VoiceStream } from "@/components/ui/streams/VoiceStream";
import { VoiceStreamWithVisualizer } from "@/components/ui/streams/VoiceStreamWithVisualizer";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { VoiceVisualizer } from "@/components/ui/streams/VoiceVisualizer";
import { Participant } from "livekit-client";
import { useRemoteTracks } from "@/common/hooks/mediaStreams/useRemoteTracks";
import { useResolvedTheme } from "@/stores/themeStore";
import { ResolvedTheme } from "@/shared/types/enums/theme.enum";
import { useTranslation } from "react-i18next";
import callManDarkImage from "@/assets/image/call-man-dark.png";
import callManLightImage from "@/assets/image/call-man-light.png";

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
  const { t } = useTranslation();

  const { videoTrack, audioTrack, screenTrack } = useRemoteTracks(participant);
  const resolvedTheme = useResolvedTheme();

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
    participant.name || participant.identity || t("common.messages.unknown");

  // Derived states
  const hasVideo = !!(videoTrack || screenTrack);
  const isMuted = !audioTrack;
  const isShowingScreen = !!screenTrack;

  const callManImage =
    resolvedTheme === ResolvedTheme.DARK ? callManDarkImage : callManLightImage;

  return (
    <div
      className={`relative w-full h-full overflow-hidden bg-(--border-color) text-(--text-color) flex items-center justify-center ${className}`}
    >
      <div
        className="absolute inset-0 w-full h-full flex items-center justify-center bg-(--border-color)"
        style={{ zIndex: 0 }}
      >
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
            className="z-0"
            objectCover
            mirror
          />

          {/* Audio with visualizer */}
          {audioTrack && (
            <VoiceStreamWithVisualizer
              stream={audioTrack}
              muted={isMuted}
              showVisualizer={showVoiceVisualizer}
              visualizerWidth={200}
              visualizerHeight={40}
              isBorder={true}
            />
          )}

          {/* Screen share indicator */}
          {isShowingScreen && (
            <div
              className="absolute top-2 left-2 bg-blue-600/80 px-2 py-1 rounded text-xs"
              style={{ zIndex: 1 }}
            >
              🖥️ {t("call.screen_sharing")}
            </div>
          )}
        </>
      ) : (
        // Audio-only participant
        <div className="flex flex-col gap-2 items-center justify-center p-4 relative">
          {audioTrack && <VoiceStream stream={audioTrack} muted={isMuted} />}
          <div className="relative flex items-center justify-center rounded-full!">
            {showVoiceVisualizer && audioTrack && !isMuted && (
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ zIndex: 0 }}
              >
                <VoiceVisualizer
                  stream={audioTrack}
                  isMuted={isMuted}
                  size={100}
                  circleColor="grey"
                  className="custom-border"
                />
              </div>
            )}
            <Avatar
              avatarUrl={avatarUrl}
              name={displayName}
              size={24}
              className="z-10 relative bg-(--message-color)"
            />
          </div>

          <p
            className="text-lg font-medium text-center relative"
            style={{ zIndex: 1 }}
          >
            {displayName}
          </p>
        </div>
      )}

      {/* Overlay name */}
      <div
        className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm"
        style={{ zIndex: 1 }}
      >
        {displayName}
        {isMuted && " 🔇"}
        {isShowingScreen && " 🖥️"}
      </div>
    </div>
  );
};

export default React.memo(CallMember);
