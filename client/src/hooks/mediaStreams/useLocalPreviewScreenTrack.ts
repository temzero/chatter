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

  const startScreen = useCallback(async () => {
    try {
      cleanupStream(); // stop previous if any

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: "window" },
        audio: false,
      });

      streamRef.current = stream;
      setLocalScreenStream(stream);
      setIsScreenEnabled(true);

      // Handle browser stop
      stream.getVideoTracks().forEach((track) => {
        track.onended = cleanupStream;
      });
    } catch (err) {
      console.error("Failed to get screen stream:", err);
      cleanupStream();
    }
  }, [cleanupStream]);

  const stopScreen = useCallback(() => {
    cleanupStream();
  }, [cleanupStream]);

  const toggleScreen = useCallback(async () => {
    if (isScreenEnabled) {
      stopScreen();
    } else {
      await startScreen();
    }
  }, [isScreenEnabled, startScreen, stopScreen]);

  useEffect(() => {
    if (startEnabled) startScreen();
    return () => {
      if (opts.stopOnUnmount) cleanupStream();
    };
  }, [startEnabled, opts.stopOnUnmount, startScreen, cleanupStream]);

  return {
    localScreenStream,
    toggleScreen,
    stopScreen,
    isScreenEnabled,
  };
};
