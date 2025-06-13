import { motion, AnimatePresence } from "framer-motion";
import "./TypingIndicator.css";
import { useChatMembers } from "@/stores/chatStore";

interface TypingIndicatorProps {
  chatId: string;
  userIds: string[];
}

const TypingIndicator = ({ chatId, userIds }: TypingIndicatorProps) => {
  const members = useChatMembers(chatId);
  console.log("TypingIndicator members", members);

  const typingNames = userIds;
  // console.log("TypingIndicator chatId", chatId);
  // console.log("TypingIndicator userIds", userIds);
  // console.log("TypingIndicator typingNames", typingNames);
  console.log("showing typing indicator for:", typingNames);

  return (
    <AnimatePresence>
      {typingNames.length > 0 && (
        <motion.div
          key={`${chatId}-${typingNames.join("-")}`}
          initial={{ opacity: 0, scale: 0, x: -10 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0, x: -100 }}
          transition={{ duration: 0.1 }}
          className="message-bubble my-4"
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

export default TypingIndicator;
