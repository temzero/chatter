// ChatBarVoiceInput.tsx
import { useEffect } from "react";
import clsx from "clsx";
import { TimerDisplay } from "@/components/ui/TimerDisplay";
import { audioManager, SoundType } from "@/services/media/audioManager";
import { motion } from "framer-motion";
import { useChatBarStore } from "@/stores/chatbarStore";
import { useVoiceRecording } from "@/common/hooks/voice/useVoiceRecord";

interface ChatBarVoiceInputProps {
  onCancel: () => void;
}

const ChatBarVoiceInput: React.FC<ChatBarVoiceInputProps> = ({ onCancel }) => {
  const { isRecording, setIsRecording } = useChatBarStore();

  // Use the recording hook
  const { stopRecording, getCurrentRecording } = useVoiceRecording({
    isRecording,
    onRecordingComplete: () => onCancel(), // Just close, no playback
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

  // Play start sound when recording starts
  useEffect(() => {
    if (isRecording) {
      audioManager.playSound(SoundType.RECORD_START);
    } else if (!isRecording) {
      playPausedAudio();
    }
  }, [isRecording]);

  // Handle stop recording
  const handleStop = () => {
    setIsRecording(false);
    stopRecording(); // This triggers onRecordingComplete with audio data
    audioManager.playSound(SoundType.USER_DISCONNECTED);
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
        <TimerDisplay isRunning={isRecording} runningClassName="text-white" />
      </motion.div>
    </div>
  );
};

export default ChatBarVoiceInput;
