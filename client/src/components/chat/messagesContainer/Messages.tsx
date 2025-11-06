import React, { useEffect, useMemo } from "react";
import { ChatResponse } from "@/shared/types/responses/chat.response";
import {
  groupMessagesByDate,
  isRecentMessage,
  shouldShowInfo,
} from "@/common/utils/message/messageHelpers";
import { AnimatePresence } from "framer-motion";
import { getCurrentUser } from "@/stores/authStore";
import { MessageReadInfo } from "./MessageReadInfo";
import { useMessageStore } from "@/stores/messageStore";
import { MarkLastMessageRead } from "@/common/utils/message/markMessageRead";
import Message from "../components/message/Message";

interface ChatMessagesProps {
  chat: ChatResponse;
  messageIds: string[];
  isSearch: boolean;
}

const Messages: React.FC<ChatMessagesProps> = ({
  chat,
  messageIds,
  isSearch,
}) => {
  console.log("Messages render:", messageIds.length);

  const chatId = chat.id;
  const currentUser = getCurrentUser();

  const messagesById = useMessageStore.getState().messagesById;
  const messages = messageIds.map((id) => messagesById[id]).filter(Boolean);
  console.log("messages", messages);

  useEffect(() => {
    if (chat && messages.length > 0) {
      return MarkLastMessageRead({chat, messages});
    }
  }, [chat, messages]);

  // Group messageIds by date
  const groupedIdsByDate = useMemo(() => {
    return groupMessagesByDate(messages);
  }, [messages]);

  if (messageIds.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center opacity-50 italic text-xl">
        No messages yet!
      </div>
    );
  }

  return (
    <>
      {groupedIdsByDate.map((group) => {
        const groupKey = `${group.date}-${chatId}`;
        return (
          <React.Fragment key={groupKey}>
            {/* Sticky Date Header */}
            {!isSearch && (
              <div className="sticky top-0 flex justify-center z-[1]">
                <div className="bg-[var(--background-color)] text-xs p-1 rounded">
                  {group.date || "Today"}
                </div>
              </div>
            )}

            <AnimatePresence initial={false}>
              {group.messages.map((message, index) => {
                const isMe = message.sender.id === currentUser?.id;
                const prevMsg = group.messages[index - 1];
                const nextMsg = group.messages[index + 1];

                const showInfo = shouldShowInfo(message, nextMsg);
                const isRecent = isRecentMessage(message, prevMsg, nextMsg);

                return (
                  <div
                    key={message.id}
                    className={`flex flex-col ${
                      isMe ? "items-end" : "items-start"
                    }`}
                  >
                    <Message
                      messageId={message.id}
                      isMe={isMe}
                      showInfo={showInfo}
                      isRecent={isRecent}
                      chatType={chat.type}
                      currentUserId={currentUser?.id}
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
