// components/call-room/LocalStreamPreview.tsx
import React from "react";
import { LocalVideoPreview } from "./LocalVideoPreview";
import { VideoStream } from "../VideoStream";

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
        <LocalVideoPreview
          videoStream={localVideoStream}
          audioStream={localAudioStream}
          isVideoEnabled={true}
          isMuted={true}
          containerRef={containerRef}
        />
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
      />
    );
  }

  return null;
};
