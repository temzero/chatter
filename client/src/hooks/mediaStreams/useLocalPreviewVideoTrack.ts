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

  // Stop all tracks safely
  const cleanupStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setLocalVideoStream(null);
    setIsVideoEnabled(false);
  }, []);

  // Initialize video
  useEffect(() => {
    let mounted = true;

    const initVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });

        if (!mounted) {
          // Stop immediately if component unmounted
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        setLocalVideoStream(stream);
        setIsVideoEnabled(true);
      } catch (err) {
        console.error("Failed to get video stream:", err);
        setIsVideoEnabled(false);
      }
    };

    if (startEnabled) {
      initVideo();
    }

    return () => {
      mounted = false;
      if (opts.stopOnUnmount) cleanupStream();
    };
  }, [startEnabled, opts.stopOnUnmount, cleanupStream]);

  const toggleVideo = useCallback(() => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  }, []);

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
