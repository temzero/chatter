import { AnimatePresence, motion } from "framer-motion";
import "./TypingIndicator.css";

interface TypingIndicatorProps {
  chatId: string;
  userIds: string[];
}

const SimpleTypingIndicator = ({ chatId, userIds }: TypingIndicatorProps) => {
  console.log("SimpleTypingIndicator Mounted");

  return (
    <AnimatePresence>
      {userIds.length > 0 && (
        <motion.div
          key={`${chatId}`}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          style={{ transformOrigin: "left" }}
          className="flex items-center gap-4 ml-1"
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
