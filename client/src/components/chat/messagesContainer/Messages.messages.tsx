import React, { useMemo, useEffect } from "react";
import { MessageResponse } from "@/shared/types/responses/message.response";
import { ChatResponse } from "@/shared/types/responses/chat.response";
import {
  groupMessagesByDate,
  isRecentMessage,
  shouldShowInfo,
} from "@/common/utils/message/messageHelpers";
import { chatWebSocketService } from "@/services/websocket/chat.websocket.service";
import { AnimatePresence } from "framer-motion";
import { getCurrentUser } from "@/stores/authStore";
import Message from "../components/message/Message";
import { MessageReadInfo } from "./MessageReadInfo";

interface ChatMessagesProps {
  chat: ChatResponse;
  messages: MessageResponse[];
}

const Messages: React.FC<ChatMessagesProps> = ({ chat, messages }) => {
  console.log("Messages render:", messages.length);

  const chatId = chat?.id;
  const currentUser = getCurrentUser();

  // ✅ Auto mark message as read
  useEffect(() => {
    if (!chatId || !chat.myMemberId || messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    const isFromOther = lastMessage.sender.id !== currentUser?.id;

    // Mark as read only if last message is from another user
    if (isFromOther) {
      const timer = setTimeout(() => {
        chatWebSocketService.messageRead(
          chatId,
          chat.myMemberId,
          lastMessage.id
        );
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [chatId, chat.myMemberId, messages, currentUser?.id]);

  const messagesByDate = useMemo(
    () => groupMessagesByDate(messages),
    [messages]
  );

  if (messages.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center opacity-50 italic text-xl">
        No messages yet!
      </div>
    );
  }

  return (
    <>
      {messagesByDate.map((group) => {
        const groupKey = `${group.date}-${chatId}`;
        return (
          <React.Fragment key={groupKey}>
            {/* Sticky Date Header */}
            <div className="sticky top-0 flex justify-center z-[1]">
              <div className="bg-[var(--background-color)] text-xs p-1 rounded">
                {group.date || "Today"}
              </div>
            </div>

            {/* ✅ AnimatePresence wraps entire message list */}
            <AnimatePresence initial={false}>
              {group.messages.map((message, index) => {
                const prevMsg = group.messages[index - 1];
                const nextMsg = group.messages[index + 1];
                const showInfo = shouldShowInfo(message, nextMsg);
                const isRecent = isRecentMessage(message, prevMsg, nextMsg);
                const isMe = message.sender.id === currentUser?.id;

                return (
                  <div
                    key={message.id}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                  >
                    <Message
                      messageId={message.id}
                      chatType={chat.type}
                      showInfo={showInfo}
                      isRecent={isRecent}
                      currentUserId={currentUser?.id || ""}
                      isMe={isMe}
                    />
                    <MessageReadInfo
                      chat={chat}
                      messageId={message.id}
                      isMe={isMe}
                      senderName={message.sender.displayName}
                    />
                  </div>
                );
              })}
            </AnimatePresence>
          </React.Fragment>
        );
      })}
    </>
  );
};

export default React.memo(Messages);
