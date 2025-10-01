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
  const { videoTrack, audioTrack, screenTrack } = useRemoteTracks(participant);

  // Screen + Camera
  if (screenTrack && videoTrack) {
    return (
      <div className={`relative w-full h-full ${className}`}>
        <VideoStream
          stream={screenTrack}
          className="w-full h-full object-cover z-0"
        />
        <DraggableContainer containerRef={containerRef} position="bottom-right">
          <UserCamera videoStream={videoTrack} audioStream={audioTrack} />
        </DraggableContainer>
      </div>
    );
  }

  // Only Screen
  if (screenTrack) {
    return (
      <div className={`relative w-full h-full ${className}`}>
        <VideoStream
          stream={screenTrack}
          className="w-full h-full object-cover z-0"
        />
        {audioTrack && <VoiceStream stream={audioTrack} />}
      </div>
    );
  }

  // Only Camera
  if (videoTrack) {
    return (
      <div className={`relative w-full h-full ${className}`}>
        <VideoStream
          stream={videoTrack}
          className="w-full h-full object-cover z-0"
          mirror
        />
        {audioTrack && <VoiceStream stream={audioTrack} />}
      </div>
    );
  }

  // Only Audio or nothing
  if (audioTrack) {
    return <VoiceStream stream={audioTrack} />;
  }

  return null;
};

export default React.memo(BroadcastStream);
