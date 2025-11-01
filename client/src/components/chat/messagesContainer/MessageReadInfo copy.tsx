import React, { useMemo } from "react";
import clsx from "clsx";
import { useChatMemberStore } from "@/stores/chatMemberStore";
import { useShallow } from "zustand/shallow";
import { getCurrentUser } from "@/stores/authStore";
import { Avatar } from "@/components/ui/avatar/Avatar";
import type { ChatResponse } from "@/shared/types/responses/chat.response";

const maxAvatarDisplay = 9

interface MessageReadInfoProps {
  chat: ChatResponse;
  messageId: string;
  isMe: boolean;
  senderName: string;
}

export const MessageReadInfo: React.FC<MessageReadInfoProps> = React.memo(
  ({ chat, messageId, isMe, senderName }) => {
    const currentUser = getCurrentUser();

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

    if (readUserAvatars.length === 0) return null;

    return (
      <div
        className={clsx("flex items-center gap-0.5 -mt-5 mb-1 mx-0.5", {
          "justify-end": isMe,
          "justify-start": !isMe,
        })}
      >
        {readUserAvatars.slice(0, maxAvatarDisplay).map((avatarUrl, index) => (
          <Avatar
            key={index}
            avatarUrl={avatarUrl}
            name={senderName}
            size={4}
          />
        ))}

        {readUserAvatars.length > maxAvatarDisplay && (
          <div className="w-4 h-4 rounded-full bg-[--input-border-color] text-xs flex items-center justify-center text-white">
            {readUserAvatars.length - maxAvatarDisplay}
          </div>
        )}
      </div>
    );
  }
);
