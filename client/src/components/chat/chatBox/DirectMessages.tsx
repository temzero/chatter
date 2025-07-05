import React, { useMemo, useEffect } from "react";
import Message from "../Message";
import { MessageResponse } from "@/types/responses/message.response";
import { ChatResponse } from "@/types/responses/chat.response";
import { useCurrentUser } from "@/stores/authStore";
import {
  groupMessagesByDate,
  isRecentMessage,
  shouldShowInfo,
} from "@/utils/messageHelpers";
import { useActiveMembers } from "@/stores/chatMemberStore";
import { chatWebSocketService } from "@/lib/websocket/services/chat.websocket.service";

interface DirectMessagesProps {
  chat: ChatResponse;
  messages: MessageResponse[];
}

const DirectMessages: React.FC<DirectMessagesProps> = ({ chat, messages }) => {
  const chatId = chat?.id;
  const currentUser = useCurrentUser();

  const rawMembers = useActiveMembers();
  const members = useMemo(() => rawMembers || [], [rawMembers]);

  const myMember = useMemo(
    () => members.find((m) => m.id === chat.myMemberId),
    [members, chat.myMemberId]
  );

  const partnerMember = useMemo(
    () => members.find((m) => m.id !== chat.myMemberId),
    [members, chat.myMemberId]
  );

  const myLastReadMessageId = myMember?.lastReadMessageId ?? null;
  // console.log("myLastReadMessageId", myLastReadMessageId);
  const partnerLastReadMessageId = partnerMember?.lastReadMessageId ?? null;
  // console.log("partnerLastReadMessageId", partnerLastReadMessageId);
  // console.log("messages", messages);

  // Update last read when new messages arrive
  useEffect(() => {
    if (!chatId || !chat.myMemberId || messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    const lastMessageId = lastMessage.id;

    // Only mark as read if:
    // 1. The message is not from current user (you don't need to mark your own messages as read)
    // 2. It's actually unread
    const isUnread =
      myLastReadMessageId === null || lastMessage.id !== myLastReadMessageId;

    if (isUnread) {
      const timer = setTimeout(() => {
        chatWebSocketService.messageRead(
          chatId,
          chat.myMemberId,
          lastMessageId
        );
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [chatId, chat.myMemberId, messages, myLastReadMessageId, currentUser?.id]);

  const messagesByDate = useMemo(() => {
    return groupMessagesByDate(messages);
  }, [messages]);

  useEffect(() => {
    if (!partnerMember) return;

    // This will force a re-render when partner's lastRead updates
  }, [partnerMember, partnerMember?.lastReadMessageId]);

  if (messages.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center opacity-50 italic text-xl">
        No messages yet!
      </div>
    );
  }

  return (
    <>
      {messagesByDate.map((group) => (
        <React.Fragment key={`${group.date}-${chatId}`}>
          <div className={`sticky top-0 z-20 flex justify-center mb-4`}>
            <div className="bg-[var(--background-color)] text-xs p-1 rounded z-30">
              {group.date || "Today"}
            </div>
          </div>
          {group.messages.map((msg, index) => {
            const prevMsg = group.messages[index - 1];
            const nextMsg = group.messages[index + 1];
            const showInfo = shouldShowInfo(msg, prevMsg, nextMsg);
            const isRecent = isRecentMessage(msg, prevMsg, nextMsg);

            const readMarkers: string[] = [];
            if (msg.id === myLastReadMessageId && currentUser?.avatarUrl) {
              readMarkers.push(currentUser.avatarUrl);
            }
            if (
              msg.id === partnerLastReadMessageId &&
              partnerMember?.avatarUrl
            ) {
              readMarkers.push(partnerMember.avatarUrl);
            }

            return (
              <Message
                key={msg.id}
                message={msg}
                shouldAnimate={isRecent}
                showInfo={showInfo}
                isRecent={isRecent}
                readUserAvatars={readMarkers}
              />
            );
          })}
        </React.Fragment>
      ))}
    </>
  );
};

export default React.memo(DirectMessages);
