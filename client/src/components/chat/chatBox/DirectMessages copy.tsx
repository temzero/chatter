import React, { useMemo, useEffect } from "react";
import Message from "../Message";
import { MessageResponse } from "@/types/messageResponse";
import { DirectChatResponse } from "@/types/chat";
import { useCurrentUser } from "@/stores/authStore";
// import { formatTime } from "@/utils/formatTime";
import {
  groupMessagesByDate,
  isRecentMessage,
  shouldShowInfo,
} from "@/utils/messageHelpers";
import { useChatMemberStore } from "@/stores/chatMemberStore";
import { chatWebSocketService } from "@/lib/websocket/services/chat.socket.service";

interface DirectMessagesProps {
  chat: DirectChatResponse;
  messages: MessageResponse[];
}

const DirectMessages: React.FC<DirectMessagesProps> = ({ chat, messages }) => {
  const chatId = chat?.id;
  const currentUser = useCurrentUser();
  const updateMemberLastRead = useChatMemberStore(
    (state) => state.updateMemberLastRead
  );

  // Update last read when new messages arrive (debounced)
  useEffect(() => {
    if (!chatId || !chat?.myMemberId || messages.length === 0) return;

    const lastMessageId = messages[messages.length - 1].id;
    updateMemberLastRead(chatId, chat.myMemberId, lastMessageId);

    // Debounced server update (only if messages are unread)
    const hasUnread =
      !chat.myLastReadAt ||
      new Date(messages[messages.length - 1].createdAt) >
        new Date(chat.myLastReadAt);

    if (hasUnread) {
      const timer = setTimeout(() => {
        chatWebSocketService.messageRead(chat?.myMemberId, lastMessageId);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [
    chatId,
    chat.myMemberId,
    messages,
    chat.myLastReadAt,
    updateMemberLastRead,
  ]);

  // Get last read times from store
  const myLastReadAt = chat.myLastReadAt;

  const partnerLastReadAt = chat.chatPartner.lastReadAt;

  // Find last read message IDs (optimized)
  const { myLastReadMessageId, partnerLastReadMessageId } = useMemo(() => {
    if (messages.length === 0)
      return { myLastReadMessageId: null, partnerLastReadMessageId: null };

    const flatMessages = [...messages].reverse();
    const findId = (timestamp?: string) =>
      timestamp
        ? flatMessages.find(
            (msg) => new Date(msg.createdAt) <= new Date(timestamp)
          )?.id || null
        : null;

    return {
      myLastReadMessageId: findId(myLastReadAt ?? undefined),
      partnerLastReadMessageId: findId(partnerLastReadAt ?? undefined),
    };
  }, [messages, myLastReadAt, partnerLastReadAt]);

  // Group messages by date
  const messagesByDate = useMemo(() => {
    return groupMessagesByDate(messages);
  }, [messages]);

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
          <div className="sticky -top-5 z-10 flex justify-center mb-4">
            <div className="bg-black bg-opacity-30 text-white text-xs p-1 rounded">
              {group.date || "Today"}
            </div>
          </div>
          {group.messages.map((msg, index) => {
            const prevMsg = group.messages[index - 1];
            const nextMsg = group.messages[index + 1];
            const showInfo = shouldShowInfo(msg, prevMsg, nextMsg);
            const isRecent = isRecentMessage(msg, prevMsg, nextMsg);

            // Determine read markers
            const readMarkers: string[] = [];
            if (msg.id === myLastReadMessageId && currentUser?.avatarUrl) {
              readMarkers.push(currentUser.avatarUrl);
            }
            if (
              msg.id === partnerLastReadMessageId &&
              chat.chatPartner.avatarUrl
            ) {
              readMarkers.push(chat.chatPartner.avatarUrl);
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
