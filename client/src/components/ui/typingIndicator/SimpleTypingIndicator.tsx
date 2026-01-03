import { AnimatePresence, motion } from "framer-motion";
import "./typingIndicator.css";
import { useIsHideTypingIndicator } from "@/stores/settingsStore";

interface TypingIndicatorProps {
  chatId: string;
  userIds: string[];
}

const SimpleTypingIndicator = ({ chatId, userIds }: TypingIndicatorProps) => {
  const isHideTypingIndicator = useIsHideTypingIndicator();
  if (isHideTypingIndicator) return null

  return (
    <AnimatePresence>
      {userIds.length > 0 && (
        <motion.div
          key={`${chatId}`}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          style={{ transformOrigin: "left" }}
          className="flex items-center gap-4 ml-1 min-h-6"
        >
          <div className="typing">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SimpleTypingIndicator;
