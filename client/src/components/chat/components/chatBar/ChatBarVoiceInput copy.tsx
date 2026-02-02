// ChatBarVoiceInput.tsx
import { useEffect } from "react";
import clsx from "clsx";
import { TimerDisplay } from "@/components/ui/TimerDisplay";
import { audioManager, SoundType } from "@/services/media/audioManager";
import { motion } from "framer-motion";
import { useChatBarStore } from "@/stores/chatbarStore";

interface ChatBarVoiceInputProps {
  onCancel: () => void;
}

const ChatBarVoiceInput: React.FC<ChatBarVoiceInputProps> = ({ onCancel }) => {
  const {
    isRecording,
    setIsRecording,
  } = useChatBarStore();

  // Play start sound when recording starts
  useEffect(() => {
    if (isRecording) {
      audioManager.playSound(SoundType.RECORD_START);
    }
  }, [isRecording]);

  // Handle stop recording
  const handleStop = () => {
    setIsRecording(false);
    onCancel();
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
    <div className={clsx("chat-voice-input-container text-white", `${isRecording ? "bg-red-500/50!" : "bg-(--input-border-color)!"}`, {

    })}>
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
