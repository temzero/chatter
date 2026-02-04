// ChatBarVoiceInput.tsx - FIXED VERSION
import { useEffect, useState, forwardRef, useImperativeHandle, useRef } from "react";
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
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number>(0);
  const audioObjectURLRef = useRef<string | null>(null);
  const lastRecordingRef = useRef<Blob | null>(null);

  // Use the recording hook
  const { stopRecording, getCurrentRecording, getCurrentRecordingDuration } =
    useVoiceRecording({
      isRecording,
      onRecordingComplete: () => {
        console.log("voice record closed");
      },
    });

  // Store the latest recording in ref
  useEffect(() => {
    const recording = getCurrentRecording();
    if (recording) {
      lastRecordingRef.current = recording;
    }
  }, [getCurrentRecording]);

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

  // Function to update current time for waveform
  const updateCurrentTime = () => {
    if (audioElementRef.current && !audioElementRef.current.paused) {
      setCurrentTime(audioElementRef.current.currentTime);
      animationFrameRef.current = requestAnimationFrame(updateCurrentTime);
    }
  };

  // Cleanup audio resources
  const cleanupAudio = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
    if (audioObjectURLRef.current) {
      URL.revokeObjectURL(audioObjectURLRef.current);
      audioObjectURLRef.current = null;
    }
    setIsPlaying(false);
    setCurrentTime(0);
    cancelAnimationFrame(animationFrameRef.current);
  };

  // Function to play/pause audio - FIXED VERSION
  const playPausedAudio = () => {
    if (isRecording) return;
    
    const recording = getCurrentRecording();
    if (!recording) return;

    // If we have an audio element and it's playing, pause it
    if (audioElementRef.current && isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
      cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    // Clean up existing audio resources
    cleanupAudio();

    // Create new audio element with the LATEST recording
    const url = URL.createObjectURL(recording);
    audioObjectURLRef.current = url;
    const audio = new Audio(url);
    audioElementRef.current = audio;

    // Set up event listeners
    audio.onloadedmetadata = () => {
      setAudioDuration(audio.duration || recordingDuration / 1000);
    };

    audio.onplay = () => {
      setIsPlaying(true);
      setAudioDuration(audio.duration || recordingDuration / 1000);
      // Start animation frame for updating current time
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = requestAnimationFrame(updateCurrentTime);
    };

    audio.onpause = () => {
      setIsPlaying(false);
      cancelAnimationFrame(animationFrameRef.current);
    };

    audio.onended = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      cancelAnimationFrame(animationFrameRef.current);
      // Don't revoke URL here, keep it for potential replay
    };

    audio.ontimeupdate = () => {
      setCurrentTime(audio.currentTime);
    };

    audio.onerror = (error) => {
      console.error("Audio playback error:", error);
      cleanupAudio();
    };

    // Play the audio
    audio.play().catch((error) => {
      console.error("Failed to play audio:", error);
      cleanupAudio();
    });
  };

  // Handle spacebar press for playback
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !isRecording && getCurrentRecording()) {
        e.preventDefault();
        e.stopPropagation();
        playPausedAudio();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording, getCurrentRecording, isPlaying]);

  // Update duration while recording
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRecording) {
      interval = setInterval(() => {
        const duration = getCurrentRecordingDuration();
        setRecordingDuration(duration);
      }, 100);
      
      // Clean up audio when starting new recording
      cleanupAudio();
    } else {
      const duration = getCurrentRecordingDuration();
      setRecordingDuration(duration);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, getCurrentRecordingDuration]);

  // Notify parent when recording becomes available
  useEffect(() => {
    if (!isRecording) {
      const recording = getCurrentRecording();
      if (recording) {
        onRecordingDataAvailable();
      }
    }
  }, [isRecording, getCurrentRecording, onRecordingDataAvailable]);

  // Handle stop recording
  const handleStop = () => {
    setIsRecording(false);
    stopRecording();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isRecording) {
        handleStop();
      }
      cleanupAudio();
    };
  }, []);

  // Calculate proper duration for waveform
  const waveformDuration = audioDuration > 0 ? audioDuration : recordingDuration / 1000;

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
            title={
              isPlaying ? "Pause playback (Space)" : "Play recording (Space)"
            }
          >
            <span className="material-symbols-outlined filled">
              {isPlaying ? "pause" : "play_arrow"}
            </span>
          </button>
        )}

        <VoiceWaveform
          audioBlob={getCurrentRecording()}
          currentTime={currentTime}
          duration={waveformDuration}
          height={34}
          barCount={250}
          color={isDarkMode ? "#ffffff" : "#000000"}
          processColor={"#86EFAC"}
          barSpacing={2}
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