import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChatStore } from "@/stores/chatStore";
import { Avatar } from "../avatar/Avatar";
import "./TypingIndicator.css";

interface TypingIndicatorProps {
  chatId: string;
  userIds: string[];
}

const TypingIndicator = ({ chatId, userIds }: TypingIndicatorProps) => {
  console.log("TypingIndicator - chatId:", chatId);
  console.log("TypingIndicator - userIds:", userIds);
  // Get members with proper memoization
  const allMembers = useMemo(() => {
    return useChatStore.getState().chatMembers[chatId] || [];
  }, [chatId]);
  console.log("TypingIndicator - allMembers:", allMembers);

  // Filter and memoize only the typing members
  const typingMembers = useMemo(() => {
    return allMembers.filter((member) => userIds.includes(member.userId));
  }, [allMembers, userIds]);

  // Memoize the avatar display
  const displayAvatars = useMemo(() => {
    return typingMembers.map((member) => (
      <Avatar
        key={member.userId}
        avatarUrl={member.avatarUrl}
        firstName={member.firstName}
        lastName={member.lastName}
        size="10"
      />
    ));
  }, [typingMembers]);

  return (
    <AnimatePresence>
      {userIds.length > 0 && (
        <motion.div
          key={`${chatId}-${userIds.join("-")}`}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: .9 }}
          // transition={{ duration: 0.1 }}
          style={{
            transformOrigin: "top left", // Ensures the scaling originates from bottom left
          }}
          className="my-4 flex items-center gap-4"
        >
          <div className="flex -space-x-2">{displayAvatars}</div>
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
