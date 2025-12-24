import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { chatBarAnimations } from "@/common/animations/chatBarAnimations";

interface ChatBarSendButtonProps {
  visible: boolean;
  height: number;
  onClick: () => void;
}

const ChatBarSendButton: React.FC<ChatBarSendButtonProps> = ({
  visible,
  height,
  onClick,
}) => {
  return (
    <AnimatePresence mode="popLayout">
      {visible && (
        <motion.button
          key="send-button"
          className={clsx(
            // "text-(--primary-green) hover:text-(--primary-green-glow)",
            "scale-95",
            "text-white hover:text-(--primary-green)",
            "bg-(--primary-green) hover:bg-(--primary-green-glow)",
            "rounded-md! border-3! border-black/50",
            "flex px-4! items-center justify-center overflow-hidden"
          )}
          style={{ height, width: height }}
          onClick={onClick}
          {...chatBarAnimations.sendButton}
        >
          <motion.span
            className="material-symbols-outlined filled text-4xl!"
            {...chatBarAnimations.sendButtonIcon}
          >
            send
          </motion.span>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ChatBarSendButton;
