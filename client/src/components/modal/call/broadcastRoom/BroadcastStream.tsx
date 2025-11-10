import React from "react";
import { VideoStream } from "@/components/ui/streams/VideoStream";
import { VoiceStream } from "@/components/ui/streams/VoiceStream";
import {
  Participant,
  RemoteTrack,
  RemoteTrackPublication,
  Track,
} from "livekit-client";
import { useRemoteTracks } from "@/common/hooks/mediaStreams/useRemoteTracks";
import { DraggableContainer } from "@/components/ui/layout/DraggableContainer";
import { UserCamera } from "@/components/ui/media/UserCamera";

interface BroadcastStreamProps {
  participant: Participant;
  containerRef: React.RefObject<HTMLDivElement | null>;
  className?: string;
  isObjectCover: boolean;
}

export const BroadcastStream = ({
  participant,
  containerRef,
  className = "",
  isObjectCover = false,
}: BroadcastStreamProps) => {
  const { audioTrack, videoTrack, screenTrack } = useRemoteTracks(participant);

  if (!audioTrack && !videoTrack && !screenTrack) {
    console.warn("No remote tracks");
    return;
  }

  // Check if the participant has a screen audio track
  const screenAudioPublication = participant
    .getTrackPublications()
    .find((pub) => pub.source === Track.Source.ScreenShareAudio) as
    | RemoteTrackPublication
    | undefined;

  const screenAudioTrack = screenAudioPublication?.track as RemoteTrack | null;

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Screen or Camera */}
      {screenTrack ? (
        <VideoStream stream={screenTrack} objectCover={isObjectCover} />
      ) : videoTrack ? (
        <VideoStream stream={videoTrack} objectCover={isObjectCover} mirror />
      ) : null}

      {/* Draggable Camera overlay */}
      {screenTrack && videoTrack && (
        <>
          <VideoStream stream={screenTrack} objectCover={isObjectCover} />
          <DraggableContainer
            containerRef={containerRef}
            position="bottom-right"
          >
            <UserCamera videoStream={videoTrack} audioStream={audioTrack} />
          </DraggableContainer>
        </>
      )}

      {/* Mic audio */}
      {audioTrack && <VoiceStream stream={audioTrack} />}

      {/* Screen share audio */}
      {screenAudioTrack && <VoiceStream stream={screenAudioTrack} />}
    </div>
  );
};

export default React.memo(BroadcastStream);
