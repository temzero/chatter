import React, { useEffect, useMemo, useRef } from "react";
import { ChatResponse } from "@/shared/types/responses/chat.response";
import {
  flattenMessagesWithDates, // ✅ New helper
  isRecentMessage,
  shouldShowInfo,
} from "@/common/utils/message/messageHelpers";
import { AnimatePresence } from "framer-motion";
import { getCurrentUserId } from "@/stores/authStore";
import { useMessageStore } from "@/stores/messageStore";
import { MarkLastMessageRead } from "@/common/utils/message/markMessageRead";
import Message from "../components/message/Message";
import { useTranslation } from "react-i18next";
import DateHeader from "@/components/ui/messages/DateHeader"; // ✅ Import DateHeader
import { MessageResponse } from "@/shared/types/responses/message.response";

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
  console.log("[MOUNTED]", "Messages:", messageIds.length);
  const { t } = useTranslation();

  const chatId = chat.id;

  const currentUserId = getCurrentUserId();
  const messagesById = useMessageStore.getState().messagesById;
  const messages = messageIds.map((id) => messagesById[id]).filter(Boolean);

  // HANDLE PREVENT ENTER MESSAGE ANIMATION ON FIRST OPEN CHAT 
  // ✅ Store previous chat ID
  const prevChatIdRef = useRef(chatId);
  // ✅ Determine if this is initial load for THIS chat
  const isInitialChatLoad = useMemo(() => {
    const isNewChat = prevChatIdRef.current !== chatId;
    if (isNewChat) {
      prevChatIdRef.current = chatId;
      return true;
    }
    return false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId, messages.length]);

  // MARK AS READ
  useEffect(() => {
    if (chat && messages.length > 0) {
      return MarkLastMessageRead({ chat, messages });
    }
  }, [chat, messages]);

  // ✅ Flatten messages with date headers
  const flatItems = useMemo(() => {
    return flattenMessagesWithDates(messages);
  }, [messages]);

  if (!currentUserId) {
    console.error("[AUTH]", "Not authenticated");
    return null;
  }

  if (messageIds.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center opacity-50 italic text-xl select-none">
        {t("common.messages.no_messages_yet")}
      </div>
    );
  }

  return (
    <AnimatePresence initial={false}>
      {flatItems.map((item) => {
        if (item.type === "date") {
          // Render date header
          return !isSearch ? (
            <DateHeader key={item.id} date={item.data as string} />
          ) : null;
        } else {
          // Render message
          const message = item.data as MessageResponse;
          const isMe = message.sender.id === currentUserId;

          // Need context from previous/next messages for styling
          // We can find them from the flatItems array
          const currentIndex = flatItems.findIndex((i) => i.id === item.id);
          const prevItem = flatItems[currentIndex - 1];
          const nextItem = flatItems[currentIndex + 1];

          const prevMsg =
            prevItem?.type === "message"
              ? (prevItem.data as MessageResponse)
              : undefined;
          const nextMsg =
            nextItem?.type === "message"
              ? (nextItem.data as MessageResponse)
              : undefined;

          const showInfo = shouldShowInfo(message, nextMsg);
          const isRecent = isRecentMessage(message, prevMsg, nextMsg);

          return (
            <Message
              key={message.id}
              messageId={message.id}
              isMe={isMe}
              showInfo={showInfo}
              isRecent={isRecent}
              chatType={chat.type}
              currentUserId={currentUserId}
              disableAnimation={isInitialChatLoad}
            />
          );
        }
      })}
    </AnimatePresence>
  );
};

export default React.memo(Messages);
