// hooks/useLocalPreviewVoiceTrack.ts
import { useState, useEffect, useRef, useCallback } from "react";

interface LocalPreviewAudioStream {
  localVoiceStream: MediaStream | null;
  toggleVoice: () => void;
  isVoiceEnabled: boolean;
}

export const useLocalPreviewVoiceTrack = (
  shouldEnable: boolean = true
): LocalPreviewAudioStream => {
  const [localVoiceStream, setLocalVoiceStream] = useState<MediaStream | null>(
    null
  );
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);

  const audioTrackRef = useRef<MediaStreamTrack | null>(null);

  useEffect(() => {
    if (!shouldEnable) return;

    let mounted = true;
    const initAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        const audioTrack = stream.getAudioTracks()[0];
        audioTrackRef.current = audioTrack;
        setLocalVoiceStream(new MediaStream(audioTrack ? [audioTrack] : []));
      } catch (err) {
        console.error("Failed to get local audio stream:", err);
      }
    };

    initAudio();

    return () => {
      mounted = false;
      if (audioTrackRef.current) audioTrackRef.current.stop();
    };
  }, [shouldEnable]);

  const toggleVoice = useCallback(() => {
    if (audioTrackRef.current) {
      const enabled = !audioTrackRef.current.enabled;
      audioTrackRef.current.enabled = enabled;
      setIsVoiceEnabled(enabled);
    }
  }, []);

  return {
    localVoiceStream,
    toggleVoice,
    isVoiceEnabled,
  };
};
