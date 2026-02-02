// MicButton.tsx
import { useChatBarStore } from "@/stores/chatbarStore";
import clsx from "clsx";
import { motion } from "framer-motion";

const MicButton: React.FC = () => {
  const { isRecording, resetVoiceState } = useChatBarStore();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    resetVoiceState();
  };

  return (
    <button
      onClick={handleClick}
      className="relative rounded-full! group hover:bg-red-500/50 flex items-center justify-center"
      style={{
        width: "var(--glass-button-height-s, 38px)",
        height: "var(--glass-button-height-s, 38px)",
        aspectRatio: "square",
      }}
    >
      {/* MIC ICON */}
      <motion.i
        className={clsx(
          "material-symbols-outlined filled text-6xl! mt-5 relative z-10 transition-opacity duration-200",
          "group-hover:hidden!",
          isRecording && "text-red-400",
        )}
        animate={{
          opacity: isRecording ? [1, 0.5, 1] : 1,
        }}
        transition={{
          duration: 1.5,
          repeat: isRecording ? Infinity : 0,
          ease: "easeInOut",
        }}
      >
        mic
      </motion.i>

      {/* CLOSE ICON */}
      <span
        className={clsx(
          "material-symbols-outlined text-3xl!",
          // "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
          // "opacity-0 scale-75",
          "hidden! group-hover:block!",
          "transition-all duration-200 ease-out",
        )}
        style={{zIndex: 99}}
      >
        close
      </span>
    </button>
  );
};

export default MicButton;
