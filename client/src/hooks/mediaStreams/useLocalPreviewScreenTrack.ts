// hooks/useLocalPreviewScreenTrack.ts
import { useState, useEffect, useRef, useCallback } from "react";

interface LocalPreviewScreenStream {
  localScreenStream: MediaStream | null;
  toggleScreen: () => void;
  isScreenEnabled: boolean;
}

export const useLocalPreviewScreenTrack = (
  startEnabled: boolean = false
): LocalPreviewScreenStream => {
  const [localScreenStream, setLocalScreenStream] =
    useState<MediaStream | null>(null);
  const [isScreenEnabled, setIsScreenEnabled] = useState(startEnabled);

  const screenTrackRef = useRef<MediaStreamTrack | null>(null);

  // Start screen capture
  const startScreen = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false, // optional: set true if you want system audio
      });
      const screenTrack = stream.getVideoTracks()[0];
      screenTrackRef.current = screenTrack;
      setLocalScreenStream(new MediaStream(screenTrack ? [screenTrack] : []));
      setIsScreenEnabled(true);

      // Stop stream when track ends (user clicks "stop sharing")
      screenTrack.onended = () => {
        setLocalScreenStream(null);
        setIsScreenEnabled(false);
      };
    } catch (err) {
      console.error("Failed to get screen stream:", err);
      setLocalScreenStream(null);
      setIsScreenEnabled(false);
    }
  }, []);

  // Toggle screen on/off
  const toggleScreen = useCallback(() => {
    if (!screenTrackRef.current) {
      startScreen();
    } else {
      const enabled = !screenTrackRef.current.enabled;
      screenTrackRef.current.enabled = enabled;
      setIsScreenEnabled(enabled);
    }
  }, [startScreen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (screenTrackRef.current) screenTrackRef.current.stop();
    };
  }, []);

  return {
    localScreenStream,
    toggleScreen,
    isScreenEnabled,
  };
};
