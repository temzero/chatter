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
  isObjectCover: boolean;
}

export const LocalStreamPreview = ({
  containerRef,
  localVideoStream,
  localAudioStream,
  localScreenStream,
  isObjectCover = false,
}: LocalStreamPreviewProps) => {
  if (localScreenStream && localVideoStream) {
    // Screen + camera
    return (
      <div className="w-full h-full flex-1 relative">
        <VideoStream
          stream={localScreenStream}
          className="z-0"
          objectCover={isObjectCover}
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
      <VideoStream stream={localScreenStream} objectCover={isObjectCover} />
    );
  }

  if (localVideoStream) {
    // Only Camera
    return <VideoStream stream={localVideoStream} objectCover mirror />;
  }

  return null;
};
