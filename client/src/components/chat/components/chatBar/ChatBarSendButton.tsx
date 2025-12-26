import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { chatBarAnimations } from "@/common/animations/chatBarAnimations";

interface ChatBarSendButtonProps {
  visible: boolean;
  onClick: () => void;
}

const ChatBarSendButton: React.FC<ChatBarSendButtonProps> = ({
  visible,
  onClick,
}) => {
  return (
    <AnimatePresence mode="popLayout">
      {visible && (
        <motion.button
          key="send-button"
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.1 }}
          className={clsx(
            "-mr-2",
            "h-(--chat-input-container-height)",
            "text-(--primary-green-glow)",
            "flex items-center justify-center overflow-hidden"
          )}
          onClick={onClick}
          {...chatBarAnimations.sendButton}
        >
          <motion.span
            className="material-symbols-outlined filled text-5xl! pb-0.5"
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
