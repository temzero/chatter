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

  // Stop all tracks and clear references
  const cleanupStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    setLocalVoiceStream(null);
    setIsVoiceEnabled(false);
  }, []);

  const startVoice = useCallback(async () => {
    try {
      cleanupStream(); // stop any existing stream

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
      console.error("Failed to get audio stream:", err);
      cleanupStream();
    }
  }, [cleanupStream]);

  const toggleVoice = useCallback(() => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsVoiceEnabled(audioTrack.enabled);
      }
    }
  }, []);

  const stopVoice = useCallback(() => {
    cleanupStream();
  }, [cleanupStream]);

  // Initialize if startEnabled is true
  useEffect(() => {
    if (startEnabled) startVoice();

    return () => {
      if (opts.stopOnUnmount) cleanupStream();
    };
  }, [startEnabled, opts.stopOnUnmount, startVoice, cleanupStream]);

  return {
    localVoiceStream,
    toggleVoice,
    stopVoice,
    isVoiceEnabled,
  };
};
