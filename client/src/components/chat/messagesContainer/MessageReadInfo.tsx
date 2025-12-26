import React, { useMemo, useRef, useState, useEffect } from "react";
import clsx from "clsx";
import { useChatMemberStore } from "@/stores/chatMemberStore";
import { useShallow } from "zustand/shallow";
import { getCurrentUser } from "@/stores/authStore";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { motion } from "framer-motion";

const SHOW_CURRENT_USER = false;

interface MessageReadInfoProps {
  chatId: string;
  currentUserId: string;
  messageId: string;
  isMe: boolean;
  senderName: string;
  avatarSize?: number; // in px
  gap?: number; // in px
}

export const MessageReadInfo: React.FC<MessageReadInfoProps> = React.memo(
  ({
    chatId,
    currentUserId,
    messageId,
    isMe,
    senderName,
    avatarSize = 4,
    gap = 0.5,
  }) => {
    const currentUser = getCurrentUser();
    const containerRef = useRef<HTMLDivElement>(null);
    const [visibleCount, setVisibleCount] = useState<number>(0);

    const readMembers = useChatMemberStore(
      useShallow((state) =>
        (state.chatMembers[chatId] || []).filter(
          (m) => m.lastReadMessageId === messageId
        )
      )
    );

    const readUserAvatars = useMemo(() => {
      return readMembers
        .filter((m) => (SHOW_CURRENT_USER ? true : m.userId !== currentUserId))
        .map((m) =>
          m.userId === currentUserId ? currentUser?.avatarUrl : m.avatarUrl
        )
        .filter(Boolean) as string[];
    }, [readMembers, currentUserId, currentUser?.avatarUrl]);

    // Calculate how many avatars fit
    useEffect(() => {
      const calculateVisible = () => {
        if (!containerRef.current) return;
        const containerWidth = containerRef.current.offsetWidth;
        const totalWidth = avatarSize + gap; // avatar + gap
        const maxVisible = Math.floor(containerWidth / totalWidth);
        setVisibleCount(Math.min(maxVisible, readUserAvatars.length));
      };

      calculateVisible();
      window.addEventListener("resize", calculateVisible);
      return () => window.removeEventListener("resize", calculateVisible);
    }, [readUserAvatars.length, avatarSize, gap]);

    if (readUserAvatars.length === 0) return null;

    const extraCount = readUserAvatars.length - visibleCount;

    return (
      <div
        ref={containerRef}
        className={clsx(`flex items-center pt-1 gap-${gap}`, {
          "justify-end": isMe,
          "justify-start": !isMe,
        })}
      >
        {readUserAvatars.slice(0, visibleCount).map((avatarUrl, index) => (
          <motion.div
            key={avatarUrl}
            layout
            initial={{ opacity: 0, scale: 0.8, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 5 }}
          >
            <Avatar
              key={index}
              avatarUrl={avatarUrl}
              name={senderName}
              size={avatarSize}
            />
          </motion.div>
        ))}

        {extraCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`w-${avatarSize} aspect-square p-2 rounded-full! bg-(--input-border-color) text-xs flex items-center justify-center text-white`}
            style={{ width: avatarSize, height: avatarSize }}
          >
            +{extraCount}
          </motion.div>
        )}
      </div>
    );
  }
);
