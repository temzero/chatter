import { useState, useEffect, useRef, useCallback } from "react";

interface LocalPreviewScreenStream {
  localScreenStream: MediaStream | null;
  toggleScreen: () => void;
  stopScreen: () => void;
  isScreenEnabled: boolean;
}

export const useLocalPreviewScreenTrack = (
  startEnabled: boolean = false,
  opts: { stopOnUnmount: boolean } = { stopOnUnmount: true }
): LocalPreviewScreenStream => {
  const [localScreenStream, setLocalScreenStream] =
    useState<MediaStream | null>(null);
  const [isScreenEnabled, setIsScreenEnabled] = useState(startEnabled);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop all tracks and release screen
  const cleanupStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
        track.onended = null;
      });
      streamRef.current = null;
    }
    setLocalScreenStream(null);
    setIsScreenEnabled(false);
  }, []);

  // Request screen capture
  const startScreen = useCallback(async () => {
    try {
      cleanupStream(); // stop previous if any

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: "window" },
        audio: true,
      });

      streamRef.current = stream;
      setLocalScreenStream(stream);
      setIsScreenEnabled(true);

      // Handle manual stop from browser UI
      stream.getVideoTracks().forEach((track) => {
        track.onended = cleanupStream;
      });
    } catch (err) {
      console.error("Failed to start screen capture:", err);
      cleanupStream();
    }
  }, [cleanupStream]);

  // Fully stop screen
  const stopScreen = useCallback(() => {
    cleanupStream();
  }, [cleanupStream]);

  // Toggle screen sharing
  const toggleScreen = useCallback(async () => {
    if (isScreenEnabled) {
      stopScreen();
    } else {
      await startScreen();
    }
  }, [isScreenEnabled, startScreen, stopScreen]);

  // Auto-start if needed
  useEffect(() => {
    if (startEnabled) startScreen();

    return () => {
      if (opts.stopOnUnmount) cleanupStream();
    };
  }, [startEnabled, startScreen, cleanupStream, opts.stopOnUnmount]);

  return {
    localScreenStream,
    toggleScreen,
    stopScreen,
    isScreenEnabled,
  };
};
