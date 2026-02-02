// ChatBarVoiceInput.tsx
import { useEffect, useState } from "react";
import clsx from "clsx";
import { TimerDisplay } from "@/components/ui/TimerDisplay";
import { motion } from "framer-motion";
import { useChatBarStore } from "@/stores/chatbarStore";
import { useVoiceRecording } from "@/common/hooks/voice/useVoiceRecord";

const ChatBarVoiceInput: React.FC = () => {
  const { isRecording, setIsRecording } = useChatBarStore();
  const [recordingDuration, setRecordingDuration] = useState(0);

  // Use the recording hook
  const {
    stopRecording,
    getCurrentRecording,
    getCurrentRecordingDuration, // Get the duration function
  } = useVoiceRecording({
    isRecording,
    onRecordingComplete: () => {
      console.log("voice record closed");
    },
  });

  // Function to play paused audio
  const playPausedAudio = () => {
    if (!isRecording) {
      const recording = getCurrentRecording();
      if (recording) {
        const url = URL.createObjectURL(recording);
        const audio = new Audio(url);
        audio.play();
        audio.onended = () => URL.revokeObjectURL(url);
      }
    }
  };

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

  // Play start sound when recording starts
  useEffect(() => {
    if (!isRecording) {
      playPausedAudio();
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
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={clsx(
        "chat-voice-input-container text-white",
        `${isRecording ? "bg-red-500/50!" : "bg-(--input-border-color)!"}`,
        {},
      )}
    >
      <span className="opacity-60">
        {isRecording ? "Recording..." : "Stopped"}
      </span>
      <motion.div
        initial={{ opacity: 0, scale: 2, x: 32 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 2, x: 32 }}
      >
        <TimerDisplay durationMs={recordingDuration} />
      </motion.div>
    </div>
  );
};

export default ChatBarVoiceInput;
