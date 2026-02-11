import React, { useEffect, useMemo } from "react";
import { ChatResponse } from "@/shared/types/responses/chat.response";
import {
  groupMessagesByDate,
  isRecentMessage,
  shouldShowInfo,
} from "@/common/utils/message/messageHelpers";
import { AnimatePresence } from "framer-motion";
import { getCurrentUserId } from "@/stores/authStore";
import { useMessageStore } from "@/stores/messageStore";
import { MarkLastMessageRead } from "@/common/utils/message/markMessageRead";
import Message from "../components/message/Message";
import { useTranslation } from "react-i18next";
import DateHeader from "@/components/ui/messages/DateHeader";

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

  // MARK AS READ
  useEffect(() => {
    if (chat && messages.length > 0) {
      return MarkLastMessageRead({ chat, messages });
    }
  }, [chat, messages]);

  // Group messageIds by date
  const messageGroupByDate = useMemo(() => {
    return groupMessagesByDate(messages);
  }, [messages]);

  if (!currentUserId) {
    console.error("[AUTH]", "Not authenticated");
    return;
  }

  if (messageIds.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center opacity-50 italic text-xl select-none">
        {t("common.messages.no_messages_yet")}
      </div>
    );
  }

  return (
    <>
      {messageGroupByDate.map((group) => {
        const groupKey = `${group.date}-${chatId}`;
        return (
          <div key={groupKey}>
            {/* Sticky Date Header */}
            {!isSearch && <DateHeader date={group.date} />}

            <AnimatePresence initial={false}>
              {group.messages.map((message, index) => {
                const isMe = message.sender.id === currentUserId;
                const prevMsg = group.messages[index - 1];
                const nextMsg = group.messages[index + 1];

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
                  />
                );
              })}
            </AnimatePresence>
          </div>
        );
      })}
    </>
  );
};

export default React.memo(Messages);
