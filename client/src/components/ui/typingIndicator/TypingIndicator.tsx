import React, { useEffect, useRef, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { audioService, SoundType } from "@/services/audioService";
import { useTypingMembers } from "@/common/hooks/useTypingMembers";
import { Avatar } from "@/components/ui/avatar/Avatar";
import "./typingIndicator.css";

interface TypingIndicatorProps {
  chatId: string;
  isMuted?: boolean;
}

const TypingIndicator = ({ chatId, isMuted }: TypingIndicatorProps) => {
  const { typingMembers, isTyping } = useTypingMembers(chatId);
  const previousTypingCount = useRef(0);

  useEffect(() => {
    if (isMuted) return; // 🔇 Skip sounds if muted

    if (previousTypingCount.current === 0 && isTyping) {
      audioService.playSound(SoundType.TYPING, 0.1);
    }
    if (!isTyping) {
      audioService.stopSound(SoundType.TYPING);
    }

    previousTypingCount.current = typingMembers.length;
  }, [isMuted, isTyping, typingMembers.length]);

  useEffect(() => {
    return () => audioService.stopSound(SoundType.TYPING);
  }, []);

  const displayAvatars = useMemo(() => {
    return typingMembers.map((member) => (
      <div key={member.userId}>
        <Avatar avatarUrl={member.avatarUrl} name={member.firstName} size={8} />
      </div>
    ));
  }, [typingMembers]);

  return (
    <AnimatePresence>
      {isTyping && (
        <motion.div
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
              layout: { duration: 0.2 },
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

export default React.memo(TypingIndicator);
