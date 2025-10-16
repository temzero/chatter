import { useState, useEffect, useRef, useCallback } from "react";

interface LocalPreviewAudioStream {
  localVoiceStream: MediaStream | null;
  toggleVoice: () => void;
  stopVoice: () => void;
  isVoiceEnabled: boolean;
}

export const useLocalPreviewVoiceTrack = (
  startEnabled: boolean = true,
  opts: { stopOnUnmount: boolean } = { stopOnUnmount: true }
): LocalPreviewAudioStream => {
  const [localVoiceStream, setLocalVoiceStream] = useState<MediaStream | null>(
    null
  );
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(startEnabled);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop all tracks and release mic
  const cleanupStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setLocalVoiceStream(null);
    setIsVoiceEnabled(false);
  }, []);

  // Request microphone access
  const startVoice = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;
      setLocalVoiceStream(stream);
      setIsVoiceEnabled(true);
    } catch (err) {
      console.error("Failed to access microphone:", err);
      cleanupStream();
    }
  }, [cleanupStream]);

  useEffect(() => {
    if (startEnabled) startVoice();

    return () => {
      if (opts.stopOnUnmount) cleanupStream();
    };
  }, [startEnabled, startVoice, cleanupStream, opts.stopOnUnmount]);

  // Toggle microphone: stop or start
  const toggleVoice = useCallback(() => {
    if (isVoiceEnabled) {
      // Stop mic entirely
      cleanupStream();
    } else {
      // Request mic again
      startVoice();
    }
  }, [isVoiceEnabled, cleanupStream, startVoice]);

  // Fully stop microphone
  const stopVoice = useCallback(() => {
    cleanupStream();
  }, [cleanupStream]);

  return {
    localVoiceStream,
    toggleVoice,
    stopVoice,
    isVoiceEnabled,
  };
};
