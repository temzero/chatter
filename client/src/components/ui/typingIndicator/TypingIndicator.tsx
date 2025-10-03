import { useEffect, useRef, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Avatar } from "../avatar/Avatar";
import { useAudioService } from "@/hooks/useAudioService";
import { SoundType } from "@/services/audio.service";
import { useTypingMembers } from "@/hooks/useTypingMembers";
import "./TypingIndicator.css";
import React from "react";

interface TypingIndicatorProps {
  chatId: string;
}

const TypingIndicator = ({ chatId }: TypingIndicatorProps) => {
  const { typingMembers, isTyping } = useTypingMembers(chatId);
  const { playSound, stopSound } = useAudioService();
  const previousTypingCount = useRef(0);

  // Play sound when someone starts typing
  useEffect(() => {
    if (previousTypingCount.current === 0 && isTyping) {
      playSound(SoundType.TYPING, 0.9);
    }
    previousTypingCount.current = typingMembers.length;
  }, [isTyping, playSound, typingMembers.length]);

  // Stop sound on unmount
  useEffect(() => {
    return () => stopSound(SoundType.TYPING);
  }, [stopSound]);

  const displayAvatars = useMemo(() => {
    return typingMembers.map((member) => (
      <div key={member.userId}>
        <Avatar avatarUrl={member.avatarUrl} name={member.firstName} size="8" />
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
