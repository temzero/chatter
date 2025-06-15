import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Avatar } from "../avatar/Avatar";
import { ChatMember } from "@/types/chat";
import { useSoundEffect } from "@/hooks/useSoundEffect"; // <-- your custom hook
import typingSound from "@/assets/sound/typing.mp3";
import "./TypingIndicator.css";

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
  // console.log("TypingIndicator Mounted");
  const [hasSettled, setHasSettled] = useState(true);
  const previousChatIdRef = useRef<string | null>(null);
  const previousUserIdsLength = useRef(0);
  // const playTypingSound = useSoundEffect(typingSound, 0.5);
  const [playTypingSound, stopTypingSound] = useSoundEffect(typingSound, 1);

  // Play sound when someone starts typing
  useEffect(() => {
    if (previousUserIdsLength.current === 0 && userIds.length > 0) {
      playTypingSound();
    }
    previousUserIdsLength.current = userIds.length;
  }, [userIds, playTypingSound]);
  // stop sound when TypingIndicator unmounts
  useEffect(() => {
    return () => {
      stopTypingSound();
    };
  }, [stopTypingSound]);

  // Detect change in chatId
  useEffect(() => {
    if (previousChatIdRef.current !== chatId) {
      setHasSettled(false);
      const timeout = setTimeout(() => setHasSettled(true), 0);
      previousChatIdRef.current = chatId;
      return () => clearTimeout(timeout);
    }
  }, [chatId]);

  // Filter and sort members based on userIds
  const typingMembers = useMemo(() => {
    const userIdIndexMap = new Map(userIds.map((id, index) => [id, index]));

    return (members ?? [])
      .filter((member) => userIdIndexMap.has(member.userId))
      .sort((a, b) => {
        return (
          (userIdIndexMap.get(a.userId) ?? 0) -
          (userIdIndexMap.get(b.userId) ?? 0)
        );
      });
  }, [members, userIds]);

  const displayAvatars = useMemo(() => {
    return typingMembers.map((member) => (
      <div key={member.userId}>
        <Avatar
          key={member.userId}
          avatarUrl={member.avatarUrl}
          firstName={member.firstName}
          lastName={member.lastName}
          size="8"
        />
      </div>
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
          exit={{ opacity: 0, scale: 0.5 }}
          style={{ transformOrigin: "left" }}
          className="my-4 flex items-center gap-4"
        >
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{
              duration: 0.2,
              layout: {
                duration: 0.2,
              },
            }}
            className="flex items-center gap-4"
          >
            <div className="flex -space-x-2">{displayAvatars}</div>
            <div className="typing">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TypingIndicator;
