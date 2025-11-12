import logger from "@/common/utils/logger";
import { useState, useEffect, useRef, useCallback } from "react";

interface LocalPreviewVideoStream {
  localVideoStream: MediaStream | null;
  toggleVideo: () => void;
  stopVideo: () => void;
  isVideoEnabled: boolean;
}

export const useLocalPreviewVideoTrack = (
  startEnabled: boolean = true,
  opts: { stopOnUnmount: boolean } = { stopOnUnmount: true }
): LocalPreviewVideoStream => {
  const [localVideoStream, setLocalVideoStream] = useState<MediaStream | null>(
    null
  );
  const [isVideoEnabled, setIsVideoEnabled] = useState(startEnabled);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop all tracks and release camera
  const cleanupStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setLocalVideoStream(null);
    setIsVideoEnabled(false);
  }, []);

  // Start video and request camera
  const startVideo = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      setLocalVideoStream(stream);
      setIsVideoEnabled(true);
    } catch (err) {
      logger.error("Failed to access camera:", err);
      setIsVideoEnabled(false);
    }
  }, []);

  useEffect(() => {
    if (startEnabled) {
      startVideo();
    }
    return () => {
      if (opts.stopOnUnmount) cleanupStream();
    };
  }, [startEnabled, startVideo, cleanupStream, opts.stopOnUnmount]);

  // Toggle video: stop or start camera
  const toggleVideo = useCallback(() => {
    if (isVideoEnabled) {
      // Stop the camera entirely
      cleanupStream();
    } else {
      // Request camera again
      startVideo();
    }
  }, [isVideoEnabled, cleanupStream, startVideo]);

  // Stop video permanently
  const stopVideo = useCallback(() => {
    cleanupStream();
  }, [cleanupStream]);

  return {
    localVideoStream,
    toggleVideo,
    stopVideo,
    isVideoEnabled,
  };
};
