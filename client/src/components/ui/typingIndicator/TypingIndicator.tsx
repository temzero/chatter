import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
// import { useActiveMembersByChatId } from "@/stores/chatStore";
import { Avatar } from "../avatar/Avatar";
import "./TypingIndicator.css";
import { ChatMember } from "@/types/chat";

interface TypingIndicatorProps {
  chatId: string;
  userIds: string[];
  members?: ChatMember[] | []; // Optional prop for members, if needed
}

const TypingIndicator = ({
  chatId,
  userIds,
  members,
}: TypingIndicatorProps) => {
  console.log("TypingIndicator Mounted");
  const [hasSettled, setHasSettled] = useState(true);
  const previousChatIdRef = useRef<string | null>(null);

  // Detect change in chatId
  useEffect(() => {
    if (previousChatIdRef.current !== chatId) {
      setHasSettled(false);
      const timeout = setTimeout(() => setHasSettled(true), 0); // optionally delay 1 frame
      previousChatIdRef.current = chatId;
      return () => clearTimeout(timeout);
    }
  }, [chatId]);

  // const allMembers = useMemo(() => {
  //   return useChatStore.getState().chatMembers[chatId] || [];
  // }, [chatId]);

  // console.log("Typing Members:", members);

  const typingMembers = useMemo(() => {
    return (members ?? []).filter((member) => userIds.includes(member.userId));
  }, [members, userIds]);

  const displayAvatars = useMemo(() => {
    return typingMembers.map((member) => (
      <Avatar
        key={member.userId}
        avatarUrl={member.avatarUrl}
        firstName={member.firstName}
        lastName={member.lastName}
        size="8"
      />
    ));
  }, [typingMembers]);

  if (!hasSettled) return null;

  return (
    <AnimatePresence>
      {userIds.length > 0 && (
        <motion.div
          key={`${chatId}`}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          style={{ transformOrigin: "top left" }}
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
