import React from "react";
import { VideoStream } from "../VideoStream";
import { VoiceStream } from "../VoiceStream";
import { Participant } from "livekit-client";
import { useRemoteTracks } from "@/hooks/mediaStreams/useRemoteTracks";
import { DraggableContainer } from "../callRoom/DraggableContainer";
import { UserCamera } from "../callRoom/UserCamera";

interface BroadcastStreamProps {
  participant: Participant;
  containerRef: React.RefObject<HTMLDivElement | null>;
  className?: string;
}

export const BroadcastStream = ({
  participant,
  containerRef,
  className = "",
}: BroadcastStreamProps) => {
  const { audioTrack, videoTrack, screenTrack } = useRemoteTracks(participant);

  if (!audioTrack && !videoTrack && !screenTrack) return null;

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Screen or Camera */}
      {screenTrack ? (
        <VideoStream stream={screenTrack} />
      ) : videoTrack ? (
        <VideoStream stream={videoTrack} mirror />
      ) : null}

      {/* Draggable Camera overlay */}
      {screenTrack && videoTrack && (
        <DraggableContainer containerRef={containerRef} position="bottom-right">
          <UserCamera videoStream={videoTrack} audioStream={audioTrack} />
        </DraggableContainer>
      )}

      {/* Always render audio */}
      {audioTrack && <VoiceStream stream={audioTrack} />}
    </div>
  );
};

export default React.memo(BroadcastStream);
