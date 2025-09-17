// hooks/useLocalPreviewVideoTrack.ts
import { useState, useEffect, useRef, useCallback } from "react";

interface LocalPreviewVideoStream {
  videoStream: MediaStream | null;
  toggleVideo: () => void;
  isVideoEnabled: boolean;
}

export const useLocalPreviewVideoTrack = (): LocalPreviewVideoStream => {
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  const videoTrackRef = useRef<MediaStreamTrack | null>(null);

  useEffect(() => {
    let mounted = true;

    const initVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });

        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        const videoTrack = stream.getVideoTracks()[0];
        videoTrackRef.current = videoTrack;
        setVideoStream(new MediaStream(videoTrack ? [videoTrack] : []));
      } catch (err) {
        console.error("Failed to get local video stream:", err);
      }
    };

    initVideo();

    return () => {
      mounted = false;
      if (videoTrackRef.current) videoTrackRef.current.stop();
    };
  }, []);

  const toggleVideo = useCallback(() => {
    if (videoTrackRef.current) {
      const enabled = !videoTrackRef.current.enabled;
      videoTrackRef.current.enabled = enabled;
      setIsVideoEnabled(enabled);
    }
  }, []);

  return {
    videoStream,
    toggleVideo,
    isVideoEnabled,
  };
};
