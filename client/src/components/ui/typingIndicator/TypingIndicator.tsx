import { useEffect, useRef, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { audioService, SoundType } from "@/services/audio.service";
import { useTypingMembers } from "@/common/hooks/useTypingMembers";
import "./TypingIndicator.css";
import React from "react";

interface TypingIndicatorProps {
  chatId: string;
}

const TypingIndicator = ({ chatId }: TypingIndicatorProps) => {
  const { typingMembers, isTyping } = useTypingMembers(chatId);
  const previousTypingCount = useRef(0);

  useEffect(() => {
    // Play typing sound when someone starts typing
    if (previousTypingCount.current === 0 && isTyping) {
      audioService.playSound(SoundType.TYPING, 0.9);
    }
    // Stop typing sound when nobody is typing
    if (!isTyping) {
      audioService.stopSound(SoundType.TYPING);
    }
    previousTypingCount.current = typingMembers.length;
  }, [isTyping, typingMembers.length]);

  // Stop sound on unmount
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
