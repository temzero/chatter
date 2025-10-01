// components/call-room/LocalStreamPreview.tsx
import React from "react";
import { UserCamera } from "../callRoom/UserCamera";
import { VideoStream } from "../VideoStream";
import { DraggableContainer } from "../callRoom/DraggableContainer";

interface LocalStreamPreviewProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  localVideoStream: MediaStream | null;
  localAudioStream: MediaStream | null;
  localScreenStream: MediaStream | null;
}

export const LocalStreamPreview = ({
  containerRef,
  localVideoStream,
  localAudioStream,
  localScreenStream,
}: LocalStreamPreviewProps) => {
  if (localScreenStream && localVideoStream) {
    // Screen + camera
    return (
      <div className="w-full h-full flex-1 relative">
        <VideoStream
          stream={localScreenStream}
          className="w-full h-full object-cover z-0"
        />
        <DraggableContainer containerRef={containerRef} position="bottom-right">
          <UserCamera
            videoStream={localVideoStream}
            audioStream={localAudioStream}
          />
        </DraggableContainer>
      </div>
    );
  }

  if (localScreenStream) {
    // Only screen
    return (
      <VideoStream
        stream={localScreenStream}
        className="w-full h-full object-cover z-0"
      />
    );
  }

  if (localVideoStream) {
    return (
      <VideoStream
        stream={localVideoStream}
        className="w-full h-full object-cover z-0"
        mirror
      />
    );
  }

  return null;
};
