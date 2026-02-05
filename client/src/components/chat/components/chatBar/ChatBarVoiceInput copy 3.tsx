// ChatBarVoiceInput.tsx - SIMPLIFIED (No waveform progress)
import {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import clsx from "clsx";
import { TimerDisplay } from "@/components/ui/TimerDisplay";
import { motion } from "framer-motion";
import { useChatBarStore } from "@/stores/chatbarStore";
import { useVoiceRecording } from "@/common/hooks/voice/useVoiceRecord";
import VoiceWaveform from "@/components/ui/streams/VoiceWaveform";
import { useResolvedTheme } from "@/stores/themeStore";

interface ChatBarVoiceInputProps {
  onRecordingDataAvailable: () => void;
}

export interface ChatBarVoiceInputRef {
  getRecordingFile: () => File | null;
}

const ChatBarVoiceInput = forwardRef<
  ChatBarVoiceInputRef,
  ChatBarVoiceInputProps
>(({ onRecordingDataAvailable }, ref) => {
  const isDarkMode = useResolvedTheme();
  const { isRecording, setIsRecording } = useChatBarStore();
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);

  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const audioObjectURLRef = useRef<string | null>(null);

  // Use the recording hook
  const { stopRecording, getCurrentRecording, getCurrentRecordingDuration } =
    useVoiceRecording({
      isRecording,
      onRecordingComplete: () => {
        console.log("voice record closed");
      },
    });

  // Expose getRecordingFile method to parent
  useImperativeHandle(ref, () => ({
    getRecordingFile: () => {
      const recording = getCurrentRecording();
      if (recording) {
        return new File([recording], `voice-recording-${Date.now()}.webm`, {
          type: "audio/webm;codecs=opus",
        });
      }
      return null;
    },
  }));

  // SIMPLE play/pause function
  const playPausedAudio = () => {
    if (isRecording) return;

    const recording = getCurrentRecording();
    if (!recording) return;

    // Pause if playing
    if (audioElementRef.current && isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
      return;
    }

    // Clean up old audio
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
    if (audioObjectURLRef.current) {
      URL.revokeObjectURL(audioObjectURLRef.current);
    }

    // Create new audio
    const url = URL.createObjectURL(recording);
    audioObjectURLRef.current = url;
    const audio = new Audio(url);
    audioElementRef.current = audio;

    // Basic event handlers
    audio.onloadedmetadata = () => {
      setAudioDuration(audio.duration || recordingDuration / 1000);
    };

    audio.onplay = () => {
      setIsPlaying(true);
      setAudioDuration(audio.duration || recordingDuration / 1000);
    };

    audio.onpause = () => {
      setIsPlaying(false);
    };

    audio.onended = () => {
      setIsPlaying(false);
    };

    audio.onerror = (error) => {
      console.error("Audio playback error:", error);
      setIsPlaying(false);
    };

    audio.play().catch((error) => {
      console.error("Failed to play audio:", error);
      setIsPlaying(false);
    });
  };

  // Handle spaceBar press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !isRecording && getCurrentRecording()) {
        e.preventDefault();
        e.stopPropagation();
        playPausedAudio();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isRecording]); // No infinite loop!

  // Update duration while recording
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRecording) {
      // Stop any playback when recording starts
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        // setIsPlaying(false);
      }

      interval = setInterval(() => {
        const duration = getCurrentRecordingDuration();
        setRecordingDuration(duration);
      }, 100);
    } else {
      const duration = getCurrentRecordingDuration();
      setRecordingDuration(duration);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, getCurrentRecordingDuration]);

  // Notify parent
  useEffect(() => {
    if (!isRecording && getCurrentRecording()) {
      onRecordingDataAvailable();
    }
  }, [isRecording, getCurrentRecording, onRecordingDataAvailable]);

  // Handle stop recording
  const handleStop = () => {
    setIsRecording(false);
    stopRecording();
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (isRecording) {
        handleStop();
      }
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
      if (audioObjectURLRef.current) {
        URL.revokeObjectURL(audioObjectURLRef.current);
      }
    };
  }, []);

  // Calculate duration - waveform will be static without progress
  const waveformDuration =
    audioDuration > 0 ? audioDuration : recordingDuration / 1000;

  return (
    <div
      className={clsx(
        "chat-voice-input-container text-white",
        isRecording ? "bg-red-500/50!" : "bg-(--input-border-color)!",
      )}
    >
      <div className="flex flex-1 items-center justify-between gap-2">
        {!isRecording && getCurrentRecording() && (
          <button
            id="play-back-btn"
            className="rounded-full! bg-(--input-border-color) scale-110 hover:scale-125"
            onClick={playPausedAudio}
            disabled={isRecording || !getCurrentRecording()}
            title={isPlaying ? "Pause (Space)" : "Play (Space)"}
          >
            <span className="material-symbols-outlined filled">
              {isPlaying ? "pause" : "play_arrow"}
            </span>
          </button>
        )}

        <VoiceWaveform
          audioBlob={getCurrentRecording()}
          currentTime={0} // Always 0 - waveform won't show progress
          duration={waveformDuration}
          height={34}
          barCount={300}
          color={isDarkMode ? "#ffffff" : "#000000"}
          processColor={"#86EFAC"}
          barSpacing={1}
          className="flex-1"
        />
        <motion.div
          initial={{ opacity: 0, scale: 2, x: 32 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 2, x: 32 }}
        >
          <TimerDisplay durationMs={recordingDuration} />
        </motion.div>
      </div>
    </div>
  );
});

ChatBarVoiceInput.displayName = "ChatBarVoiceInput";

export default ChatBarVoiceInput;