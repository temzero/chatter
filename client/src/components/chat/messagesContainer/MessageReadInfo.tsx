import React, { useMemo, useRef, useState, useEffect } from "react";
import clsx from "clsx";
import { useChatMemberStore } from "@/stores/chatMemberStore";
import { useShallow } from "zustand/shallow";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { motion } from "framer-motion";
import { useReadInfo } from "@/stores/settingsStore";
import { MessageReadInfoOptions } from "@/shared/types/enums/message-setting.enum";

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
  ({ chatId, currentUserId, messageId, isMe, avatarSize = 4, gap = 0.5 }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [visibleCount, setVisibleCount] = useState<number>(0);

    const readInfoSetting = useReadInfo();

    const readMembers = useChatMemberStore(
      useShallow((state) =>
        (state.chatMembers[chatId] || []).filter(
          (m) => m.lastReadMessageId === messageId
        )
      )
    );

    // Filter read members based on readInfo setting
    const filteredReadMembers = useMemo(() => {
      if (readInfoSetting === MessageReadInfoOptions.NONE) {
        return [];
      }

      if (readInfoSetting === MessageReadInfoOptions.YOU) {
        // Only show current user if they've read the message
        return readMembers.filter((m) => m.userId === currentUserId);
      }

      if (readInfoSetting === MessageReadInfoOptions.OTHER) {
        // Show other users but not current user
        return readMembers.filter((m) => m.userId !== currentUserId);
      }

      // MessageReadInfo.ALL - show all users
      return readMembers;
    }, [readMembers, readInfoSetting, currentUserId]);

    const readMemberCount = filteredReadMembers.length;
    // Calculate how many avatars fit
    useEffect(() => {
      const calculateVisible = () => {
        if (!containerRef.current || readMemberCount === 0) return;
        const containerWidth = containerRef.current.offsetWidth;
        const totalWidth = avatarSize + gap; // avatar + gap
        const maxVisible = Math.floor(containerWidth / totalWidth);
        setVisibleCount(Math.min(maxVisible, readMemberCount));
      };

      calculateVisible();
      window.addEventListener("resize", calculateVisible);
      return () => window.removeEventListener("resize", calculateVisible);
    }, [readMemberCount, avatarSize, gap]);

    // Return null if no avatars to show or setting is NONE
    if (readMemberCount === 0) return null;

    const extraCount = readMemberCount - visibleCount;

    return (
      <div
        ref={containerRef}
        className={clsx(`flex items-center pt-1 gap-${gap}`, {
          "justify-end": isMe,
          "justify-start": !isMe,
        })}
      >
        {filteredReadMembers.slice(0, visibleCount).map((member, index) => (
          <motion.div
            key={`read-member-${index}`}
            layout
            initial={{ opacity: 0, scale: 0.8, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 5 }}
          >
            <Avatar
              avatarUrl={member.avatarUrl}
              name={member.firstName}
              size={avatarSize}
              textSize="text-[12px]"
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

MessageReadInfo.displayName = "MessageReadInfo";
