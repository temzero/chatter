// ChatBarVoiceInput.tsx
import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import clsx from "clsx";
import { TimerDisplay } from "@/components/ui/TimerDisplay";
import { motion } from "framer-motion";
import { useChatBarStore } from "@/stores/chatbarStore";
import { useVoiceRecording } from "@/common/hooks/voice/useVoiceRecord";

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
  const { isRecording, setIsRecording } = useChatBarStore();
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
    null,
  );

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

  // Function to play/pause audio
  const playPausedAudio = () => {
    if (!isRecording) {
      const recording = getCurrentRecording();
      if (recording) {
        if (audioElement) {
          // If audio exists, toggle play/pause
          if (isPlaying) {
            audioElement.pause();
            setIsPlaying(false);
          } else {
            audioElement.play();
            setIsPlaying(true);
          }
        } else {
          // Create new audio element
          const url = URL.createObjectURL(recording);
          const audio = new Audio(url);
          setAudioElement(audio);

          audio.onended = () => {
            setIsPlaying(false);
            URL.revokeObjectURL(url);
            setAudioElement(null);
          };

          audio.play();
          setIsPlaying(true);
        }
      }
    }
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
      if (audioElement) {
        audioElement.pause();
        URL.revokeObjectURL(audioElement.src);
      }
    };
  }, [isRecording, audioElement, getCurrentRecording]);

  // Update duration while recording
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRecording) {
      interval = setInterval(() => {
        const duration = getCurrentRecordingDuration();
        setRecordingDuration(duration);
      }, 100); // Update every 100ms
    } else {
      // Update once when not recording
      const duration = getCurrentRecordingDuration();
      setRecordingDuration(duration);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, getCurrentRecordingDuration]);

  // Play audio and notify parent when paused
  useEffect(() => {
    if (!isRecording) {
      // Notify ChatBar that we have recording data
      const recording = getCurrentRecording();
      if (recording) {
        onRecordingDataAvailable();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording]);

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
      if (audioElement) {
        audioElement.pause();
        URL.revokeObjectURL(audioElement.src);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={clsx(
        "chat-voice-input-container text-white",
        isRecording ? "bg-red-500/50!" : "bg-(--input-border-color)!",
      )}
    >
      {!isRecording && getCurrentRecording() ? (
        <button
          id="play-back-btn"
          className="rounded-full! bg-(--input-border-color)"
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
      ) : 
      <div></div>
      }
      <motion.div
        initial={{ opacity: 0, scale: 2, x: 32 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 2, x: 32 }}
      >
        <TimerDisplay durationMs={recordingDuration} />
      </motion.div>
    </div>
  );
});

ChatBarVoiceInput.displayName = "ChatBarVoiceInput";

export default ChatBarVoiceInput;
