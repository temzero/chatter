import React, { useMemo, useRef, useState, useEffect } from "react";
import clsx from "clsx";
import { useChatMemberStore } from "@/stores/chatMemberStore";
import { useShallow } from "zustand/shallow";
import { getCurrentUser } from "@/stores/authStore";
import { Avatar } from "@/components/ui/avatar/Avatar";
import type { ChatResponse } from "@/shared/types/responses/chat.response";

interface MessageReadInfoProps {
  chat: ChatResponse;
  messageId: string;
  isMe: boolean;
  senderName: string;
  avatarSize?: number; // in px
  gap?: number; // in px
}

export const MessageReadInfo: React.FC<MessageReadInfoProps> = React.memo(
  ({ chat, messageId, isMe, senderName, avatarSize = 4, gap = 0.5 }) => {
    const currentUser = getCurrentUser();
    const containerRef = useRef<HTMLDivElement>(null);
    const [visibleCount, setVisibleCount] = useState<number>(0);

    const readMembers = useChatMemberStore(
      useShallow((state) =>
        (state.chatMembers[chat.id] || []).filter(
          (m) => m.lastReadMessageId === messageId
        )
      )
    );

    const readUserAvatars = useMemo(() => {
      const avatars: string[] = [];

      // include current user
      const myMember = readMembers.find((m) => m.id === chat.myMemberId);
      if (myMember?.id === chat.myMemberId && currentUser?.avatarUrl) {
        avatars.push(currentUser.avatarUrl);
      }

      // include others
      for (const member of readMembers) {
        if (member.id !== chat.myMemberId && member.avatarUrl) {
          avatars.push(member.avatarUrl);
        }
      }

      return avatars;
    }, [readMembers, chat.myMemberId, currentUser?.avatarUrl]);

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
        className={clsx("flex items-center gap-0.5 -mt-7 mb-2 mx-0.5", {
          "justify-end": isMe,
          "justify-start": !isMe,
        })}
        style={{ maxWidth: "100%" }}
      >
        {readUserAvatars.slice(0, visibleCount).map((avatarUrl, index) => (
          <Avatar
            key={index}
            avatarUrl={avatarUrl}
            name={senderName}
            size={avatarSize}
          />
        ))}

        {extraCount > 0 && (
          <div
            className={`w-${avatarSize} aspect-square p-2 rounded-full bg-[--input-border-color] text-xs flex items-center justify-center text-white`}
            style={{ width: avatarSize, height: avatarSize }}
          >
            +{extraCount}
          </div>
        )}
      </div>
    );
  }
);
